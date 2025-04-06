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
    
    # First, analyze user photos to extract physical attributes
    user_attributes = {}
    if user_photo_paths:
        print(f"Analyzing {len(user_photo_paths)} user photos...")
        user_attributes = await analyze_user_photos(user_photo_paths)
    
    # Prepare the prompt for OpenAI
    prompt = "As a fashion expert, create targeted search queries for finding fashion items based on the following preferences:\n"
    
    if style_description:
        prompt += f"\nStyle Description: {style_description}"
    else:
        prompt += "\nStyle Description: Not provided. Please use the uploaded photos and other information to determine style preferences."
    
    if skin_color:
        prompt += f"\nSkin Color: {skin_color}"
    if gender:
        prompt += f"\nGender: {gender}"
    if expression:
        prompt += f"\nExpression/Mood: {expression}"
    if price_range:
        prompt += f"\nPrice Range: {price_range} (low=budget, medium=mid-range, high=luxury)"
    
    # Add user attributes from photo analysis
    if user_attributes:
        prompt += "\n\nAttributes extracted from user photos:"
        
        if "gender_presentation" in user_attributes:
            prompt += f"\nGender Presentation: {user_attributes.get('gender_presentation')}"
        
        if "apparent_age_range" in user_attributes:
            prompt += f"\nAge Range: {user_attributes.get('apparent_age_range')}"
        
        if "body_type" in user_attributes:
            prompt += f"\nBody Type: {user_attributes.get('body_type')}"
        
        if "height_impression" in user_attributes:
            prompt += f"\nHeight Impression: {user_attributes.get('height_impression')}"
        
        if "skin_tone" in user_attributes:
            prompt += f"\nSkin Tone: {user_attributes.get('skin_tone')}"
        
        if "style_suggestions" in user_attributes:
            suggestions = user_attributes.get('style_suggestions', [])
            if isinstance(suggestions, list):
                prompt += f"\nStyle Suggestions: {', '.join(suggestions)}"
            else:
                prompt += f"\nStyle Suggestions: {suggestions}"
        
        if "colors_to_complement" in user_attributes:
            colors = user_attributes.get('colors_to_complement', [])
            if isinstance(colors, list):
                prompt += f"\nRecommended Colors: {', '.join(colors)}"
            else:
                prompt += f"\nRecommended Colors: {colors}"
        
        if "avoid_styles" in user_attributes:
            avoid = user_attributes.get('avoid_styles', [])
            if isinstance(avoid, list):
                prompt += f"\nStyles to Avoid: {', '.join(avoid)}"
            else:
                prompt += f"\nStyles to Avoid: {avoid}"
    
    # Add specific instructions for diverse clothing categories
    prompt += """
    
    Please create search queries for the following clothing categories:
    1. Tops (shirts, blouses, t-shirts, etc.)
    2. Bottoms (pants, jeans, shorts, skirts, etc.)
    3. Outerwear (jackets, coats, blazers, etc.)
    4. Shoes (sneakers, boots, sandals, etc.)
    5. Accessories (belts, bags, jewelry, etc.)
    
    Format each query to be specific and detailed, focusing on fit, color, and style.
    Ensure queries are diverse across categories and don't focus only on one type of clothing.
    
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
        {"role": "system", "content": "You are a fashion expert assistant specializing in creating precise search queries that will help find fashion items matching specific aesthetics. Your queries should be detailed, specific, and focused on retrieving relevant fashion recommendations that are personalized to the individual's body type, skin tone, and style preferences."},
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
