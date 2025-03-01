from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from bson import ObjectId
from typing import ClassVar, Annotated, Any


class TravelStyle(str, Enum):
    BUDGET = "budget"
    MIDRANGE = "midrange"
    LUXURY = "luxury"


class TravelExperience(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    EXPERIENCED = "experienced"


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=2, max_length=100)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


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


class TokenData(BaseModel):
    user_id: Optional[str] = None


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_builder):
        return {"type": "string"}


class EmergencyContact(BaseModel):
    name: str = ""
    relationship: str = ""
    phone_number: str = ""


class TravelPreferences(BaseModel):
    accommodation_types: List[str] = []
    travel_styles: List[str] = []
    languages: List[str] = []


class Trip(BaseModel):
    destination: str
    start_date: datetime
    end_date: datetime
    group_id: Optional[str] = None


class User(BaseModel):
    id: Optional[str] = None
    name: str
    username: str
    email: EmailStr
    password: str
    bio: str = ""
    date_of_birth: Optional[datetime] = None
    gender: Optional[str] = None
    phone_number: str = ""
    profile_image_url: str = ""
    emergency_contact: EmergencyContact = Field(default_factory=EmergencyContact)
    travel_preferences: TravelPreferences = Field(default_factory=TravelPreferences)
    upcoming_trips: List[Trip] = []
    past_trips: List[Trip] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

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