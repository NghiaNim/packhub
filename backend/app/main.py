from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import os
import logging
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("backpacker-api")

# Import routers directly from the routers package
from app.database import test_connection
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.travel_intents import router as travel_intents_router
from app.routers import chat  # Import our chat router

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="Backpacker Connect API",
    description="API for connecting backpackers and travelers",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(travel_intents_router)
app.include_router(chat.router)  # Add our chat router

@app.get("/")
async def root():
    return {"message": "Welcome to Backpacker Connect API"}

@app.get("/health")
async def health_check():
    db_connected = await test_connection()
    return {
        "status": "healthy" if db_connected else "unhealthy",
        "database_connected": db_connected
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 