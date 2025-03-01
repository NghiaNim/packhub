from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.database import get_db
from pymongo.database import Database
from bson import ObjectId

router = APIRouter(
    prefix="/api/travel-intents",
    tags=["travel intents"]
)

# Models
class TravelIntentBase(BaseModel):
    user_id: str
    destination: str
    start_date: datetime
    end_date: datetime
    budget_range: str
    travel_style: str
    group_size: int
    description: Optional[str] = None
    activities: List[str] = []

class TravelIntentCreate(TravelIntentBase):
    pass

class TravelIntentResponse(TravelIntentBase):
    id: str
    created_at: datetime

@router.post("", response_model=TravelIntentResponse)
async def create_travel_intent(
    intent: TravelIntentCreate,
    db: Database = Depends(get_db)
):
    """Create a new travel intent (looking for travel companions)"""
    try:
        # Create new travel intent document
        travel_intent_data = intent.dict()
        travel_intent_data["created_at"] = datetime.utcnow()
        
        # Convert user_id string to ObjectId if needed
        try:
            travel_intent_data["user_id"] = ObjectId(travel_intent_data["user_id"])
        except Exception:
            # If conversion fails, keep as string
            pass
        
        # Insert into database
        result = db.travel_intents.insert_one(travel_intent_data)
        
        # Get the created document
        created_intent = db.travel_intents.find_one({"_id": result.inserted_id})
        
        # Convert IDs to strings for the response
        created_intent["id"] = str(created_intent["_id"])
        created_intent["user_id"] = str(created_intent["user_id"])
        
        return created_intent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating travel intent: {str(e)}"
        )

@router.get("", response_model=List[TravelIntentResponse])
async def get_travel_intents(
    destination: Optional[str] = None,
    start_date_after: Optional[datetime] = None,
    user_id: Optional[str] = None,
    skip: int = 0, 
    limit: int = 20,
    db: Database = Depends(get_db)
):
    """Get travel intents with optional filtering"""
    try:
        # Build filter
        filter_query = {}
        
        if destination:
            # Case-insensitive partial match for destination
            filter_query["destination"] = {"$regex": destination, "$options": "i"}
            
        if start_date_after:
            filter_query["start_date"] = {"$gte": start_date_after}
            
        if user_id:
            try:
                filter_query["user_id"] = ObjectId(user_id)
            except Exception:
                filter_query["user_id"] = user_id
        
        # Query with filter and pagination
        travel_intents = list(
            db.travel_intents.find(filter_query)
            .sort("created_at", -1)  # Most recent first
            .skip(skip)
            .limit(limit)
        )
        
        # Convert IDs to strings for response
        for intent in travel_intents:
            intent["id"] = str(intent["_id"])
            intent["user_id"] = str(intent["user_id"])
        
        return travel_intents
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving travel intents: {str(e)}"
        )

@router.get("/{intent_id}", response_model=TravelIntentResponse)
async def get_travel_intent(
    intent_id: str,
    db: Database = Depends(get_db)
):
    """Get a specific travel intent by ID"""
    try:
        # Convert ID string to ObjectId
        intent = db.travel_intents.find_one({"_id": ObjectId(intent_id)})
        
        if not intent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Travel intent not found"
            )
        
        # Convert IDs to strings for response
        intent["id"] = str(intent["_id"])
        intent["user_id"] = str(intent["user_id"])
        
        return intent
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving travel intent: {str(e)}"
        )

@router.delete("/{intent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_travel_intent(
    intent_id: str,
    db: Database = Depends(get_db)
):
    """Delete a travel intent"""
    try:
        # Delete the travel intent
        result = db.travel_intents.delete_one({"_id": ObjectId(intent_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Travel intent not found"
            )
        
        return None
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting travel intent: {str(e)}"
        ) 