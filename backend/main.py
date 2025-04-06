from fastapi import FastAPI, Request, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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

@app.get("/")
async def root():
    return {"message": "Welcome to Fashion Perplexity API"}

@app.post("/api/recommendations")
async def search_fashion(
    request: Request,
    additional_info: Optional[str] = Form(None),
    budget: Optional[str] = Form("medium")
):
    try:
        # Parse the form data
        form_data = await request.form()
        print(f"Received request with form data: {form_data}")
        
        # Extract fields
        additional_info = form_data.get("additional_info", "")
        budget = form_data.get("budget", "medium")
        
        print(f"Extracted fields: additional_info={additional_info}, budget={budget}")
        
        # Create temp directories for uploaded images if they don't exist
        temp_dir = os.path.join(os.path.dirname(__file__), "temp")
        profile_photos_dir = os.path.join(temp_dir, "profile_photos")
        aesthetic_photos_dir = os.path.join(temp_dir, "aesthetic_photos")
        
        os.makedirs(temp_dir, exist_ok=True)
        os.makedirs(profile_photos_dir, exist_ok=True)
        os.makedirs(aesthetic_photos_dir, exist_ok=True)
        
        # Process user photo (single photo)
        profile_photo_path = None
        if "profile_photo" in form_data and hasattr(form_data["profile_photo"], "filename"):
            photo = form_data["profile_photo"]
            file_path = os.path.join(profile_photos_dir, f"profile_photo_{photo.filename}")
            with open(file_path, "wb") as f:
                content = await photo.read()
                f.write(content)
            profile_photo_path = file_path
            print(f"Saved user photo to {file_path}")
        
        # Process inspiration/aesthetic photos (multiple photos)
        aesthetic_photo_paths = []
        index = 0
        while True:
            key = f"inspiration_images[{index}]"
            if key not in form_data or not hasattr(form_data[key], "filename"):
                break
            photo = form_data[key]
            file_path = os.path.join(aesthetic_photos_dir, f"inspiration_{photo.filename}")
            with open(file_path, "wb") as f:
                content = await photo.read()
                f.write(content)
            aesthetic_photo_paths.append(file_path)
            print(f"Saved inspiration photo to {file_path}")
            index += 1
        
        print(f"Processed 1 user photo and {len(aesthetic_photo_paths)} aesthetic photos")
        
        # Generate search queries using OpenAI
        user_input = {
            "additional_info": additional_info,
            "budget": budget,
            "profile_photo_path": profile_photo_path,
            "aesthetic_photo_paths": aesthetic_photo_paths
        }
        
        # Get fashion recommendations from OpenAI
        recommendations = await generate_search_query(user_input)
        
        # Clean up temporary files
        if profile_photo_path:
            try:
                os.remove(profile_photo_path)
                print(f"Removed temporary file: {profile_photo_path}")
            except Exception as e:
                print(f"Error removing temporary file {profile_photo_path}: {str(e)}")
        for path in aesthetic_photo_paths:
            try:
                os.remove(path)
                print(f"Removed temporary file: {path}")
            except Exception as e:
                print(f"Error removing temporary file {path}: {str(e)}")
        
        # Return the recommendations directly
        return recommendations
        
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
