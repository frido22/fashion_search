import os
import uuid
from fastapi import UploadFile
import aiofiles
from typing import Optional

# Create a temporary directory for uploaded images if it doesn't exist
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "temp")
os.makedirs(TEMP_DIR, exist_ok=True)

async def save_upload_file_temporarily(upload_file: UploadFile) -> Optional[str]:
    """
    Save an uploaded file to a temporary location.
    
    Args:
        upload_file: The uploaded file from FastAPI
        
    Returns:
        str: Path to the saved temporary file or None if saving failed
    """
    try:
        # Generate a unique filename to avoid collisions
        file_extension = os.path.splitext(upload_file.filename)[1] if upload_file.filename else ".jpg"
        temp_filename = f"{uuid.uuid4()}{file_extension}"
        temp_path = os.path.join(TEMP_DIR, temp_filename)
        
        # Save the file
        async with aiofiles.open(temp_path, 'wb') as out_file:
            content = await upload_file.read()
            await out_file.write(content)
            
        return temp_path
    except Exception as e:
        print(f"Error saving uploaded file: {str(e)}")
        return None
