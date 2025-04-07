# Fashion Perplexity

A personalized fashion recommendation platform that allows users to upload images reflecting their preferred fashion aesthetics, describe their desired style, and receive targeted fashion recommendations.

## Features

- Image upload for fashion preferences
- Style description form (skin color, gender, expression, etc.)
- AI-powered search command generation
- Real-time fashion recommendations
- Responsive user interface
- Category-based product search results
- Visual style generation with AI

## Tech Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: FastAPI, Python
- **AI Integration**: OpenAI's ChatGPT API, Hugging Face
- **Search Integration**: SerpApi, SearchAPI.io

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- Python (v3.9 or later)
- OpenAI API key
- SerpApi API key
- Hugging Face API key

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
   HUGGINGFACE_API_KEY=your_huggingface_api_key
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
│   │   ├── services/       # Service layer
│   │   │   ├── openai_service.py     # OpenAI integration
│   │   │   ├── serpapi_service.py    # SerpApi integration
│   │   │   ├── searchapi_service.py  # SearchAPI.io integration
│   │   │   └── huggingface_service.py # Hugging Face integration
│   │   └── utils/          # Utility functions
│   ├── requirements.txt    # Python dependencies
│   └── main.py             # FastAPI application entry point
└── frontend/               # Next.js frontend
    ├── components/         # React components
    ├── pages/              # Next.js pages
    │   ├── index.tsx       # Home page
    │   └── results.tsx     # Results page
    ├── services/           # API services
    │   ├── fashionService.ts # Fashion recommendations service
    │   └── searchService.ts  # Product search service
    ├── public/             # Static assets
    ├── styles/             # CSS styles
    └── package.json        # Node.js dependencies
```

## API Endpoints

### Backend

- `POST /api/recommendations` - Generate fashion recommendations based on user input
  - Accepts: profile photo, inspiration images, budget, additional info
  - Returns: style description and recommended items by category

- `POST /api/search` - Search for products based on a query
  - Accepts: query string
  - Returns: list of product results with descriptions, prices, and links

### Frontend Services

- `getFashionRecommendationsReal()` - Fetches fashion recommendations from the backend
- `getSearchResultsReal()` - Fetches product search results from the backend

## How It Works

1. Users upload their profile photo and inspiration images
2. Users provide additional style information and budget preferences
3. The backend processes the images and information using AI services
4. The system generates personalized fashion recommendations
5. For each recommended item, the system searches for real products
6. Results are displayed in a category-based tab interface
7. Users can view product details and visit product pages

## License

This project is licensed under the MIT License - see the LICENSE file for details.
