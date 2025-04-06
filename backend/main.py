from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import os
import json
from app.services.openai_service import generate_search_query
from app.services.serpapi_service import search_fashion_items
import shutil

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

class StyleRequest(BaseModel):
    style_description: Optional[str] = None
    skin_color: Optional[str] = None
    gender: Optional[str] = None
    expression: Optional[str] = None
    price_range: Optional[str] = "medium"

@app.get("/")
async def root():
    return {"message": "Welcome to Fashion Perplexity API"}

@app.post("/api/recommendations")
async def search_fashion(
    request: Request,
    style_description: Optional[str] = Form(None),
    skin_color: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    expression: Optional[str] = Form(None),
    price_range: Optional[str] = Form("medium")
):
    try:
        # Parse the form data
        form_data = await request.form()
        
        print(f"Received request with form data: {form_data}")
        
        # Extract style description (optional now)
        style_description = form_data.get("style_description", "")
        
        # Extract other form fields
        skin_color = form_data.get("skin_color", "")
        gender = form_data.get("gender", "")
        expression = form_data.get("expression", "")
        price_range = form_data.get("price_range", "medium")
        
        print(f"Extracted fields: style_description={style_description}, price_range={price_range}")
        
        # Create temp directories for uploaded images if they don't exist
        temp_dir = os.path.join(os.path.dirname(__file__), "temp")
        user_photos_dir = os.path.join(temp_dir, "user_photos")
        aesthetic_photos_dir = os.path.join(temp_dir, "aesthetic_photos")
        
        os.makedirs(temp_dir, exist_ok=True)
        os.makedirs(user_photos_dir, exist_ok=True)
        os.makedirs(aesthetic_photos_dir, exist_ok=True)
        
        # Process user photos
        user_photo_paths = []
        for key in form_data.keys():
            if key.startswith("user_photos") and hasattr(form_data[key], "filename") and form_data[key].filename:
                photo = form_data[key]
                file_path = os.path.join(user_photos_dir, f"user_photo_{photo.filename}")
                with open(file_path, "wb") as f:
                    content = await photo.read()
                    f.write(content)
                user_photo_paths.append(file_path)
                print(f"Saved user photo to {file_path}")
        
        # Process aesthetic photos
        aesthetic_photo_paths = []
        for key in form_data.keys():
            if key.startswith("aesthetic_photos") and hasattr(form_data[key], "filename") and form_data[key].filename:
                photo = form_data[key]
                file_path = os.path.join(aesthetic_photos_dir, f"aesthetic_photo_{photo.filename}")
                with open(file_path, "wb") as f:
                    content = await photo.read()
                    f.write(content)
                aesthetic_photo_paths.append(file_path)
                print(f"Saved aesthetic photo to {file_path}")
        
        print(f"Processed {len(user_photo_paths)} user photos and {len(aesthetic_photo_paths)} aesthetic photos")
        
        # Generate search queries using OpenAI
        user_input = {
            "style_description": style_description,
            "skin_color": skin_color,
            "gender": gender,
            "expression": expression,
            "price_range": price_range,
            "user_photo_paths": user_photo_paths,
            "aesthetic_photo_paths": aesthetic_photo_paths
        }
        
        search_queries = await generate_search_query(user_input)
        print(f"Generated search queries: {search_queries}")
        
        # Get categorized fashion recommendations from SerpAPI
        categorized_recommendations = await search_fashion_items(search_queries)
        
        # Print categorization results for debugging
        print(f"Categorized recommendations: {', '.join([f'{cat}: {len(items)}' for cat, items in categorized_recommendations.items()])}")
        
        # Clean up temporary files
        for path in user_photo_paths + aesthetic_photo_paths:
            try:
                os.remove(path)
                print(f"Removed temporary file: {path}")
            except Exception as e:
                print(f"Error removing temporary file {path}: {str(e)}")
        
        # Return the recommendations with category information
        return {
            "success": True,
            "search_queries_used": search_queries,
            "recommendations": categorized_recommendations
        }
        
    except Exception as e:
        import traceback
        print(f"Error in search_fashion: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(
            status_code=500,
            content={"success": False, "error": str(e)}
        )

# For backward compatibility
@app.post("/api/fashion-search")
async def fashion_search_legacy(request: Request):
    """Legacy endpoint that redirects to the new /api/recommendations endpoint"""
    return await search_fashion(request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
