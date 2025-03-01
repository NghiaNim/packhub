#!/bin/bash

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BOLD}${BLUE}BackpackerConnect Backend Setup${NC}"
echo "==============================="
echo ""

# Check if Python is installed
echo -e "${BOLD}Checking Python installation...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 is not installed. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d " " -f 2)
echo -e "Found Python ${GREEN}$PYTHON_VERSION${NC}"

# Check if pip is installed
echo -e "\n${BOLD}Checking pip installation...${NC}"
if ! command -v pip3 &> /dev/null; then
    echo -e "${RED}pip is not installed. Please install pip.${NC}"
    exit 1
fi
echo -e "Found ${GREEN}pip${NC}"

# Create virtual environment
echo -e "\n${BOLD}Setting up virtual environment...${NC}"
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists. Using existing environment.${NC}"
else
    echo -e "Creating new virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}Virtual environment created successfully.${NC}"
fi

# Activate virtual environment
echo -e "\n${BOLD}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}Virtual environment activated.${NC}"

# Install dependencies
echo -e "\n${BOLD}Installing dependencies...${NC}"
pip install -r requirements.txt
echo -e "${GREEN}Dependencies installed successfully.${NC}"

# Check if .env file exists
echo -e "\n${BOLD}Checking environment configuration...${NC}"
if [ -f ".env" ]; then
    echo -e "${YELLOW}Environment file (.env) already exists.${NC}"
else
    echo -e "Creating environment file..."
    cat > .env << EOF
# MongoDB Configuration
MONGODB_URI=mongodb+srv://ntn6039:gglZD6O4aXWGpDJL@cluster0.yuf9t.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGODB_USERNAME=ntn6039
MONGODB_PASSWORD=gglZD6O4aXWGpDJL
DB_NAME=backpacker_connect

# JWT Configuration
JWT_SECRET=your_secret_key_change_this_in_production

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo -e "${GREEN}Environment file created. ${YELLOW}Please update with your actual JWT secret and Gemini API key.${NC}"
fi

echo -e "\n${BOLD}${GREEN}Setup Complete!${NC}"
echo -e "\nTo run the application:"
echo -e "1. Make sure your MongoDB Atlas cluster is accessible"
echo -e "2. Update the .env file with your JWT secret and Gemini API key"
echo -e "3. Activate the virtual environment: ${BOLD}source venv/bin/activate${NC}"
echo -e "4. Run the server: ${BOLD}uvicorn app.main:app --reload${NC}"
echo -e "\nFor API documentation, visit: ${BOLD}http://localhost:8000/docs${NC}" 