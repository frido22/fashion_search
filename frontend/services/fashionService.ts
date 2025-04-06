import axios from "axios";

export interface FashionRecommendationResponse {
  style: string;
  items: Array<LookItem>;   
}

export async function getFashionRecommendations(
    inspirationImages: string[],
    userImage: string,
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
    inspirationImages: string[],
    userImage: string,
    budget: string,
    additionalInfo: string
  ): Promise<FashionRecommendationResponse> => {
    const formData = new FormData();
  
    inspirationImages.forEach((image, index) => {
        const blob = dataURLtoBlob(image);
        formData.append(`inspiration_images[${index}]`, blob, `inspiration_${index}.jpg`);
    });
  
    formData.append("profile_photo", dataURLtoBlob(userImage));
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

  const dataURLtoBlob = (dataURL: string) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };