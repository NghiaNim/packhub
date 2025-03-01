from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from app.database import get_db
from pymongo.database import Database
from bson import ObjectId
from app.models.user import User, UserUpdate, UserProfile

router = APIRouter(
    prefix="/api/users",
    tags=["users"]
)

# Models for responses
class UserResponse(BaseModel):
    id: str
    name: str
    username: str
    email: str
    bio: str = ""
    profile_image_url: str = ""
    
class ProfileUpdateRequest(BaseModel):
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    phone_number: Optional[str] = None
    gender: Optional[str] = None

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Database = Depends(get_db)):
    """Get user details by ID"""
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Convert ObjectId to string for response
        user["id"] = str(user["_id"])
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user: {str(e)}"
        )

@router.put("/{user_id}/profile", response_model=UserResponse)
async def update_profile(
    user_id: str, 
    update_data: ProfileUpdateRequest, 
    db: Database = Depends(get_db)
):
    """Update user profile information"""
    try:
        # Check if user exists
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Build update dictionary with only provided fields
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        
        if update_dict:
            # Update the user document
            result = db.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_dict}
            )
            
            if result.modified_count == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Profile update failed"
                )
        
        # Get updated user
        updated_user = db.users.find_one({"_id": ObjectId(user_id)})
        updated_user["id"] = str(updated_user["_id"])
        
        return updated_user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )

@router.get("", response_model=List[UserResponse])
async def get_users(skip: int = 0, limit: int = 10, db: Database = Depends(get_db)):
    """Get a list of users with pagination"""
    try:
        users = list(db.users.find().skip(skip).limit(limit))
        
        # Convert ObjectIds to strings
        for user in users:
            user["id"] = str(user["_id"])
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving users: {str(e)}"
        ) 