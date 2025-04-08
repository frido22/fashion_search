interface SearchResult {
  description: string
  price: string
  thumbnailURL: string
  productURL: string
  rating?: number
}

export async function searchProducts(query: string): Promise<SearchResult[]> {
  const SEARCHAPI_BASE_URL = "https://serpapi.com/search"
  const SEARCHAPI_KEY = process.env.SERPAPI_API_KEY

  if (!SEARCHAPI_KEY) {
    console.error("SEARCHAPI_KEY environment variable is not set")
    throw new Error("SEARCHAPI_KEY environment variable is not set")
  }

  if (!query) {
    console.error("Search query is required")
    throw new Error("Search query is required")
  }

  const params = {
    q: query + " fashion clothing",
    api_key: SEARCHAPI_KEY,
    engine: "google",
    google_domain: "google.com",
    gl: "us",
    hl: "en",
    tbm: "shop",
    num: 5 * 2
  }

  try {
    console.log(`Sending SerpAPI request for query: '${query}'`)
    
    const url = new URL(SEARCHAPI_BASE_URL)
    Object.keys(params).forEach(key => 
      url.searchParams.append(key, String(params[key as keyof typeof params]))
    )
    
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    console.log(`SerpAPI response status: ${response.status}`)
    
    const responseText = await response.text()
    
    if (!response.ok) {
      console.error(`SerpAPI responded with status: ${response.status}`)
      console.error(`Response content: ${responseText.substring(0, 500)}...`)
      throw new Error(`SerpAPI responded with status: ${response.status}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (jsonErr) {
      console.error(`Failed to parse JSON response: ${jsonErr}`)
      console.error(`Response text: ${responseText.substring(0, 500)}...`)
      return []
    }

    if (data.error) {
      console.error(`SerpAPI returned error: ${data.error}`)
      return []
    }

    const shoppingResults = data.shopping_results || []
    
    if (!shoppingResults.length) {
      console.error(`No shopping results found for query: '${query}'`)
      console.error(`Response keys: ${Object.keys(data)}`)
      console.error(`Response: ${JSON.stringify(data)}`)
    }

    const recommendations: SearchResult[] = []
    
    for (const item of shoppingResults) {
      let productLink = item.link || ""
      
      if (!productLink) {
        productLink = item.product_link || ""
        
        if (!productLink && item.source && item.title) {
          const source = item.source.toLowerCase()
          
          if (source.includes("amazon")) {
            productLink = `https://www.amazon.com/s?k=${item.title.replace(/ /g, "+")}`
          } else if (source.includes("ebay")) {
            productLink = `https://www.ebay.com/sch/i.html?_nkw=${item.title.replace(/ /g, "+")}`
          } else if (source.includes("etsy")) {
            productLink = `https://www.etsy.com/search?q=${item.title.replace(/ /g, "+")}`
          } else if (source.includes("walmart")) {
            productLink = `https://www.walmart.com/search?q=${item.title.replace(/ /g, "+")}`
          } else if (source.includes("target")) {
            productLink = `https://www.target.com/s?searchTerm=${item.title.replace(/ /g, "+")}`
          }
        }
      }
      
      if (productLink && !(productLink.startsWith("http://") || productLink.startsWith("https://"))) {
        productLink = "https://" + productLink
      }
      
      if (productLink) {
        productLink = productLink.trim().replace(/ /g, "%20")
      } else {
        console.error(`No product link found for item: ${item.title ? item.title.substring(0, 30) : ""}...`)
      }
      
      const recommendation: SearchResult = {
        description: item.title || "",
        productURL: productLink,
        price: item.price || "",
        thumbnailURL: item.thumbnail || "",
        rating: item.rating || undefined
      }
      
      recommendations.push(recommendation)
    }
    
    console.log(`Found ${recommendations.length} recommendations for query: '${query}'`)
    
    return recommendations.slice(0, 10)
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "TimeoutError") {
        console.error(`Timeout error for SerpAPI query '${query}': Request timed out`)
      } else if (error.name === "TypeError" && error.message.includes("fetch")) {
        console.error(`Request error for SerpAPI query '${query}': ${error.message}`)
      } else {
        console.error(`Unexpected error for SerpAPI query '${query}': ${error.message}`)
        console.error(`Error details: ${error.stack}`)
      }
    } else {
      console.error(`Unexpected error for SerpAPI query '${query}': Unknown error`)
    }
    return []
  }
} 