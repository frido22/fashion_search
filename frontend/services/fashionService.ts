import axios from "axios";

export interface StyleRecommendation {
  title?: string;
  price?: string;
  thumbnail?: string;
  source?: string;
  link?: string;
}

export interface RecommendationResponse {
  recommendations: {
    [category: string]: StyleRecommendation[];
  };
}

export interface TransformedRecommendations {
  styleProfile: {
    name: string;
    description: string;
  };
  categories: {
    id: string;
    name: string;
    description: string;
    looks: {
      id: string;
      name: string;
      description: string;
      image: string;
      items: {
        id: string;
        name: string;
        price: string;
        image: string;
        brand: string;
        url: string;
      }[];
      tags: string[];
    }[];
  }[];
}

export const getFashionRecommendations = async (
  formData: FormData
): Promise<{ recommendations: TransformedRecommendations }> => {
  const response = await axios.post<RecommendationResponse>(
    "http://localhost:8000/api/recommendations",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  if (!response.data?.recommendations) {
    throw new Error("Invalid response format from API");
  }

  const categorizedRecommendations = response.data.recommendations;
  const transformedData: TransformedRecommendations = {
    styleProfile: {
      name: "Your Style Profile",
      description: formData.get("style_description")?.toString() || "Based on your preferences and uploaded images"
    },
    categories: Object.entries(categorizedRecommendations).map(([category, items]) => {
      const itemsArray = Array.isArray(items) ? items : [];
      
      return {
        id: category.toLowerCase().replace(/\s+/g, '-'),
        name: category,
        description: `Curated ${category.toLowerCase()} items that match your style preferences`,
        looks: [
          {
            id: `${category.toLowerCase().replace(/\s+/g, '-')}-1`,
            name: `${category} Look`,
            description: `A curated ${category.toLowerCase()} look based on your style preferences`,
            image: itemsArray[0]?.thumbnail || "",
            items: itemsArray.map((item, index) => ({
              id: `item-${category}-${index}`,
              name: item.title || "Fashion Item",
              price: item.price || "Price unavailable",
              image: item.thumbnail || "",
              brand: item.source || "Unknown Brand",
              url: item.link || "#"
            })),
            tags: [category, "Recommended", "Your Style"]
          }
        ]
      };
    })
  };

  return {
    ...response.data,
    recommendations: transformedData
  };
}; 