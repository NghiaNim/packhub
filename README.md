# Backpacker Connect

A web application that connects backpackers and travelers who want to explore destinations together. Find travel companions, create groups, plan itineraries, and connect with like-minded travelers.

## Features

- User authentication and profile customization
- Post travel intentions and find matching travelers
- Create and join travel groups
- Direct messaging and group chats
- AI-assisted itinerary planning
- Social features (reviews, ratings, travel stories)

## Tech Stack

- **Frontend**: Next.js with TypeScript, Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT

## Project Structure

```
backpacker-connect/
├── src/                  # Next.js frontend
│   ├── app/              # App router pages
│   ├── components/       # React components
│   └── ...
├── backend/              # FastAPI backend
│   ├── app/              # API code
│   │   ├── main.py       # Main application
│   │   ├── database.py   # Database connection
│   │   ├── models/       # Pydantic models
│   │   ├── routes/       # API routes
│   │   └── ...
│   └── requirements.txt  # Python dependencies
└── ...
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- Python (v3.9+)
- MongoDB

### Frontend Setup

1. Navigate to the project directory:
   ```
   cd backpacker-connect
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Run the development server:
   ```
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backpacker-connect/backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Copy the example environment file:
   ```
   cp .env.example .env
   ```

5. Edit the `.env` file with your configuration.

6. Run the API server:
   ```
   uvicorn app.main:app --reload
   ```

7. API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

## License

MIT
