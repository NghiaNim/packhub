from fastapi import APIRouter, HTTPException, status, Depends, Query
from datetime import datetime
import uuid
from typing import List, Optional
from app.models.travel_intent import TravelIntentCreate, TravelIntentResponse, TravelIntentUpdate
from app.utils.auth import get_current_user
from app.database import travel_intents_collection

router = APIRouter(prefix="/travel-intents", tags=["Travel Intents"])


@router.post("/", response_model=TravelIntentResponse, status_code=status.HTTP_201_CREATED)
async def create_travel_intent(
    intent_data: TravelIntentCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new travel intention."""
    user_id = current_user["id"]
    intent_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    # Create travel intent
    travel_intent = {
        "id": intent_id,
        "user_id": user_id,
        "destination": intent_data.destination,
        "start_date": intent_data.start_date,
        "end_date": intent_data.end_date,
        "flexible_dates": intent_data.flexible_dates,
        "description": intent_data.description,
        "trip_type": [t.value for t in intent_data.trip_type],
        "max_travelers": intent_data.max_travelers,
        "budget_range": intent_data.budget_range,
        "activities": intent_data.activities,
        "created_at": now,
        "updated_at": now,
        "is_active": True,
        "interested_users": [],
        "group_id": None
    }
    
    # Insert into database
    await travel_intents_collection.insert_one(travel_intent)
    
    # Return response
    return {
        **travel_intent,
        "interested_users_count": 0,
        "has_group": False
    }


@router.get("/", response_model=List[TravelIntentResponse])
async def get_travel_intents(
    destination: Optional[str] = None,
    start_date: Optional[datetime] = None,
    active_only: bool = True,
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """Get travel intentions with optional filtering."""
    # Build query
    query = {}
    
    if destination:
        query["destination"] = {"$regex": destination, "$options": "i"}
    
    if start_date:
        query["start_date"] = {"$gte": start_date}
    
    if active_only:
        query["is_active"] = True
    
    # Get travel intents
    cursor = travel_intents_collection.find(query).sort("created_at", -1).skip(skip).limit(limit)
    travel_intents = await cursor.to_list(length=limit)
    
    # Format response
    results = []
    for intent in travel_intents:
        results.append({
            **intent,
            "interested_users_count": len(intent.get("interested_users", [])),
            "has_group": intent.get("group_id") is not None
        })
    
    return results


@router.get("/{intent_id}", response_model=TravelIntentResponse)
async def get_travel_intent(
    intent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Get a specific travel intention by ID."""
    intent = await travel_intents_collection.find_one({"id": intent_id})
    
    if not intent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel intention not found"
        )
    
    return {
        **intent,
        "interested_users_count": len(intent.get("interested_users", [])),
        "has_group": intent.get("group_id") is not None
    }


@router.put("/{intent_id}", response_model=TravelIntentResponse)
async def update_travel_intent(
    intent_id: str,
    intent_update: TravelIntentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a travel intention."""
    user_id = current_user["id"]
    
    # Check if travel intent exists and belongs to user
    intent = await travel_intents_collection.find_one({"id": intent_id})
    
    if not intent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel intention not found"
        )
    
    if intent["user_id"] != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this travel intention"
        )
    
    # Prepare update data
    update_data = {}
    for field, value in intent_update.dict(exclude_unset=True).items():
        if field == "trip_type" and value is not None:
            update_data[field] = [t.value for t in value]
        else:
            update_data[field] = value
    
    # Update timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update in database
    if update_data:
        await travel_intents_collection.update_one(
            {"id": intent_id},
            {"$set": update_data}
        )
    
    # Get updated intent
    updated_intent = await travel_intents_collection.find_one({"id": intent_id})
    
    return {
        **updated_intent,
        "interested_users_count": len(updated_intent.get("interested_users", [])),
        "has_group": updated_intent.get("group_id") is not None
    }


@router.post("/{intent_id}/interest", response_model=TravelIntentResponse)
async def express_interest(
    intent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Express interest in a travel intention."""
    user_id = current_user["id"]
    
    # Check if travel intent exists
    intent = await travel_intents_collection.find_one({"id": intent_id})
    
    if not intent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel intention not found"
        )
    
    # Check if user is the creator
    if intent["user_id"] == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot express interest in your own travel intention"
        )
    
    # Check if user already expressed interest
    if user_id in intent.get("interested_users", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already expressed interest in this travel intention"
        )
    
    # Add user to interested users
    await travel_intents_collection.update_one(
        {"id": intent_id},
        {"$push": {"interested_users": user_id}}
    )
    
    # Get updated intent
    updated_intent = await travel_intents_collection.find_one({"id": intent_id})
    
    return {
        **updated_intent,
        "interested_users_count": len(updated_intent.get("interested_users", [])),
        "has_group": updated_intent.get("group_id") is not None
    }


@router.delete("/{intent_id}/interest", response_model=TravelIntentResponse)
async def remove_interest(
    intent_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Remove interest from a travel intention."""
    user_id = current_user["id"]
    
    # Check if travel intent exists
    intent = await travel_intents_collection.find_one({"id": intent_id})
    
    if not intent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Travel intention not found"
        )
    
    # Check if user expressed interest
    if user_id not in intent.get("interested_users", []):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have not expressed interest in this travel intention"
        )
    
    # Remove user from interested users
    await travel_intents_collection.update_one(
        {"id": intent_id},
        {"$pull": {"interested_users": user_id}}
    )
    
    # Get updated intent
    updated_intent = await travel_intents_collection.find_one({"id": intent_id})
    
    return {
        **updated_intent,
        "interested_users_count": len(updated_intent.get("interested_users", [])),
        "has_group": updated_intent.get("group_id") is not None
    } 