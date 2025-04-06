from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import dotenv
from app.services.openai_service import generate_search_query
from app.services.serpapi_service import search_fashion_items
from app.utils.image_utils import save_upload_file_temporarily

# Load environment variables
dotenv.load_dotenv()

app = FastAPI(title="Fashion Perplexity API")

# Configure CORS
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Use environment variable for origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StyleRequest(BaseModel):
    description: str
    skin_color: Optional[str] = None
    gender: Optional[str] = None
    expression: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Welcome to Fashion Perplexity API"}

@app.post("/api/recommendations")
async def get_recommendations(request: Request):
    try:
        # Parse the form data
        form_data = await request.form()
        
        # Extract form fields
        style_description = form_data.get("style_description", "")
        skin_color = form_data.get("skin_color", "")
        gender = form_data.get("gender", "")
        expression = form_data.get("expression", "")
        price_range = form_data.get("price_range", "medium")  # Get price range with default as medium
        
        # Process user photos (photos of the person standing)
        user_photo_paths = []
        for key in form_data.keys():
            if key.startswith("user_photo_") and form_data[key].filename:
                photo = form_data[key]
                # Save the uploaded image to a temporary file
                photo_path = f"temp_user_{photo.filename}"
                with open(photo_path, "wb") as f:
                    f.write(await photo.read())
                user_photo_paths.append(photo_path)
        
        # Process aesthetic reference photos
        aesthetic_photo_paths = []
        for key in form_data.keys():
            if key.startswith("image_") and form_data[key].filename:
                photo = form_data[key]
                # Save the uploaded image to a temporary file
                photo_path = f"temp_aesthetic_{photo.filename}"
                with open(photo_path, "wb") as f:
                    f.write(await photo.read())
                aesthetic_photo_paths.append(photo_path)
        
        # Prepare user input for OpenAI
        user_input = {
            "style_description": style_description,
            "skin_color": skin_color,
            "gender": gender,
            "expression": expression,
            "user_photo_paths": user_photo_paths,
            "aesthetic_photo_paths": aesthetic_photo_paths,
            "price_range": price_range
        }
        
        # Generate search queries using OpenAI
        search_queries = await generate_search_query(user_input)
        
        # Modify search queries based on price range
        price_adjusted_queries = []
        for query in search_queries:
            if price_range == "low":
                price_adjusted_queries.append(f"{query} affordable budget")
            elif price_range == "high":
                price_adjusted_queries.append(f"{query} luxury premium")
            else:  # medium price range
                price_adjusted_queries.append(query)  # Keep as is for medium range
        
        # Get fashion recommendations using SerpAPI with price-adjusted queries
        recommendations = await search_fashion_items(price_adjusted_queries)
        
        # Clean up temporary image files if they were created
        for photo_path in user_photo_paths + aesthetic_photo_paths:
            if os.path.exists(photo_path):
                os.remove(photo_path)
        
        # Group recommendations by category based on search query
        categorized_recommendations = {}
        for item in recommendations:
            search_query = item.get("search_query", "")
            # Find which category this item belongs to based on the search query
            category = "other"
            for cat in ["tops", "bottoms", "dresses", "outerwear", "shoes", "accessories"]:
                if cat in search_query.lower():
                    category = cat
                    break
            
            if category not in categorized_recommendations:
                categorized_recommendations[category] = []
            
            categorized_recommendations[category].append(item)
        
        # Return the recommendations with category information
        return {
            "success": True,
            "recommendations": recommendations,
            "categorized_recommendations": categorized_recommendations,
            "search_queries": price_adjusted_queries
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
