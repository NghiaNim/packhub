from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    LOCATION = "location"
    FILE = "file"


class MessageBase(BaseModel):
    content: str = Field(..., max_length=2000)
    message_type: MessageType = MessageType.TEXT
    media_url: Optional[str] = None


class DirectMessageCreate(MessageBase):
    recipient_id: str


class GroupMessageCreate(MessageBase):
    group_id: str


class MessageInDB(MessageBase):
    id: str
    sender_id: str
    recipient_id: Optional[str] = None
    group_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_read: bool = False
    read_by: List[str] = []


class MessageResponse(MessageBase):
    id: str
    sender_id: str
    recipient_id: Optional[str] = None
    group_id: Optional[str] = None
    created_at: datetime
    is_read: bool
    read_by: List[str]

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    id: str
    participants: List[str]
    last_message: Optional[MessageResponse] = None
    unread_count: int
    updated_at: datetime

    class Config:
        from_attributes = True 