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

async def analyze_user_photos(user_photo_paths: List[str]) -> Dict:
    """
    Analyze user photos to extract physical attributes for personalized fashion recommendations.
    
    Args:
        user_photo_paths: List of paths to user photos
    
    Returns:
        Dict: Dictionary containing extracted attributes (gender, age_range, body_type, skin_tone, etc.)
    """
    if not user_photo_paths:
        return {}
    
    # Prepare messages for the API call
    messages = [
        {
            "role": "system", 
            "content": """You are a fashion expert and personal stylist. Analyze the provided photos of a person to extract 
            physical attributes relevant for fashion recommendations. Be respectful, inclusive, and focus only on attributes 
            that would help with clothing recommendations. Provide your analysis in JSON format with the following fields:
            - gender_presentation: The apparent gender presentation (masculine, feminine, androgynous, etc.)
            - apparent_age_range: Estimated age range (e.g., "18-25", "25-35", "35-50", etc.)
            - body_type: Body shape and proportions (e.g., rectangle, hourglass, athletic, pear, apple, etc.)
            - height_impression: Impression of height (tall, average, petite)
            - skin_tone: General skin tone category (very fair, fair, medium, olive, tan, deep, etc.)
            - style_suggestions: 3-5 specific style suggestions based on the person's physical attributes
            - colors_to_complement: 3-5 color recommendations that would complement their skin tone and features
            - avoid_styles: 1-2 styles or cuts that might be less flattering for their body type
            """
        }
    ]
    
    # Add user photos
    for photo_path in user_photo_paths:
        with open(photo_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            
        messages.append({
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ]
        })
    
    # Add final instruction
    messages.append({
        "role": "user",
        "content": "Please analyze these photos and provide the attributes in JSON format as specified."
    })
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            max_tokens=800,
            temperature=0.5
        )
        
        response_text = response.choices[0].message.content.strip()
        
        # Try to extract JSON from the response
        try:
            # Find JSON object in the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                attributes = json.loads(json_str)
                print(f"Successfully extracted user attributes: {list(attributes.keys())}")
                return attributes
            else:
                print("Could not find JSON in user photo analysis response")
                return {}
                
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON from user photo analysis: {str(e)}")
            print(f"Response text: {response_text[:200]}...")
            return {}
            
    except Exception as e:
        print(f"Error analyzing user photos: {str(e)}")
        return {}

async def generate_search_query(user_input: Dict) -> Dict:
    """
    Generate fashion recommendations using OpenAI's API.
    
    Args:
        user_input: Dictionary containing:
            - additional_info: String with style preferences
            - budget: Price range (low/medium/high)
            - profile_photo_path: Path to user's profile photo
            - aesthetic_photo_paths: List of paths to inspiration/aesthetic photos
    
    Returns:
        Dict: Fashion recommendations in the format:
        {
            "style": "Style category name",
            "items": [
                {
                    "description": "Item description",
                    "category": "Item category"
                },
                ...
            ]
        }
    """
    # Extract user inputs
    additional_info = user_input.get("additional_info", "")
    budget = user_input.get("budget", "medium")
    profile_photo_path = user_input.get("profile_photo_path")
    aesthetic_photo_paths = user_input.get("aesthetic_photo_paths", [])
    
    # First, analyze user photo if provided
    user_attributes = {}
    if profile_photo_path:
        print("Analyzing profile photo...")
        user_attributes = await analyze_user_photos([profile_photo_path])
    
    # Prepare the prompt for OpenAI
    prompt = """As a fashion expert, analyze the provided information and generate fashion recommendations.
    
Please return your response in the following JSON format EXACTLY:
{
    "style": { 
        "title": "Minimalistic chic",
        "description": "Clean lines, neutral colors and timeless silhouettes",
        "tags": ["clean lines", "neutral palette", "timeless"],

    },
    "items": [
        {
            "description": "Detailed description of the recommended item",
            "category": "Category (must be one of: Tops, Bottoms, Dresses, Outerwear, Accessories)"
        },
        ...
    ]
}

Make sure to:
1. Include 4-6 items
2. Use the exact category names: Tops, Bottoms, Dresses, Outerwear, or Accessories
3. Make descriptions specific and detailed
4. Consider the provided budget level and style preferences
5. Return ONLY the JSON, no additional text

User preferences:
"""
    
    if additional_info:
        prompt += f"Style preferences: {additional_info}\n"
    
    if budget:
        prompt += f"Budget level: {budget}\n"
    
    if user_attributes:
        prompt += f"User attributes: {json.dumps(user_attributes, indent=2)}\n"
    
    if aesthetic_photo_paths:
        prompt += f"Number of inspiration photos provided: {len(aesthetic_photo_paths)}\n"
    
    # Prepare the messages for the API call
    messages = [
        {"role": "system", "content": "You are a fashion expert who provides specific and detailed clothing recommendations."},
        {"role": "user", "content": prompt}
    ]
    
    # Add user photo if provided
    if profile_photo_path:
        messages.append({
            "role": "user",
            "content": "I'm providing a photo of myself. Please analyze my body type, proportions, and overall appearance to recommend clothing that would be flattering for my physique."
        })
        
        with open(profile_photo_path, "rb") as image_file:
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
        has_images = (profile_photo_path is not None) or (len(aesthetic_photo_paths) > 0)
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
                recommendations = json.loads(json_str)
                
                # Validate the structure
                if "style" in recommendations and "items" in recommendations:
                    if "title" in recommendations["style"] and "description" in recommendations["style"] and "tags" in recommendations["style"]:
                        return recommendations
                    else:
                        print("Invalid style format in response, here's the response: ", json_str)
                
            # If we get here, the response wasn't in the correct format
            return {
                "style": {
                    "title": "Casual",
                    "description": "Casual style",
                    "tags": ["casual", "comfortable", "everyday"]
                },
                "items": [
                    {
                        "description": f"Fashion item matching {additional_info}",
                        "category": "Tops"
                    },
                    {
                        "description": f"Fashion item for {budget} budget",
                        "category": "Bottoms"
                    }
                ]
            }
                
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "style": {
                    "title": "Casual",
                    "description": "Casual style",
                    "tags": ["casual", "comfortable", "everyday"]
                },
                "items": [
                    {
                        "description": f"Fashion item matching {additional_info}",
                        "category": "Tops"
                    },
                    {
                        "description": f"Fashion item for {budget} budget",
                        "category": "Bottoms"
                    }
                ]
            }
            
    except Exception as e:
        print(f"Error calling OpenAI API: {str(e)}")
        # Fallback to a basic search query if API call fails
        return {
            "style": {
                    "title": "Casual",
                    "description": "Casual style",
                    "tags": ["casual", "comfortable", "everyday"]
                },
            "items": [
                {
                    "description": f"Fashion item matching {additional_info}",
                    "category": "Tops"
                },
                {
                    "description": f"Fashion item for {budget} budget",
                    "category": "Bottoms"
                }
            ]
        }
