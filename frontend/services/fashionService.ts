import axios from "axios";

interface FashionRecommendation {
  style: string;
  items: LookItem[];
}

interface LookItem {
  description: string;
  category: string;
}

export const getFashionRecommendations = async (
  formData: FormData
) => {
  const response = await axios.post<SearchResponse>(
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