import os
import httpx
from typing import Dict, List, Any
import json
import traceback

from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv()

SEARCHAPI_BASE_URL = "https://serpapi.com/search"
SEARCHAPI_KEY = os.getenv("SERPAPI_API_KEY")

class Product(BaseModel):
    description: str = Field(...)
    price: str = Field(...)
    thumbnailURL: str = Field(...)
    productURL: str = Field(...)

class StyleResponse(BaseModel):
    products: List[Product] = Field(...)

async def search_products(query: str) -> List[Dict[str, Any]]:
    """
    Search for products using SearchAPI.io
    
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
    
    params = {
        "q": query + " fashion clothing",
        "api_key": SEARCHAPI_KEY,
        "engine": "google",
        "google_domain": "google.com",
        "gl": "us",
        "hl": "en",
        "tbm": "shop",  # Shopping results
        "num": 5 * 2  # Request more results to ensure we have enough after filtering
    }
    
    try:
        print(f"Sending SerpAPI request for query: '{query}'")
        async with httpx.AsyncClient(timeout=30.0) as client:  # Increased timeout
            response = await client.get(SEARCHAPI_BASE_URL, params=params)
            
            # Log response status
            print(f"SerpAPI response status: {response.status_code}")
            
            # Try to get response content even if status code indicates error
            response_text = response.text
            
            # Raise for HTTP errors
            response.raise_for_status()
            
            # Parse JSON response
            try:
                data = response.json()
            except Exception as json_err:
                print(f"Failed to parse JSON response: {str(json_err)}")
                print(f"Response text: {response_text[:500]}...")  # Print first 500 chars
                return []
            
            # Check for error in response
            if "error" in data:
                print(f"SerpAPI returned error: {data['error']}")
                return []
            
            # Extract shopping results
            shopping_results = data.get("shopping_results", [])
            
            if not shopping_results:
                print(f"No shopping results found for query: '{query}'")
                print(f"Response keys: {list(data.keys())}")
                print(f"Response: {data}")
            
            # Process and format the results
            recommendations = []
            for item in shopping_results:
                # Extract the correct product link
                product_link = item.get("link", "")
                
                # If there's no link, try to get it from other fields
                if not product_link:
                    # Try to get from product_link field (sometimes SerpAPI uses this field)
                    product_link = item.get("product_link", "")
                    
                    # If still no link, try to get from the source with the title
                    if not product_link and item.get("source") and item.get("title"):
                        source = item.get("source", "").lower()
                        # Create a search URL based on the source
                        if "amazon" in source:
                            product_link = f"https://www.amazon.com/s?k={item.get('title', '').replace(' ', '+')}"
                        elif "ebay" in source:
                            product_link = f"https://www.ebay.com/sch/i.html?_nkw={item.get('title', '').replace(' ', '+')}"
                        elif "etsy" in source:
                            product_link = f"https://www.etsy.com/search?q={item.get('title', '').replace(' ', '+')}"
                        elif "walmart" in source:
                            product_link = f"https://www.walmart.com/search?q={item.get('title', '').replace(' ', '+')}"
                        elif "target" in source:
                            product_link = f"https://www.target.com/s?searchTerm={item.get('title', '').replace(' ', '+')}"
                
                # If the link doesn't start with http or https, add it
                if product_link and not (product_link.startswith("http://") or product_link.startswith("https://")):
                    product_link = "https://" + product_link
                
                # Check if the link is valid
                if product_link:
                    # Clean up the URL - remove any problematic characters
                    product_link = product_link.strip()
                    # Ensure there are no spaces in the URL
                    product_link = product_link.replace(" ", "%20")
                else:
                    print(f"No product link found for item: {item.get('title', '')[:30]}...")
                
                # Add the search query that found this item
                recommendation = {
                    "description": item.get("title", ""),
                    "productURL": product_link,
                    "price": item.get("price", ""),
                    "thumbnailURL": item.get("thumbnail", ""),
                    "rating": item.get("rating", None),
                }
                recommendations.append(recommendation)
            
            print(f"Found {len(recommendations)} recommendations for query: '{query}'")
            
            # Limit to requested number of results
            return recommendations[:10]
    except httpx.TimeoutException:
        print(f"Timeout error for SerpAPI query '{query}': Request timed out")
        return []
    except httpx.RequestError as e:
        print(f"Request error for SerpAPI query '{query}': {str(e)}")
        return []
    except httpx.HTTPStatusError as e:
        print(f"HTTP error for SerpAPI query '{query}': {e.response.status_code} - {str(e)}")
        print(f"Response content: {e.response.text[:500]}...")  # Print first 500 chars
        return []
    except Exception as e:
        print(f"Unexpected error for SerpAPI query '{query}': {str(e)}")
        print(f"Error details: {traceback.format_exc()}")
        return []