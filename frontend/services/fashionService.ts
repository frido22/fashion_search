import axios from "axios";

export interface FashionRecommendation {
  category: string;
  items: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
  }>;
}

export interface FashionRecommendationsResponse {
  categories: FashionRecommendation[];
}

export async function getFashionRecommendations(formData: FormData): Promise<FashionRecommendationsResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    categories: [
      {
        category: "Tops",
        items: []
      },
      {
        category: "Bottoms",
        items: []
      },
      {
        category: "Shoes",
        items: []
      },
      {
        category: "Accessories",
        items: []
      }
    ]
  };
}

interface LookItem {
  description: string;
  category: string;
}

export const getFashionRecommendationsReal = async (
  formData: FormData
): Promise<FashionRecommendation> => {
  const response = await axios.post<FashionRecommendation>(
    "http://localhost:8000/api/recommendations",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
}; 