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

async def extract_product_image_url(product_url: str) -> str:
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1"
        }
        
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            try:
                response = await client.get(product_url, headers=headers)
                response.raise_for_status()
                html_content = response.text
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 403:
                    return ""
                raise
            
            messages = [
                {
                    "role": "system", 
                    "content": """You are a web scraping expert. Extract the main product image URL from the provided HTML content.
                    Return ONLY the direct URL to the main product image. If multiple images are found, return the URL of the most prominent one.
                    If no image URL is found, return an empty string."""
                },
                {
                    "role": "user", 
                    "content": f"Extract the main product image URL from this HTML content: {html_content[:15000]}"
                }
            ]
            
            response = await openaiClient.chat.completions.create(
                model="gpt-4o-mini",
                messages=messages,
                max_tokens=100,
                temperature=0.1
            )
            
            image_url = response.choices[0].message.content.strip()
            
            if image_url.startswith('"') and image_url.endswith('"'):
                image_url = image_url[1:-1]
            
            return image_url
            
    except Exception as e:
        return ""

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
            
            all_results = organic_results + shopping_results
            
            products = []

            for result in all_results[:5]:
                price = "N/A"
                if "rich_snippet" in result and "extensions" in result["rich_snippet"]:
                    for ext in result["rich_snippet"]["extensions"]:
                        if "$" in ext or "£" in ext:
                            price = ext
                            break

                product_url = result.get("link", "")
                image_url = await extract_product_image_url(product_url)
                if not image_url:
                    image_url = result.get("thumbnail", "")

                product = {
                    "description": result.get("snippet", ""),
                    "price": price,
                    "thumbnailURL": image_url,
                    "productURL": product_url
                }
                products.append(product)

            return products

    except httpx.RequestError as e:
        print(f"Error making request to SearchAPI.io: {str(e)}")
        return []
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return []

