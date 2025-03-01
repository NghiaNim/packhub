import os
import logging
from pymongo import MongoClient
from pymongo.database import Database
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get MongoDB URI from environment variable
MONGODB_URI = os.environ.get("MONGODB_URI")
DB_NAME = os.environ.get("DB_NAME", "backpacker_connect")

if not MONGODB_URI:
    logging.warning("MONGODB_URI not found in environment variables. Using default connection string.")
    MONGODB_URI = "mongodb://localhost:27017"
    
logging.info(f"Connecting to database: {DB_NAME}")

try:
    # Create MongoDB client with a timeout to avoid hanging
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
    
    # Test connection
    client.admin.command('ping')
    logging.info("Successfully connected to MongoDB Atlas")
    
    # Get or create database
    db = client[DB_NAME]
    
    # Create collections if they don't exist
    if "users" not in db.list_collection_names():
        db.create_collection("users")
        db.users.create_index("email", unique=True)
        db.users.create_index("username", unique=True)
        logging.info("Created users collection with indexes")
    
    if "groups" not in db.list_collection_names():
        db.create_collection("groups")
        logging.info("Created groups collection")
    
    if "messages" not in db.list_collection_names():
        db.create_collection("messages")
        logging.info("Created messages collection")
        
    if "travel_intents" not in db.list_collection_names():
        db.create_collection("travel_intents")
        db.travel_intents.create_index([("destination", 1)])
        db.travel_intents.create_index([("user_id", 1)])
        db.travel_intents.create_index([("created_at", -1)])
        logging.info("Created travel_intents collection with indexes")
        
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {e}")
    raise

# Dependency to get database
def get_db() -> Database:
    """
    Dependency function to get the MongoDB database connection.
    Returns an instance of the database.
    """
    return db

async def test_connection():
    """Test the MongoDB connection."""
    try:
        # The ping command is lightweight and doesn't require auth
        client.admin.command('ping')
        logging.info("MongoDB connection is healthy")
        return True
    except Exception as e:
        logging.error(f"MongoDB connection failed: {e}")
        return False 