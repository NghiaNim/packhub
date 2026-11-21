from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.database import get_db
from pymongo.database import Database
from app.models.message import (
    MessageBase,
    DirectMessageCreate,
    GroupMessageCreate,
    MessageInDB,
    MessageResponse,
    ConversationResponse
)
from app.utils.auth import get_current_user
from app.models.user import UserResponse

router = APIRouter(
    prefix="/api/messages",
    tags=["messages"]
)

# Helper function to get a conversation by ID
async def get_conversation(db: Database, conversation_id: str):
    conversation = await db.conversations.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )
    return conversation

# Helper function to format a conversation for response
async def format_conversation_response(db: Database, conversation):
    # Get last message if available
    last_message = None
    if conversation.get("last_message_id"):
        last_message_doc = await db.messages.find_one({"_id": conversation["last_message_id"]})
        if last_message_doc:
            last_message = MessageResponse(
                id=str(last_message_doc["_id"]),
                content=last_message_doc["content"],
                message_type=last_message_doc["message_type"],
                media_url=last_message_doc.get("media_url"),
                sender_id=str(last_message_doc["sender_id"]),
                recipient_id=str(last_message_doc.get("recipient_id")) if last_message_doc.get("recipient_id") else None,
                group_id=str(last_message_doc.get("group_id")) if last_message_doc.get("group_id") else None,
                created_at=last_message_doc["created_at"],
                is_read=last_message_doc["is_read"],
                read_by=[str(user_id) for user_id in last_message_doc.get("read_by", [])]
            )
    
    # Return formatted conversation
    return ConversationResponse(
        id=str(conversation["_id"]),
        participants=[str(user_id) for user_id in conversation["participants"]],
        last_message=last_message,
        unread_count=conversation.get("unread_count", 0),
        updated_at=conversation.get("updated_at", datetime.utcnow())
    )

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all conversations for the current user"""
    try:
        # Find all conversations where the user is a participant
        user_id = ObjectId(current_user.id)
        conversations = await db.conversations.find(
            {"participants": user_id}
        ).sort("updated_at", -1).to_list(length=100)
        
        # Format conversations for response
        formatted_conversations = []
        for conv in conversations:
            formatted_conversations.append(await format_conversation_response(db, conv))
        
        return formatted_conversations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversations: {str(e)}"
        )

@router.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
async def get_conversation_messages(
    conversation_id: str,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all messages for a specific conversation"""
    try:
        # Check if conversation exists and user is a participant
        conversation = await get_conversation(db, conversation_id)
        user_id = ObjectId(current_user.id)
        
        if user_id not in conversation["participants"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this conversation"
            )
        
        # Get messages
        messages = await db.messages.find(
            {"conversation_id": ObjectId(conversation_id)}
        ).sort("created_at", 1).to_list(length=100)
        
        # Format messages for response
        formatted_messages = []
        for msg in messages:
            formatted_messages.append(MessageResponse(
                id=str(msg["_id"]),
                content=msg["content"],
                message_type=msg["message_type"],
                media_url=msg.get("media_url"),
                sender_id=str(msg["sender_id"]),
                recipient_id=str(msg.get("recipient_id")) if msg.get("recipient_id") else None,
                group_id=str(msg.get("group_id")) if msg.get("group_id") else None,
                created_at=msg["created_at"],
                is_read=msg["is_read"],
                read_by=[str(user_id) for user_id in msg.get("read_by", [])]
            ))
        
        # Mark all messages as read
        await db.messages.update_many(
            {
                "conversation_id": ObjectId(conversation_id),
                "sender_id": {"$ne": user_id},
                "read_by": {"$ne": user_id}
            },
            {"$addToSet": {"read_by": user_id}}
        )
        
        # Update conversation unread count
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"unread_count": 0}}
        )
        
        return formatted_messages
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve conversation messages: {str(e)}"
        )

@router.post("/direct", response_model=MessageResponse)
async def send_direct_message(
    message: DirectMessageCreate,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Send a direct message to another user"""
    try:
        # Check if recipient exists
        recipient = await db.users.find_one({"_id": ObjectId(message.recipient_id)})
        if not recipient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Recipient not found"
            )
        
        user_id = ObjectId(current_user.id)
        recipient_id = ObjectId(message.recipient_id)
        
        # Check if conversation exists or create a new one
        conversation = await db.conversations.find_one({
            "type": "direct",
            "participants": {"$all": [user_id, recipient_id]}
        })
        
        now = datetime.utcnow()
        
        if not conversation:
            # Create new conversation
            conversation = {
                "type": "direct",
                "participants": [user_id, recipient_id],
                "created_at": now,
                "updated_at": now,
                "unread_count": 1
            }
            conversation_id = (await db.conversations.insert_one(conversation)).inserted_id
        else:
            # Use existing conversation
            conversation_id = conversation["_id"]
            # Increment unread count for other participant
            await db.conversations.update_one(
                {"_id": conversation_id},
                {
                    "$inc": {"unread_count": 1},
                    "$set": {"updated_at": now}
                }
            )
        
        # Create message
        message_doc = {
            "content": message.content,
            "message_type": message.message_type,
            "media_url": message.media_url,
            "sender_id": user_id,
            "recipient_id": recipient_id,
            "conversation_id": conversation_id,
            "created_at": now,
            "updated_at": now,
            "is_read": False,
            "read_by": [user_id]  # Sender has read their own message
        }
        
        message_id = (await db.messages.insert_one(message_doc)).inserted_id
        
        # Update conversation with last message
        await db.conversations.update_one(
            {"_id": conversation_id},
            {"$set": {"last_message_id": message_id}}
        )
        
        # Return created message
        return MessageResponse(
            id=str(message_id),
            content=message.content,
            message_type=message.message_type,
            media_url=message.media_url,
            sender_id=current_user.id,
            recipient_id=message.recipient_id,
            created_at=now,
            is_read=False,
            read_by=[current_user.id]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send message: {str(e)}"
        )

@router.get("/unread-count", response_model=int)
async def get_unread_messages_count(
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Get the total count of unread messages for the current user"""
    try:
        user_id = ObjectId(current_user.id)
        
        # Get all user's conversations
        conversations = await db.conversations.find(
            {"participants": user_id}
        ).to_list(length=100)
        
        # Sum unread counts
        total_unread = sum(conv.get("unread_count", 0) for conv in conversations)
        
        return total_unread
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get unread message count: {str(e)}"
        )

@router.post("/mark-read/{conversation_id}")
async def mark_conversation_read(
    conversation_id: str,
    db: Database = Depends(get_db),
    current_user: UserResponse = Depends(get_current_user)
):
    """Mark all messages in a conversation as read"""
    try:
        # Check if conversation exists and user is a participant
        conversation = await get_conversation(db, conversation_id)
        user_id = ObjectId(current_user.id)
        
        if user_id not in conversation["participants"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a participant in this conversation"
            )
        
        # Mark messages as read
        result = await db.messages.update_many(
            {
                "conversation_id": ObjectId(conversation_id),
                "sender_id": {"$ne": user_id},
                "read_by": {"$ne": user_id}
            },
            {"$addToSet": {"read_by": user_id}}
        )
        
        # Reset unread count
        await db.conversations.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": {"unread_count": 0}}
        )
        
        return {"message": "Conversation marked as read", "messages_updated": result.modified_count}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to mark conversation as read: {str(e)}"
        ) 