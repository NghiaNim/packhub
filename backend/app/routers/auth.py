from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from app.models.user import User, UserResponse
from app.database import get_db
from pymongo.database import Database
from bson import ObjectId
import json

router = APIRouter(
    prefix="/api/auth",
    tags=["authentication"]
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
JWT_SECRET = os.environ.get("JWT_SECRET", "your_secret_key_here")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION = 60 * 24 * 7  # One week in minutes

# Models
class UserRegister(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    token: str
    user: Dict[str, Any]

# Helper functions
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_jwt_token(user_id: str):
    payload = {
        "user_id": str(user_id),
        "exp": datetime.utcnow() + timedelta(minutes=JWT_EXPIRATION)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def serialize_mongo_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Convert MongoDB document to JSON-serializable dict"""
    if not doc:
        return {}
        
    serialized = {}
    for key, value in doc.items():
        if key == "_id":
            serialized["id"] = str(value)
        elif isinstance(value, ObjectId):
            serialized[key] = str(value)
        elif isinstance(value, datetime):
            serialized[key] = value.isoformat()
        else:
            serialized[key] = value
            
    return serialized

@router.post("/register", response_model=TokenResponse)
async def register_user(user_data: UserRegister, db: Database = Depends(get_db)):
    # Check if email already exists
    if db.users.find_one({"email": user_data.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if db.users.find_one({"username": user_data.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Hash the password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    new_user = {
        "name": user_data.name,
        "username": user_data.username,
        "email": user_data.email,
        "password": hashed_password,
        "bio": "",
        "profile_image_url": "",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Insert into database
    result = db.users.insert_one(new_user)
    
    # Create JWT token
    token = create_jwt_token(str(result.inserted_id))
    
    # Retrieve the created user
    created_user = db.users.find_one({"_id": result.inserted_id})
    
    # Convert MongoDB document to serializable dict
    user_dict = serialize_mongo_doc(created_user)
    
    # Remove password from response
    if "password" in user_dict:
        del user_dict["password"]
    
    return {
        "token": token,
        "user": user_dict
    }

@router.post("/login", response_model=TokenResponse)
async def login_user(user_data: UserLogin, db: Database = Depends(get_db)):
    # Find user by email
    user = db.users.find_one({"email": user_data.email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    token = create_jwt_token(str(user["_id"]))
    
    # Convert MongoDB document to serializable dict
    user_dict = serialize_mongo_doc(user)
    
    # Remove password from response
    if "password" in user_dict:
        del user_dict["password"]
    
    return {
        "token": token,
        "user": user_dict
    } 