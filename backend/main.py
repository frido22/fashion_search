from fastapi import FastAPI, UploadFile, File, Form, HTTPException
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
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
async def get_recommendations(
    style_description: str = Form(...),
    skin_color: Optional[str] = Form(None),
    gender: Optional[str] = Form(None),
    expression: Optional[str] = Form(None),
    image: Optional[UploadFile] = File(None)
):
    try:
        image_path = None
        if image:
            image_path = await save_upload_file_temporarily(image)
        
        # Combine user inputs
        user_input = {
            "style_description": style_description,
            "skin_color": skin_color,
            "gender": gender,
            "expression": expression,
            "image_path": image_path
        }
        
        # Generate search query using OpenAI
        search_query = await generate_search_query(user_input)
        
        # Get fashion recommendations using SerpAPI
        recommendations = await search_fashion_items(search_query)
        
        # Clean up temporary image if it was uploaded
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
            
        return JSONResponse(content={"recommendations": recommendations})
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
