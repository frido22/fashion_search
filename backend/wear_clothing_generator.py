import os
import base64
import requests
from PIL import Image
from io import BytesIO
import json
import replicate
from typing import Tuple, Optional

def virtual_try_on(base_image_path: str, clothing_text_description: str, api_token: str) -> Image.Image:
    """
    Generate an image of a person wearing a specific article of clothing by using Replicate's Flux model.
    
    Args:
        base_image_path (str): Path to the base image of a person
        api_token (str): Replicate API token
        
    Returns:
        PIL.Image.Image: The generated image of the person wearing the clothing
    """
    # Set the API token
    os.environ["REPLICATE_API_TOKEN"] = api_token
    
    # Read the images
    with open(base_image_path, "rb") as f:
        base_image_data = f.read()
    
    # Convert to base64 for the API
    base_image_base64 = base64.b64encode(base_image_data).decode('utf-8')    
    # Prepare the input for the Flux model
    prompt = """Generate a picture of this person wearing the following article of clothing. Put a giant smiley face emoji over the person's face. Clothing description: """ + clothing_text_description

    input = {
        "image": f"data:image/jpeg;base64,{base_image_base64}",
        "prompt": prompt,
        "guidance_scale": 7.5,
        "strength": 0.8,
        "num_inference_steps": 50
    }
    print(prompt)
    
    # Run the model using replicate
    output = replicate.run(
        "black-forest-labs/flux-dev",
        input=input
    )
    
    # Download the result image
    response = requests.get(output)
    if response.status_code == 200:
        return Image.open(BytesIO(response.content))
    else:
        raise Exception(f"Failed to download the generated image: {response.status_code}")


# Example usage of the function
if __name__ == "__main__":
    # Set your Replicate API token
    api_token = "some API key"
    os.environ["REPLICATE_API_TOKEN"] = api_token

    # Paths to the images
    base_image_path = "/Users/harshkumar/Desktop/MIT_Coding/Sundai/base_image.jpg"
    clothing_text_description = "a men's crewneck sweater. The sweater is a minimalist, elegant off-white or ivory color, knitted in a fine ribbed texture. It has a fitted silhouette with long sleeves and raglan shoulder seams that add subtle structure. The collar is a close-fitting crewneck with a neatly finished ribbed trim. The cuffs and hem are also ribbed, adding definition to the sleeves and bottom edge. The overall design is simple, timeless, and modern, with no visible branding or embellishments."
    # Call the function to get the result
    result_image = virtual_try_on(base_image_path, clothing_text_description, api_token)
    
    # Display the result
    result_image.show()
    
    # Optionally save the result
    result_image.save("fashion_result.jpg")
