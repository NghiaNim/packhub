from fastapi import APIRouter, HTTPException, status, Depends
from datetime import datetime
from app.models.user import UserResponse, UserUpdate
from app.utils.auth import get_current_user
from app.database import users_collection

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    """Get a user by ID."""
    user = await users_collection.find_one({"id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        username=user["username"],
        full_name=user["full_name"],
        profile=user["profile"],
        is_verified=user["is_verified"],
        created_at=user["created_at"]
    )


@router.put("/me", response_model=UserResponse)
async def update_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update current user profile."""
    user_id = current_user["id"]
    
    # Prepare update data
    update_data = {}
    if user_update.username is not None:
        # Check if username is already taken
        existing_user = await users_collection.find_one({"username": user_update.username})
        if existing_user and existing_user["id"] != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
        update_data["username"] = user_update.username
    
    if user_update.full_name is not None:
        update_data["full_name"] = user_update.full_name
    
    if user_update.profile is not None:
        # Update profile fields
        profile_data = user_update.profile.dict(exclude_unset=True)
        for field, value in profile_data.items():
            update_data[f"profile.{field}"] = value
    
    # Update timestamp
    update_data["updated_at"] = datetime.utcnow()
    
    # Update user in database
    if update_data:
        await users_collection.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
    
    # Get updated user
    updated_user = await users_collection.find_one({"id": user_id})
    
    return UserResponse(
        id=updated_user["id"],
        email=updated_user["email"],
        username=updated_user["username"],
        full_name=updated_user["full_name"],
        profile=updated_user["profile"],
        is_verified=updated_user["is_verified"],
        created_at=updated_user["created_at"]
    ) 