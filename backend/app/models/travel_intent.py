from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime
from enum import Enum


class TripType(str, Enum):
    ADVENTURE = "adventure"
    CULTURAL = "cultural"
    RELAXATION = "relaxation"
    SIGHTSEEING = "sightseeing"
    FOOD_TOUR = "food_tour"
    NATURE = "nature"
    BEACH = "beach"
    CITY = "city"
    OTHER = "other"


class TravelIntentBase(BaseModel):
    destination: str = Field(..., min_length=2, max_length=100)
    start_date: date
    end_date: Optional[date] = None
    flexible_dates: bool = False
    description: Optional[str] = Field(None, max_length=1000)
    trip_type: List[TripType] = [TripType.ADVENTURE]
    max_travelers: Optional[int] = None
    budget_range: Optional[str] = None
    activities: List[str] = []


class TravelIntentCreate(TravelIntentBase):
    pass


class TravelIntentInDB(TravelIntentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    interested_users: List[str] = []
    group_id: Optional[str] = None


class TravelIntentResponse(TravelIntentBase):
    id: str
    user_id: str
    created_at: datetime
    interested_users_count: int
    has_group: bool

    class Config:
        from_attributes = True


class TravelIntentUpdate(BaseModel):
    destination: Optional[str] = Field(None, min_length=2, max_length=100)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    flexible_dates: Optional[bool] = None
    description: Optional[str] = Field(None, max_length=1000)
    trip_type: Optional[List[TripType]] = None
    max_travelers: Optional[int] = None
    budget_range: Optional[str] = None
    activities: Optional[List[str]] = None
    is_active: Optional[bool] = None 