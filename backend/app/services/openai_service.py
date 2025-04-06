import os
import base64
from typing import Dict, Optional
import openai

# Initialize OpenAI client
openai.api_key = os.getenv("OPENAI_API_KEY")

async def generate_search_query(user_input: Dict) -> str:
    """
    Generate a search query for fashion recommendations using OpenAI's API.
    
    Args:
        user_input: Dictionary containing user inputs including style description,
                   skin color, gender, expression, and optional image path.
    
    Returns:
        str: Generated search query for SerpAPI
    """
    # Extract user inputs
    style_description = user_input.get("style_description", "")
    skin_color = user_input.get("skin_color", "")
    gender = user_input.get("gender", "")
    expression = user_input.get("expression", "")
    image_path = user_input.get("image_path")
    
    # Prepare the prompt for OpenAI
    prompt = f"""
    Create a precise search query for finding fashion items based on the following preferences:
    
    Style Description: {style_description}
    """
    
    if skin_color:
        prompt += f"\nSkin Color: {skin_color}"
    if gender:
        prompt += f"\nGender: {gender}"
    if expression:
        prompt += f"\nExpression/Mood: {expression}"
    
    # Prepare the messages for the API call
    messages = [
        {"role": "system", "content": "You are a fashion expert assistant. Your task is to generate a precise search query that will help find fashion items matching the user's preferences. The query should be concise and focused on retrieving relevant fashion recommendations."},
        {"role": "user", "content": prompt}
    ]
    
    # Add image if provided
    if image_path:
        with open(image_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": "Here's an image of my preferred fashion style. Please consider this when generating the search query."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]
        })
    
    # Call OpenAI API
    try:
        response = await openai.ChatCompletion.acreate(
            model="gpt-4-vision-preview",
            messages=messages,
            max_tokens=100
        )
        
        # Extract the generated search query
        search_query = response.choices[0].message.content.strip()
        
        return search_query
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        # Fallback to a basic search query if API call fails
        return f"fashion {style_description} {gender} {skin_color}".strip()
