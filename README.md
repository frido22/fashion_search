# Fashion Perplexity

A personalized fashion recommendation platform that allows users to upload images reflecting their preferred fashion aesthetics, describe their desired style, and receive targeted fashion recommendations.

## Features

- Image upload for fashion preferences
- Style description form (skin color, gender, expression, etc.)
- AI-powered search command generation
- Real-time fashion recommendations
- Responsive user interface

## Tech Stack

- **Frontend**: Next.js
- **Backend**: FastAPI
- **AI Integration**: OpenAI's ChatGPT API
- **Search Integration**: SerpApi

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- OpenAI API key
- SerpApi API key

### Easy Installation

1. Clone the repository:
   ```
   git clone https://github.com/frido22/fashion_search.git
   cd fashion_search
   ```

2. Install backend dependencies:
   ```
   cd backend
   pip3 install -r requirements.txt
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Then edit the `.env` file and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   SERPAPI_API_KEY=your_serpapi_api_key
   ```

4. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```
   cd backend
   uvicorn main:app --reload
   ```
2. Start the frontend development server:
   ```
   cd frontend
   npm run dev
   ```
3. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
fashion_search/
├── backend/                # FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── core/           # Core functionality
│   │   ├── services/       # Service layer
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # FastAPI application entry point
└── frontend/               # Next.js frontend
    ├── components/         # React components
    ├── pages/              # Next.js pages
    ├── public/             # Static assets
    ├── styles/             # CSS styles
    └── package.json        # Node.js dependencies
