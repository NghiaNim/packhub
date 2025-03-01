from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date


class ItineraryActivity(BaseModel):
    title: str = Field(..., min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    location: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    cost: Optional[float] = None
    notes: Optional[str] = None
    booking_info: Optional[Dict[str, Any]] = None


class ItineraryDay(BaseModel):
    date: date
    activities: List[ItineraryActivity] = []
    notes: Optional[str] = None


class ItineraryBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    destination: str
    start_date: date
    end_date: date
    is_ai_generated: bool = False


class ItineraryCreate(ItineraryBase):
    days: List[ItineraryDay] = []


class ItineraryInDB(ItineraryBase):
    id: str
    created_by: str
    group_id: Optional[str] = None
    days: List[ItineraryDay] = []
    created_at: datetime
    updated_at: datetime
    is_public: bool = False
    shared_with: List[str] = []


class ItineraryResponse(ItineraryBase):
    id: str
    created_by: str
    group_id: Optional[str] = None
    days: List[ItineraryDay]
    created_at: datetime
    is_public: bool
    shared_with: List[str]

    class Config:
        from_attributes = True


class ItineraryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    days: Optional[List[ItineraryDay]] = None
    is_public: Optional[bool] = None
    shared_with: Optional[List[str]] = None


class AIItineraryRequest(BaseModel):
    destination: str
    start_date: date
    end_date: date
    interests: List[str] = []
    budget_level: Optional[str] = None
    travel_style: Optional[str] = None
    special_requirements: Optional[str] = None 