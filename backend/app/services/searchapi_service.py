import os
import httpx
from typing import Dict, List, Any
import json
from openai import AsyncOpenAI

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

SEARCHAPI_BASE_URL = "https://www.searchapi.io/api/v1/search"
SEARCHAPI_KEY = os.getenv("SERPAPI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

openaiClient = AsyncOpenAI(api_key=OPENAI_API_KEY)

class Product(BaseModel):
    description: str = Field(...)
    price: str = Field(...)
    thumbnailURL: str = Field(...)
    productURL: str = Field(...)

class StyleResponse(BaseModel):
    products: List[Product] = Field(...)

async def search_products(query: str) -> List[Dict[str, Any]]:
    """
    Search for products using SearchAPI.io and process results with OpenAI
    
    Args:
        query: Search query string
    
    Returns:
        List[Dict]: List of product recommendations in the format:
        [
            {
                "description": str,
                "price": str,
                "thumbnailURL": str,
                "productURL": str
            },
            ...
        ]
    """
    
    if not SEARCHAPI_KEY:
        raise ValueError("SEARCHAPI_KEY environment variable is not set")
        
    if not OPENAI_API_KEY:
        raise ValueError("OPENAI_API_KEY environment variable is not set")

    params = {
        "engine": "google",
        "q": f"{query} shopping",
        "google_domain": "google.com",
        "gl": "us",
        "hl": "en",
        "api_key": SEARCHAPI_KEY
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SEARCHAPI_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()

            shopping_results = data.get("shopping_results", [])
            organic_results = data.get("organic_results", [])
            
            print('shopping_results', shopping_results)
            print('organic_results', organic_results)
            
            
            # Combine both types of results
            all_results = organic_results + shopping_results

            # Use OpenAI to extract product information
            if all_results:
                prompt = f"""Extract product information from these search results. For each product, provide:
                1. A clear description
                2. The price (if available)
                3. The thumbnail URL (if available)
                4. The product URL

                Return EXACTLY 5 products in this JSON format:
                {{
                    "products": [
                        {{
                            "description": "product description",
                            "price": "price",
                            "thumbnailURL": "url to thumbnail",
                            "productURL": "url to product"
                        }},
                        ...
                    ]
                }}

                Search results:
                {json.dumps(all_results[:1], indent=2)}
                """                            
                
                response = await openaiClient.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {"role": "system", "content": "You are a helpful assistant that extracts product information from search results."},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    response_format={"type": "json_object"}
                )

                try:
                    print('response.choices[0].message.content', response.choices[0].message.content)
                    extracted_data = json.loads(response.choices[0].message.content)
                    print('extracted_data', extracted_data)
                    return extracted_data.get("products", [])[:5]  # Ensure we return at most 5 products
                except json.JSONDecodeError:
                    print("Failed to parse OpenAI response")
                    return []

            return []

    except httpx.RequestError as e:
        print(f"Error making request to SearchAPI.io: {str(e)}")
        return []
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return [] 