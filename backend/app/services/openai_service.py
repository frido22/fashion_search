import os
import base64
from typing import Dict, Optional, List
from openai import OpenAI, AsyncOpenAI
import dotenv
import json

# Load environment variables explicitly
dotenv.load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

# Initialize OpenAI client
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY environment variable is not set")
    
client = AsyncOpenAI(api_key=api_key)

# Define clothing categories for diverse recommendations
CLOTHING_CATEGORIES = [
    "tops",
    "bottoms",
    "dresses",
    "outerwear",
    "shoes",
    "accessories"
]

async def generate_search_query(user_input: Dict) -> List[str]:
    """
    Generate targeted search queries for fashion recommendations using OpenAI's API.
    
    Args:
        user_input: Dictionary containing user inputs including style description,
                   skin color, gender, expression, price range, and optional image paths.
    
    Returns:
        List[str]: List of generated search queries for different clothing categories
    """
    # Extract user inputs
    style_description = user_input.get("style_description", "")
    skin_color = user_input.get("skin_color", "")
    gender = user_input.get("gender", "")
    expression = user_input.get("expression", "")
    price_range = user_input.get("price_range", "medium")
    user_photo_paths = user_input.get("user_photo_paths", [])
    aesthetic_photo_paths = user_input.get("aesthetic_photo_paths", [])
    
    # Prepare the prompt for OpenAI
    prompt = f"""
    As a fashion expert, create targeted search queries for finding fashion items based on the following preferences:
    
    Style Description: {style_description}
    """
    
    if skin_color:
        prompt += f"\nSkin Color: {skin_color}"
    if gender:
        prompt += f"\nGender: {gender}"
    if expression:
        prompt += f"\nExpression/Mood: {expression}"
    if price_range:
        prompt += f"\nPrice Range: {price_range} (low=budget, medium=mid-range, high=luxury)"
        
    prompt += """
    
    For each of the following clothing categories, generate ONE specific and targeted search query that will find high-quality fashion items matching the aesthetic described above:
    1. Tops (shirts, blouses, t-shirts, etc.)
    2. Bottoms (pants, skirts, shorts, etc.)
    3. Dresses or Full Outfits
    4. Outerwear (jackets, coats, etc.)
    5. Shoes
    6. Accessories (bags, jewelry, hats, etc.)
    
    For each category, focus on specific details like:
    - Fabric/material types
    - Specific styles or cuts
    - Color palettes
    - Patterns or textures
    - Brands or designers that match this aesthetic (if applicable)
    
    Format your response as a JSON object with the category names as keys and the search queries as values.
    Example:
    {
      "tops": "linen oversized button-down shirt neutral tones",
      "bottoms": "high-waisted wide-leg trousers earth tones",
      ...
    }
    """
    
    # Prepare the messages for the API call
    messages = [
        {"role": "system", "content": "You are a fashion expert assistant specializing in creating precise search queries that will help find fashion items matching specific aesthetics. Your queries should be detailed, specific, and focused on retrieving relevant fashion recommendations."},
        {"role": "user", "content": prompt}
    ]
    
    # Add user photos if provided
    if user_photo_paths and len(user_photo_paths) > 0:
        messages.append({
            "role": "user",
            "content": f"I'm providing {len(user_photo_paths)} photo(s) of myself. Please analyze my body type, proportions, and overall appearance to recommend clothing that would be flattering for my physique."
        })
        
        # Add each user photo as a separate message
        for photo_path in user_photo_paths:
            with open(photo_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            })
    
    # Add aesthetic photos if provided
    if aesthetic_photo_paths and len(aesthetic_photo_paths) > 0:
        messages.append({
            "role": "user",
            "content": f"I'm also providing {len(aesthetic_photo_paths)} photo(s) of fashion styles I like. Please analyze these images carefully and consider their colors, patterns, textures, silhouettes, and overall aesthetic when generating your search queries."
        })
        
        # Add each aesthetic photo as a separate message
        for photo_path in aesthetic_photo_paths:
            with open(photo_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                
            messages.append({
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            })
    
    # Call OpenAI API
    try:
        # Use gpt-4o for vision capabilities when images are provided
        # Use gpt-4o-mini when no images are provided (more cost-effective)
        has_images = (len(user_photo_paths) + len(aesthetic_photo_paths)) > 0
        model = "gpt-4o" if has_images else "gpt-4o-mini"
        
        response = await client.chat.completions.create(
            model=model,
            messages=messages,
            max_tokens=800,
            temperature=0.7
        )
        
        # Extract the generated search queries
        response_text = response.choices[0].message.content.strip()
        
        # Try to parse the JSON response
        try:
            # Find JSON object in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                queries_dict = json.loads(json_str)
                
                # Convert to list of queries
                search_queries = []
                for category in CLOTHING_CATEGORIES:
                    if category in queries_dict and queries_dict[category]:
                        search_queries.append(queries_dict[category])
                
                # If we couldn't extract any queries, use a fallback
                if not search_queries:
                    search_queries = [f"fashion {style_description} {gender} {skin_color}".strip()]
                
                return search_queries
            else:
                # Fallback if JSON not found
                return [f"fashion {style_description} {gender} {skin_color}".strip()]
                
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return [f"fashion {style_description} {gender} {skin_color}".strip()]
            
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        # Fallback to a basic search query if API call fails
        return [f"fashion {style_description} {gender} {skin_color}".strip()]
