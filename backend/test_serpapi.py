import asyncio
import os
import sys
from app.services.serpapi_service import test_serpapi_connection

async def main():
    print("Testing SerpAPI connection...")
    result = await test_serpapi_connection()
    if result:
        print("SerpAPI connection test passed!")
        sys.exit(0)
    else:
        print("SerpAPI connection test failed!")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
