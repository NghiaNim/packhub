from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any, Union
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage

router = APIRouter(
    prefix="/api/chat",
    tags=["chat"]
)

# Environment variable for Gemini API key
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("Warning: GEMINI_API_KEY not found in environment variables.")

# Initialize Langchain Gemini chat model
model = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.7,
    max_output_tokens=2048,
)

# Models
class MessagePayload(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[List[MessagePayload]] = None

class ChatResponse(BaseModel):
    response: str

# Format messages for Langchain
def format_messages(messages: List[MessagePayload]):
    formatted = []
    for msg in messages:
        if msg.role == "user":
            formatted.append(HumanMessage(content=msg.content))
        else:
            formatted.append(AIMessage(content=msg.content))
    return formatted

# Travel assistant system prompt
TRAVEL_ASSISTANT_PROMPT = """
You are a helpful travel assistant for BackpackerConnect, a platform that helps travelers find groups to travel with.
You can answer questions about destinations, travel tips, packing suggestions, local customs, and help users plan their trips.
Keep responses concise and focused on travel topics. Be friendly, supportive, and encouraging about group travel experiences.
"""

@router.post("", response_model=ChatResponse)
async def process_chat(request: ChatRequest):
    try:
        # Create system prompt
        system_prompt = AIMessage(content=TRAVEL_ASSISTANT_PROMPT)
        
        # Initialize message list with system prompt
        messages = [system_prompt]
        
        # Add context if provided
        if request.context and len(request.context) > 0:
            messages.extend(format_messages(request.context))
        
        # Add the current message if it's not already the last message in context
        if not request.context or request.context[-1].content != request.message:
            messages.append(HumanMessage(content=request.message))
        
        # Call Gemini via Langchain
        response = model.invoke(messages)
        
        return {"response": response.content}
    
    except Exception as e:
        print(f"Error processing chat: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing your request: {str(e)}"
        ) 