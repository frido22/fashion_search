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

export async function getSearchResults(query: string): Promise<SearchResponse> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const mockResults: SearchResult[] = [
    {
      description: query,
      price: "$49.99",
      thumbnailURL: "https://picsum.photos/400/400",
      productURL: "https://example.com/product1"
    },
    {
      description: `${query} - Style 2`,
      price: "$59.99",
      thumbnailURL: "https://picsum.photos/400/401",
      productURL: "https://example.com/product2"
    },
    {
      description: `${query} - Style 3`,
      price: "$69.99",
      thumbnailURL: "https://picsum.photos/400/402",
      productURL: "https://example.com/product3"
    }
  ];

  return {
    results: mockResults
  };
}