# Search API response example:
# [{'position': 1, 'title': 'Organic Crew Neck T-Shirt / Olive', 'link': 'https://theperfectjean.nyc/products/crew-neck-t-shirt-olive?srsltid=AfmBOoozPcFlYt_uFlcw96FT0DX75gQ-CdBHk_dasuBDy400UubbfPWG', 'source': 'The Perfect Jean', 'domain': 'theperfectjean.nyc', 'displayed_link': 'https://theperfectjean.nyc › products › crew-neck-t-shirt...', 'snippet': "We made it with premium organic cotton with a dot of stretch so it's durable in the wash, but also feels like a hug from your crush. Fit: Slim-ish.", 'snippet_highlighted_words': ['premium organic cotton with a dot of stretch'], 'rich_snippet': {'detected_extensions': {'rating': 4.6, 'reviews': 916}, 'extensions': ['$29.99', 'In stock', '4.6', '(916)', 'Free delivery', '30-day returns']}, 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAXVBMVEX////+/v79/f36+vro5+j19fXY19ihn6CbmZq0s7TU1NSGg4TFxcW6urpqaGiRj4/MysuWlZW3trZ0cnJhX1/j4uKUkpPNzM2MiotaVld8e3vw7+9UUlKnp6deW1zV3FGwAAAA0klEQVR4Ad3PhZHDQBAF0f4jZjbb+Yd5GvOWFcF1geAtEiaQ5M8wrSF/IC+050yLIn+GCnGCLM3yvIhdw92yEkvyqm6qtkQK9qPrVxxGSIopes0UkpmeWGBE84LxUo/dHpK8ILKq+tou6uu67qdsfUyHZjiezq8JGEl+WLtM3aE7tnnWgCSCuj1EfqBvE3qh/ECy74sg9/dpXYIC5F/guRrRhjlGcdtjhEmOe2w8nfW7rMVpNZbXueQHpaiYj7cpT4GtmWVZLoa2Zj4fXxaoPPFlf0xrCUZHGk+FAAAAAElFTkSuQmCC', 'thumbnail': 'data:image/jpeg;base64,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'}, {'position': 2, 'title': 'PLEPAN Mens Short Sleeve T Shirt Basic Fit Crew Neck ...', 'link': 'https://www.amazon.com/PLEPAN-Sleeve-Classic-Premium-T-Shirt/dp/B0DSJC2Z33', 'source': 'Amazon.com', 'domain': 'www.amazon.com', 'displayed_link': 'https://www.amazon.com › PLEPAN-Sleeve-Classic-Pre...', 'snippet': "Premium: Men's T-shirts are made of high-quality materials with durable design No itch Label and stitching. They are fast-drying, stretchable, lightweight, soft ...", 'snippet_highlighted_words': ['made of high-quality materials'], 'rich_snippet': {'detected_extensions': {'rating': 4.5, 'reviews': 19}, 'extensions': ['$35.97$41', 'In stock', '4.5', '(19)', 'Free delivery', '30-day returns']}, 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAllBMVEVHcEz////////////////////////9/f7///////////////////////////////8AAAADBQX29vb/owD/+vG2trbZ2dmZmZn/26n/8d3v7+//9eb/yHpISUn/1Zr/48GmpqY+Pz8jIyP/rxb/u0oxMjJsbW3j4+PAwcH/6Mj/wGHMzMx7fHxfYGDFxcX/tC0NDg6Li4slqlgLAAAAD3RSTlMAooK1rWYj+jfodsRYfMGCSs7OAAABRElEQVQokW2T2XqDIBCFSZsE0w1EUEFi3Jfsff+XK6ttUubG4fzMcZxvBABEa4j+BVxHQMXbH4UQ8nvaqLqFpFOmgqWLTwReXSayPTaxr3z1Cvh7Z4tijO/MSTvgEmb0vsFxjGtf6qH2rFMi9po+w0vTxJN6XkMQkXEkUIgwRCJl2XBpgvB07m27AZjW5huHc6hSdYnv1SjSABRa+1biKQCZ1q4qyXSSPsJKaxVCY28sHqF5Vc9Og24X+1LfkBX97KdHyKyKh6rBOINPQ5guevRMIFYziCinFvKSmuESuySQINolyZEbSMvW4iXoTA8dd7Z525a8cBdowfP2WEp1tGsyH5Okk/lBRS6Vp+T5rNdkba/nCrtoZY6Q9lmByLXND6W83W6dLOfCKlCt9Wbn26BFsbxZmX7old++vP/7H+DX5xaAHw4uN1n/ebb2AAAAAElFTkSuQmCC', 'thumbnail': 'data:image/jpeg;base64,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'}, {'position': 3, 'title': 'Cotton T-Shirt Olive Green - Free Delivery', 'link': 'https://www.militarykit.com/products/cotton-tshirt-olive-green?srsltid=AfmBOoqAwVG6dvUcKF9C9XG5qfG-f0fmbEprw1h_YUgDKLdVG9k5S4Qg', 'source': 'Military Kit', 'domain': 'www.militarykit.com', 'displayed_link': 'https://www.militarykit.com › Clothing › T-Shirts', 'snippet': 'This olive green Cotton T-Shirt is made from 100% cotton, ideal for the warmer months or part of a layering system in winter. Durable and breathable, this T-Shirt has a crew neck and a straight cut for comfort.', 'snippet_highlighted_words': ['made from 100% cotton'], 'rich_snippet': {'detected_extensions': {'rating': 4.9, 'reviews': 8}, 'extensions': ['£7.95', 'In stock', '4.9', '(8)', '180-day returns']}, 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAA6klEQVR4AWL4jwcMMUkAD3QEpCEQwFH8eZjPRGfN5JOE60vRwUqSpGETd/hhkNtiDlkUZvn6/K+rK3zzs7cW5vPEnmfDaMwoabPWdGwF7P/4DVMP3WlfUAZml9DcNoNrB+h1ZJwm5rgmni6MyMvqxEHJaZJYir6xVZD0k6Y99YmtBacLc9M500o7mPLCChrdWETewCILMw9uN84wHRHOwxhejPcX9SGtyXTc2HWQhRdDlNTMCjf2yqF8UQvOSvuDIYPmRdl8lbYHdSTQXzieuC+60N37tAAjh/fPWgXvl837VX/qvf/dMEpgAOT2VXPd6eBGAAAAAElFTkSuQmCC', 'thumbnail': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAFwAXAMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAABwUGAQIDBAj/xAA+EAABAwIEAQgFCAsAAAAAAAABAAIDBBEFBhIhMQcTQVFhcYGRFCIyocFCUoKSorHC0hUjM0NTVGNyc9Hw/8QAGAEBAAMBAAAAAAAAAAAAAAAAAAECBAP/xAAgEQEAAgICAQUAAAAAAAAAAAAAAQIDESEyExIiMUFR/9oADAMBAAIRAxEAPwB4oQq5nPH3YLRMZTW9LnuIyRcMA4u94/4KJmIjciYxDEqLDYudr6qKBvRrdYu7hxPgqfivKJA3UzCaV0pHCWf1W+DeJ8bKg1Ek1VUvnqZXzSu9p8jrkrXRboWa2aZ+E6SFdmnMU1T6TBissMg9ljWt5u3VpIse83K7R8o2bIW6JKegmPQ8xEHxs4fcojQs6exc/Xb9S9lXnHNmJHTLWtoovlNpYw0nxNyPNTeD57xSiDWVwZWxjpd6rx9IcfEeKq7hZa2PUkXtHOw3cJzlg2JFrPSPRpj+7qPU37DwPmrBcHgUgXM23VgylmiqwapjhqJXyYc52lzHm/ND5zeq3G3Bdq5vqUaN9CwCCARuCsrQgJTZ0r/0hmGfQbx0/wCob4cfeSmvKHmNwjID7HSTwB6EocUy7iuGl7qundIw7maP12ntJ4jxsuObetQmELzjS4Dz7F10i2y8kFHU12P0dLRi80od3ENaXG/gF7A8EC+x6isuktdKNK32WCg5ubstSQBuV0K4SkXQaPmYAbHfoB2Qw6+HsjYLjWUU81DPWRC0NG6Pnj1a3aW28V76Gknqy2Gjgkmk+bG3Ue9NBrZFxP8ASWXodTry0xMEn0bWP1SFYVUshYDiGCx1L690bG1GkiFrtRaRfcnh09F1bVupv0xtUIQhWHibhOHsrxiDKOBtWGlomawB1jx4dyUuNwiHF66ECzWVEgaOoajb3JzpRZsbozLiLf6gPm0H4rhmjhMIgCwQgHdYJssyWsi8sjLuu5eiR1iFyf7SBjcn2F0tVliriq4Wyw1M5D2OGzgA2w87q40dHTUUQio6eKCMfJjYGhQPJ23TlanPzpJD9sj4KyrbSPbCoQhCuBCEIBKbPADc0VvaGH7ATZSm5QnaMzVPbHH9y45uqYV/Vuskrhr3W2rZZUsyHZaE3AIWHu2K5NfbYoHNkVunKtCOsPPm9yn1C5MFsr4b/hB96mlur1hUIQhWAhCEAk5yhvMmbasD2YxGCfoA/FONIzOFRzuZsUcP5hzfq+r8Fxz9UwjNW66A7LxF4WzZVlS9DyuTjt2rXnLrBNwgd2RJOdylhruqMt8nEfBT6qPJdMJcpxs/hTSM9+r8Sty3U6wqEIQrAQhYQZXzpilT6RidbNf9pUSP83Er6KVYmyBluZ7pPQXsc4knRUSAX7tVguWWk2jhMElq7Fs0mx4JxP5Nsvu4Crb3T/7C5HkywLomrx3St/KuPhsnZQajdBkIB4JwN5M8CHGWuPfK38q6s5N8uj24ql/91Q4fdZPDY2juRucvwbEIj8iq1ebGj8KYKjMEwLDcBhkiwqm5lkjtT7vc8uPe4lSS00iYrqVWUIQrD//Z'}, {'position': 4, 'title': 'Olive Green The Everyday Crew Neck Cotton Rich Short ...', 'link': 'https://www.next.us/en/style/su152504/q73908', 'source': 'Next US', 'domain': 'www.next.us', 'displayed_link': 'https://www.next.us › style', 'snippet': 'Perfect for everyday wear, this regular fit crewneck T-Shirt in olive green is crafted from a soft jersey blend, ideal for casual styling in a range of colours.', 'snippet_highlighted_words': ['regular fit crewneck T-Shirt in olive green'], 'rich_snippet': {'detected_extensions': {'rating': 4.5, 'reviews': 17}, 'extensions': ['$8.00', 'In stock', '4.5', '(17)', '$5 delivery', '28-day returns']}, 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAAAjElEQVR4AezJEQwDMRiA0XOXuR3Wk9lkNjutZ3Iu5zCns+ol9UKTq5SHJ7VCU2x++ibbZbTMc09fxw9H/pNN4Imsq69lg4APwcs760m4kG7OZlSZHyzTfdnzrGQgDc6CqBEIBj45tl6RdHDQlAb8V2paR7pak+mrmcDNe8oGDYkx1JIgQs2vUe7PUUkAiRryHemhXX4AAAAASUVORK5CYII=', 'thumbnail': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPpv696ui_30x7face3cUmGpGsvjPcW-TbFViJqEY&usqp=CAE&s'}, {'position': 5, 'title': '20 Best T-Shirts for Men in 2025, Tested and Reviewed', 'link': 'https://www.businessinsider.com/guides/style/best-t-shirt-men', 'source': 'Business Insider', 'domain': 'www.businessinsider.com', 'displayed_link': 'https://www.businessinsider.com › Reviews › Style', 'snippet': "It's made of 100% pre-shrunk cotton and features a midweight that's ideal for layering, and unlike some white tees, it's not see-through. The ...", 'snippet_highlighted_words': ['made of 100% pre-shrunk cotton'], 'date': '5 days ago', 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcBAMAAACAI8KnAAAALVBMVEUAJf8AH/8lOP8AAP8AEv/////x8/+Jjv86Sv+lqP/Kzv/d4P9VX/9gaf9kbP88/av8AAAAc0lEQVR4AWOgKRAUFASRAhAeo5KSErMDg5IShMscGhoaViwRGukA4aYC+eEWSNzU0DAkbpTx1FAPBDdaY2m0BYreTahG5SArvrc0VALZqKehLxDcsFWhoSdQ9IbhMpmlvLy8wpCpvBbqJRcXF0cgCcQ0BACEiyxTNePIwQAAAABJRU5ErkJggg==', 'images': ['https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW8vdcoE02SPJFCRhGZsivPYhUwK8knnoOXQ52ofm2YsliQ-wBSfS18Fo&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8ycrhsRLu9HpK-65Pn3_02Jn_FSaTdYEae01FtPk0MIMKSqWNdJmApQ&s', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNQ8SNhexvDggGnYuwitJQltniZ-_6B5qVSolBexH6CmcOG56hA7HRuA&s']}, {'position': 6, 'title': 'Jockey® Made2Fit Crew Neck T-Shirt', 'link': 'https://www.jockey.com/catalog/product/jockey-mens-made2fit-crew-neck-t-shirt', 'source': 'Jockey International', 'domain': 'www.jockey.com', 'displayed_link': 'https://www.jockey.com › catalog › product › jockey-...', 'snippet': 'Engineered to highlight the arms while bringing breathable comfort to the midsection, this first-of-its-kind dual-fabric tee features two fabrics for one great shirt.', 'snippet_highlighted_words': ['Engineered to highlight the arms while bringing breathable comfort'], 'rich_snippet': {'detected_extensions': {'rating': 4.5, 'reviews': 107}, 'extensions': ['$28.00', 'In stock', '4.5', '(107)', 'Free delivery over $59', 'Free lifetime returns']}, 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAh1BMVEX////f4OPt7vDLzdI6P1gAABp8f43e3uIAAAkAADQAEDkADTgAAByqq7MAACoAACYAADDJytCxs7q0tr2jpa5ydYP09PbBw8nU1doAAAAAACMAAC2dn6lOU2gqME0AACuQk54hKEgMFz6Eh5QACjdtcIBfYnQAABZHTGJTV2sbI0U8QVpDR14xUaQPAAAA4ElEQVR4AaXQRQKDMBRF0Ye7u0Pd9r++4gl1udMT/fgqhn1KHC8I4hOTZEXVdOMxioJpmpb9WB3XdT3P9Z/eywR4Xujgl7goiuInxiaWlWaPhMkLW1OzNM0C7oa8Uq+U1nImqptk5dK2FjZql2mgjSk0yrZpCwQR7Ciz1CU29cK0DY1JNN/Xnqko/IZgnEzTjfatlRBtgrmNsXivqWmIdUbwQIZv6KpygF8RTDyAujQ7RuaMThKCFFiqfdJmFM9ooz+zGdAFYBlYJOr2xm6rLtvtrj11WS7526Bt27bGv10B6ygSBGJ5XuAAAAAASUVORK5CYII=', 'thumbnail': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSVLgAjLcokzu76rXlffO_DmecQ5FYtTyR9RtZeV0&usqp=CAE&s'}, {'position': 7, 'title': "The 4 Best Women's White T-Shirts of 2025", 'link': 'https://www.nytimes.com/wirecutter/reviews/best-womens-white-t-shirts/', 'source': 'The New York Times', 'domain': 'www.nytimes.com', 'displayed_link': 'https://www.nytimes.com › wirecutter › reviews › best-...', 'snippet': 'Four clear favorites emerged: a flattering, boxy cropped tee, a perfectly proportioned V-neck, an inexpensive classic crew-neck shirt, and a splurge-worthy ...', 'snippet_highlighted_words': ['tee', 'crew', 'neck shirt'], 'date': 'Dec 13, 2024', 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAAAAABXZoBIAAABQElEQVR4AX3LIYyDMBiG4c/XoC+TczN4FHpeMI/CBz0fBN6g5lDo+ilUfarLAZTCb3eUdsvdCV7Rpt+Tgg7CetAxLu/sy15EtPrpg0TG2F01paB/SDKPorSS6+tVgnuF2VvlCYwBSMpHjOu87KtHumOLBYE9EY0eZ5sxN9yqLNqEBQwFzXtwFxXnF/HyWcZfCDJl/qBR9yZOZ5lzWT/J2wztIo4Tz4CGhDTa59EIIG8vbMPqSR+c9pYc4GrDukDA58nlUKsvhtbiIwFKoz2ONq0QuJ/NkFbLqKZ9djhZLCzW1MqV8/k3bjsLxQWJMK1UZ6EdDnsmR4A4E8tKgl/PatxXj1qABQjzhlcJUBi3onfN9aYMe6Ea3IjeZ/gZzmM5+Q3f7yb1SEOEad0N78mir9djp7pJ9/5t8SB0Bx2jOugHUdRcAiPWOf8AAAAASUVORK5CYII=', 'thumbnail': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEF73t8OUhR2Fj5wup_ym9-LZVBGEPeiv8kg9Sg7s&usqp=CAE&s'}, {'position': 8, 'title': 'The Best White T-Shirts for Men, Tested by Fashion Editors', 'link': 'https://www.menshealth.com/style/g31405459/best-white-t-shirts/', 'source': "Men's Health", 'domain': 'www.menshealth.com', 'displayed_link': 'https://www.menshealth.com › style › best-white-t-shirts', 'snippet': "AIRism Cotton Crew Neck T-Shirt ... That's because the fabric is relatively breathable, and the fit is just right for wearing on casual errands.", 'snippet_highlighted_words': ['AIRism Cotton Crew Neck T-Shirt'], 'date': 'Jun 6, 2024', 'favicon': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAcCAMAAABF0y+mAAAAQlBMVEVHcEzqQRXpQRTpQRTpQRTpQRTqQhTpQRTpPQjoMQDpOADuclz74Nv51dDsWjz4x8D2ubD////ym4z98O3oKADnEgBkJTtyAAAACHRSTlMAPqfe9f89va1/OTcAAADQSURBVHgBfdMFFoMwEARQHNZIJoH7X7XLq7csg/ORaONpu34YvzL03eTgmcfTzLHdtR3DTE0XY9f0MfaNl3MhIr4fju2x8zI3flPUTHhZzVSSJbvvXB1HzkAiLoCSAIUXv+bxjuRYN0qAbeuBG5DpAzFuNUYZEaD6lUAfSPsXpgrN9sBUyjcaUEu9o+X8jQXA+sCy7d+4Ou71vEBpBzRGRT5HTkYZwvWk+Y6GL6KczY42N73vFsd7l/FCI/912WVnXw+TNsb2emiG6hZOh9bhBjcgG0POiDQmAAAAAElFTkSuQmCC', 'thumbnail': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSKGRQ8zXuCVxJyoW_4iZalQKkDnZTAXVSh45Meps&usqp=CAE&s'}, {'position': 9, 'title': 'Excited to Wear This Spring', 'link': 'https://dieworkwear.com/2023/06/01/excited-to-wear-this-spring-4/', 'source': 'Die, Workwear! —', 'domain': 'dieworkwear.com', 'displayed_link': 'https://dieworkwear.com › 2023/06/01 › excited-to-wear...', 'snippet': "Readers have found these posts to be useful as seasonal style guides. Here's this year's "excited for spring" post with a bonus soundtrack at the end.", 'snippet_highlighted_words': ['at'], 'date': 'Jun 1, 2023'}]