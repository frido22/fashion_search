import axios from "axios";

export interface FashionRecommendationResponse {
  style: string;
  items: Array<LookItem>;   
}

export async function getFashionRecommendations(
    inspirationImages: File[],
    userImage: File,
    budget: string,
    additionalInfo: string
): Promise<FashionRecommendationResponse> {
  await new Promise(resolve => setTimeout(resolve, 1500));

  return {
    style: "Casual",
    items: [
      {
        description: "A casual white t-shirt",
        category: "Tops"
      },
      {
        description: "A pair of blue jeans",
        category: "Bottoms"
      }
    ]
  };
}

interface LookItem {
  description: string;
  category: string;
}

export const getFashionRecommendationsReal = async (
    inspirationImages: File[],
    userImage: File,
    budget: string,
    additionalInfo: string
  ): Promise<FashionRecommendationResponse> => {
    const formData = new FormData();
  
    inspirationImages.forEach(image => {
        formData.append("inspiration_images", image);
    });
  
    formData.append("user_image", userImage);
    formData.append("budget", budget);
    formData.append("additional_info", additionalInfo);
  
    const response = await axios.post<FashionRecommendationResponse>(
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