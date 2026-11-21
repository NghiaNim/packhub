from datetime import datetime
from typing import List, Optional, Dict, Any, Union
from bson import ObjectId
from fastapi import HTTPException, status

from app.database.mongodb import get_database
from app.models.messaging import (
    MessageInDB, 
    MessageCreate, 
    Message, 
    ConversationInDB, 
    ConversationCreate, 
    ConversationResponse,
    LastMessage,
    ParticipantInConversation,
    GroupInfo,
    MessageStatus
)
from app.services.user_service import get_user_by_id


async def get_conversation_by_id(conversation_id: str) -> Optional[ConversationInDB]:
    """Get a conversation by ID"""
    db = get_database()
    conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if conversation:
        return ConversationInDB(**conversation)
    return None


async def get_conversations_for_user(user_id: str) -> List[ConversationResponse]:
    """Get all conversations for a user"""
    db = get_database()
    conversations = await db.conversations.find(
        {"participants.user_id": user_id}
    ).to_list(length=50)
    
    result = []
    for conv in conversations:
        conv_obj = ConversationInDB(**conv)
        
        # Get participant details
        participants = []
        for participant in conv_obj.participants:
            user = await get_user_by_id(participant.user_id)
            if user:
                participants.append(user)
        
        # Get last message
        last_message = None
        last_msg = await db.messages.find(
            {"conversation_id": str(conv_obj.id)}
        ).sort("timestamp", -1).limit(1).to_list(length=1)
        
        if last_msg:
            last_msg_obj = MessageInDB(**last_msg[0])
            sender = await get_user_by_id(last_msg_obj.sender_id)
            sender_name = sender.name if sender else None
            
            # Check if message is read by current user
            is_read = False
            participant = next((p for p in conv_obj.participants if p.user_id == user_id), None)
            if participant and participant.last_read:
                is_read = last_msg_obj.timestamp <= participant.last_read
            
            last_message = LastMessage(
                content=last_msg_obj.content,
                timestamp=last_msg_obj.timestamp,
                sender_id=last_msg_obj.sender_id,
                sender_name=sender_name,
                is_read=is_read
            )
        
        # Count unread messages
        unread_count = 0
        participant = next((p for p in conv_obj.participants if p.user_id == user_id), None)
        if participant and participant.last_read:
            unread_query = {
                "conversation_id": str(conv_obj.id),
                "sender_id": {"$ne": user_id},
                "timestamp": {"$gt": participant.last_read}
            }
            unread_count = await db.messages.count_documents(unread_query)
        
        # Create response object
        conv_response = ConversationResponse(
            id=str(conv_obj.id),
            participants=participants,
            is_group=conv_obj.is_group,
            group_info=conv_obj.group_info,
            created_at=conv_obj.created_at,
            updated_at=conv_obj.updated_at,
            last_message=last_message,
            unread_count=unread_count
        )
        result.append(conv_response)
    
    # Sort by last message timestamp or creation date
    result.sort(
        key=lambda x: (
            x.last_message.timestamp if x.last_message else x.updated_at
        ),
        reverse=True
    )
    
    return result


async def get_messages_for_conversation(
    conversation_id: str, user_id: str, limit: int = 50, before: Optional[datetime] = None
) -> List[Message]:
    """Get messages for a conversation"""
    db = get_database()
    
    # Check if user is part of conversation
    conversation = await get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if user_id not in [p.user_id for p in conversation.participants]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not part of this conversation"
        )
    
    # Build query
    query = {"conversation_id": conversation_id}
    if before:
        query["timestamp"] = {"$lt": before}
    
    # Get messages
    messages_cursor = db.messages.find(query).sort("timestamp", -1).limit(limit)
    messages = await messages_cursor.to_list(length=limit)
    
    # Update last read timestamp for user
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id), "participants.user_id": user_id},
        {"$set": {"participants.$.last_read": datetime.utcnow()}}
    )
    
    return [Message(id=str(msg["_id"]), **{k: v for k, v in msg.items() if k != "_id"}) 
            for msg in messages]


async def get_or_create_direct_conversation(
    user1_id: str, user2_id: str
) -> ConversationInDB:
    """Get or create a direct conversation between two users"""
    db = get_database()
    
    # Check if conversation already exists
    existing = await db.conversations.find_one({
        "is_group": False,
        "participants.user_id": {"$all": [user1_id, user2_id]},
        "participants": {"$size": 2}
    })
    
    if existing:
        return ConversationInDB(**existing)
    
    # Create new conversation
    participants = [
        ParticipantInConversation(user_id=user1_id),
        ParticipantInConversation(user_id=user2_id)
    ]
    
    conversation = ConversationInDB(
        participants=participants,
        is_group=False
    )
    
    result = await db.conversations.insert_one(conversation.dict(by_alias=True))
    conversation.id = result.inserted_id
    
    return conversation


async def create_message(
    sender_id: str, conversation_id: str, content: str
) -> Message:
    """Create a new message"""
    db = get_database()
    
    # Verify conversation exists and user is part of it
    conversation = await get_conversation_by_id(conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    
    if sender_id not in [p.user_id for p in conversation.participants]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User not part of this conversation"
        )
    
    # Create and save message
    message = MessageInDB(
        content=content,
        sender_id=sender_id,
        conversation_id=conversation_id,
        status=MessageStatus.DELIVERED
    )
    
    result = await db.messages.insert_one(message.dict(by_alias=True))
    
    # Update conversation timestamp
    await db.conversations.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    return Message(id=str(result.inserted_id), **message.dict())


async def mark_messages_as_read(user_id: str, message_ids: List[str]) -> bool:
    """Mark messages as read"""
    db = get_database()
    
    # Verify user can access all messages
    messages = await db.messages.find({"_id": {"$in": [ObjectId(mid) for mid in message_ids]}}).to_list(None)
    
    if not messages:
        return False
    
    # Get unique conversation IDs
    conversation_ids = list(set(msg["conversation_id"] for msg in messages))
    
    # Check if user is part of all conversations
    for conv_id in conversation_ids:
        conversation = await get_conversation_by_id(conv_id)
        if not conversation or user_id not in [p.user_id for p in conversation.participants]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User not authorized to mark some messages as read"
            )
    
    # Update message status
    await db.messages.update_many(
        {"_id": {"$in": [ObjectId(mid) for mid in message_ids]}},
        {"$set": {"status": MessageStatus.READ}}
    )
    
    # Update last read timestamp for user in all conversations
    now = datetime.utcnow()
    for conv_id in conversation_ids:
        await db.conversations.update_one(
            {"_id": ObjectId(conv_id), "participants.user_id": user_id},
            {"$set": {"participants.$.last_read": now}}
        )
    
    return True


async def create_group_conversation(
    creator_id: str, name: str, participant_ids: List[str], image: Optional[str] = None
) -> ConversationInDB:
    """Create a new group conversation"""
    db = get_database()
    
    # Ensure creator is in the participant list
    if creator_id not in participant_ids:
        participant_ids.append(creator_id)
    
    # Create participants list
    participants = [
        ParticipantInConversation(user_id=user_id) 
        for user_id in participant_ids
    ]
    
    # Create group info
    group_id = str(ObjectId())
    group_info = GroupInfo(
        id=group_id,
        name=name,
        image=image
    )
    
    # Create conversation
    conversation = ConversationInDB(
        participants=participants,
        is_group=True,
        group_info=group_info
    )
    
    result = await db.conversations.insert_one(conversation.dict(by_alias=True))
    conversation.id = result.inserted_id
    
    return conversation 