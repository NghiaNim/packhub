from pydantic import BaseModel, EmailStr, Field, validator, HttpUrl
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from typing import ClassVar, Annotated, Any
import re
import uuid


class TravelStyle(str, Enum):
    BUDGET = "budget"
    MIDRANGE = "midrange"
    LUXURY = "luxury"


class TravelExperience(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERIENCED = "experienced"


class TravelPreferences(BaseModel):
    destinations: List[str] = []
    accommodation_types: List[str] = []
    travel_styles: List[str] = []
    budget_range: Optional[str] = None
    languages: List[str] = []


class EmergencyContact(BaseModel):
    name: str = ""
    relationship: str = ""
    phone_number: str = ""


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)

    @validator('username')
    def username_must_be_valid(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]{3,30}$', v):
            raise ValueError('Username must be 3-30 characters and contain only letters, numbers, underscores, or hyphens')
        return v


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

    @validator('password')
    def password_must_be_strong(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    bio: Optional[str] = Field(None, max_length=500)
    profile_picture: Optional[str] = None
    location: Optional[str] = None
    interests: List[str] = []
    travel_style: Optional[TravelStyle] = None
    experience_level: Optional[TravelExperience] = None
    languages: List[str] = []
    social_media: Optional[dict] = None
    profile_image: Optional[HttpUrl] = None
    travel_preferences: Optional[TravelPreferences] = None
    social_links: Dict[str, HttpUrl] = {}


class UserInDB(UserBase):
    id: str
    hashed_password: str
    profile: UserProfile = Field(default_factory=UserProfile)
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime


class UserResponse(UserBase):
    id: str
    profile: UserProfile
    is_verified: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    profile: Optional[UserProfile] = None


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class TokenData(BaseModel):
    user_id: Optional[str] = None


class PyObjectId(str):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not isinstance(v, str):
            raise TypeError('string required')
        # Validate if it's a proper UUID format
        try:
            uuid.UUID(v)
            return v
        except ValueError:
            raise ValueError("Invalid ID format")


class Trip(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    group_id: Optional[str] = None


class User(BaseModel):
    id: str
    email: EmailStr
    username: str
    full_name: str
    profile: Optional[UserProfile] = None
    is_active: bool = True

    def is_authenticated(self) -> bool:
        """Check if the user is authenticated"""
        return self.is_active

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {
            ObjectId: str,
            datetime: lambda dt: dt.isoformat()
        }
    }
    
    @classmethod
    def from_mongo(cls, data: Dict[str, Any]):
        """Convert MongoDB document to User model"""
        if not data:
            return None
            
        # Convert _id to id string
        if "_id" in data:
            data["id"] = str(data.pop("_id"))
            
        # Convert any other ObjectId fields
        for k, v in data.items():
            if isinstance(v, ObjectId):
                data[k] = str(v)
                
        return cls(**data)
        
    def to_mongo(self) -> Dict[str, Any]:
        """Convert User model to MongoDB document"""
        data = self.model_dump(by_alias=True, exclude={"id"})
        return data 