from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from bson import ObjectId

from app.models.user import UserInDB


class PyObjectId(str):
    """Custom ObjectId class for proper MongoDB _id handling with Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, ObjectId):
            if not ObjectId.is_valid(v):
                raise ValueError("Invalid ObjectId format")
            v = ObjectId(v)
        return str(v)


class MessageStatus(str):
    """Message status enum"""
    SENDING = "sending"
    DELIVERED = "delivered"
    READ = "read"


class MessageBase(BaseModel):
    """Base message model"""
    content: str
    sender_id: str
    conversation_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: str = MessageStatus.DELIVERED


class MessageCreate(MessageBase):
    """Create message model"""
    pass


class MessageInDB(MessageBase):
    """Message in database model"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }


class Message(MessageBase):
    """Message API response model"""
    id: str
    
    class Config:
        orm_mode = True


class ParticipantInConversation(BaseModel):
    """Participant in conversation reference model"""
    user_id: str
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    last_read: Optional[datetime] = None


class GroupInfo(BaseModel):
    """Group conversation info model"""
    id: str
    name: str
    image: Optional[str] = None


class ConversationBase(BaseModel):
    """Base conversation model"""
    participants: List[ParticipantInConversation]
    is_group: bool = False
    group_info: Optional[GroupInfo] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ConversationCreate(BaseModel):
    """Create conversation model"""
    participant_ids: List[str]
    is_group: bool = False
    group_name: Optional[str] = None
    group_image: Optional[str] = None


class ConversationInDB(ConversationBase):
    """Conversation in database model"""
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        allow_population_by_field_name = True
        json_encoders = {
            ObjectId: str
        }


class LastMessage(BaseModel):
    """Last message in conversation model"""
    content: str
    timestamp: datetime
    sender_id: str
    sender_name: Optional[str] = None
    is_read: bool = False


class ConversationResponse(BaseModel):
    """Conversation API response model"""
    id: str
    participants: List[UserInDB]
    is_group: bool
    group_info: Optional[GroupInfo] = None
    created_at: datetime
    updated_at: datetime
    last_message: Optional[LastMessage] = None
    unread_count: int = 0

    class Config:
        orm_mode = True 