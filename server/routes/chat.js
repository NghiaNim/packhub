const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { HumanMessage, AIMessage } = require('@langchain/core/messages');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Initialize Langchain Gemini chat model
const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-pro",
  maxOutputTokens: 2048,
  temperature: 0.7,
});

// Convert front-end message format to Langchain format
const formatMessages = (messages) => {
  return messages.map(msg => {
    if (msg.role === 'user') {
      return new HumanMessage(msg.content);
    } else {
      return new AIMessage(msg.content);
    }
  });
};

// Chat endpoint
router.post('/', auth, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // If no context is provided, just use the current message
    const messages = context && context.length > 0 
      ? formatMessages(context) 
      : [new HumanMessage(message)];
    
    // Add the current message if it's not already included in the context
    if (context && context.length > 0 && context[context.length - 1].content !== message) {
      messages.push(new HumanMessage(message));
    }

    // Call Gemini API through Langchain
    const response = await model.invoke(messages);
    
    res.json({ response: response.content });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ 
      message: 'Error processing your request',
      error: error.message
    });
  }
});

// Public endpoint (no auth required) for the ChatBot component
router.post('/public', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Travel assistant context
    const systemPrompt = new AIMessage(
      "You are a helpful travel assistant for BackpackerConnect, a platform that helps travelers find groups " +
      "to travel with. You can answer questions about destinations, travel tips, packing suggestions, " +
      "local customs, and help users plan their trips. Keep responses concise and focused on travel topics."
    );
    
    // If no context is provided, use system prompt + current message
    let messages = [systemPrompt];
    
    // Add context if provided
    if (context && context.length > 0) {
      messages = [systemPrompt, ...formatMessages(context)];
    }
    
    // Add the current message
    messages.push(new HumanMessage(message));

    // Call Gemini API through Langchain
    const response = await model.invoke(messages);
    
    res.json({ response: response.content });
  } catch (error) {
    console.error('Public Chat API error:', error);
    res.status(500).json({ 
      message: 'Error processing your request',
      error: error.message 
    });
  }
});

module.exports = router; 