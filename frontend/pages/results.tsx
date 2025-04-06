import { FashionRecommendationResponse } from "@/services/fashionService";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";

const categories = [ "Tops", "Bottoms", "Accessories", "Shoes" ];

export default function ResultsPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<FashionRecommendationResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsData = router.query.results;
    if (resultsData) {
      const parsedResults = JSON.parse(decodeURIComponent(resultsData as string));
      setRecommendation(parsedResults);
    }
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">No results found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Fashion Recommendations</h1>

      <div className="bg-gray-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Style Profile</h2>
        <p className="text-gray-700">{recommendation.style}</p>
      </div>
      
      <Tabs defaultValue={activeCategory} className="w-full">
        <TabsList className="w-full justify-start mb-8">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        
      </Tabs>
    </div>
  );
} 