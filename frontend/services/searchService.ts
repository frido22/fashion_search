interface SearchResponse {
    results: SearchResult[];
  }
  
  interface SearchResult {
    description: string;
    price: string;
    thumbnailURL: string;
    productURL: string;
  }
  
  interface SearchRequest {
      query: string;
  }