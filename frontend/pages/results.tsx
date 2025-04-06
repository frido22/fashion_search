import { ProductCard } from "@/components/ProductCard";
import { FashionRecommendationResponse } from "@/services/fashionService";
import { getSearchResults } from "@/services/searchService";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { allCategories } from "@/categories";

export default function ResultsPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<FashionRecommendationResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tops");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryResults, setCategoryResults] = useState<Record<string, any>>({});
  const categories = useMemo(() => 
    allCategories.filter((category: string) => 
      recommendation?.items.some((item: any) => item.category === category)
    ),
    [allCategories, recommendation?.items]
  );

  useEffect(() => {
    const resultsData = router.query.results;
    if (resultsData) {
      const parsedResults = JSON.parse(decodeURIComponent(resultsData as string));
      setRecommendation(parsedResults);
      setIsLoading(false);
    }
  }, [router.query]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!recommendation) return;

      const categoryItems = recommendation.items.filter(item => item.category === activeCategory);
      if (categoryItems.length > 0 && !categoryResults[activeCategory]) {
        const results = await Promise.all(
          categoryItems.map(item => getSearchResults(item.description))
        );
        setCategoryResults(prev => ({
          ...prev,
          [activeCategory]: results.flatMap(r => r.results)
        }));
      }
    };

    fetchSearchResults();
  }, [activeCategory, recommendation, categoryResults]);

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
      
      <Tabs value={activeCategory} className="w-full">
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

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryResults[category]?.map((result: any, index: number) => (
                <ProductCard
                  key={index}
                  thumbnailURL={result.thumbnailURL}
                  description={result.description}
                  productURL={result.productURL}
                  price={result.price}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 