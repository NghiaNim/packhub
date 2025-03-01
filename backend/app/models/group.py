from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime
from enum import Enum


class GroupMemberRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"


class GroupMember(BaseModel):
    user_id: str
    role: GroupMemberRole
    joined_at: datetime


class GroupBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    destination: str
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_members: Optional[int] = None
    is_private: bool = False
    travel_intent_id: Optional[str] = None


class GroupCreate(GroupBase):
    pass


class GroupInDB(GroupBase):
    id: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    members: List[GroupMember] = []
    is_active: bool = True
    itinerary_id: Optional[str] = None


class GroupResponse(GroupBase):
    id: str
    created_by: str
    created_at: datetime
    members: List[GroupMember]
    member_count: int
    is_active: bool

    class Config:
        from_attributes = True


class GroupUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    destination: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    max_members: Optional[int] = None
    is_private: Optional[bool] = None
    is_active: Optional[bool] = None
    itinerary_id: Optional[str] = None 