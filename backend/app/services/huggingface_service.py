import os
import dotenv
from huggingface_hub import InferenceClient
from typing import Dict
from io import BytesIO
import time

# Load environment variables
dotenv.load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Initialize HuggingFace client
api_key = os.getenv("HUGGINGFACE_API_KEY")
if not api_key:
    raise ValueError("HUGGINGFACE_API_KEY environment variable is not set")

client = InferenceClient(
    provider="nebius",
    api_key=api_key,
)

async def generate_style_image(recommendations: Dict) -> bytes:
    """
    Generate an image based on fashion recommendations.
    
    Args:
        recommendations: Dictionary containing style and items recommendations
        
    Returns:
        bytes: Generated image in bytes format
    """
    # Flatten the recommendations into a prompt
    style = recommendations["style"]
    items = recommendations["items"]
    
    prompt = f"A fashion outfit in {style['title']} style. {style['description']}. "
    prompt += "The outfit includes: "
    prompt += ", ".join([item["description"] for item in items])
    prompt += f". Style tags: {', '.join(style['tags'])}."
    
    # Generate the image
    print(f"Generating image with prompt: {prompt}")
    image = client.text_to_image(
        prompt,
        model="black-forest-labs/FLUX.1-dev",
    )
    print("Image generated successfully")
    
    # Convert PIL image to bytes
    img_byte_arr = BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr.seek(0)  # Move to the beginning of BytesIO object
    print(f"Image converted to bytes, size: {len(img_byte_arr.getvalue())} bytes")
    
    # Save a copy to disk for debugging
    output_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'temp', 'generated_images')
    os.makedirs(output_dir, exist_ok=True)
    image_path = os.path.join(output_dir, f'style_image_{int(time.time())}.png')
    image.save(image_path)
    print(f"Debug image saved to: {image_path}")
    
    return img_byte_arr.getvalue()