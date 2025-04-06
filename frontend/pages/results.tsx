import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FashionRecommendationsResponse } from "../services/fashionService";

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<FashionRecommendationsResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const resultsData = router.query.results;
    if (resultsData) {
      const parsedResults = JSON.parse(decodeURIComponent(resultsData as string));
      setResults(parsedResults);
      if (parsedResults.categories.length > 0) {
        setActiveCategory(parsedResults.categories[0].category);
      }
    }
    setIsLoading(false);
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">No results found</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Fashion Recommendations</h1>
      
      <Tabs defaultValue={activeCategory} className="w-full">
        <TabsList className="w-full justify-start mb-8">
          {results.categories.map((category) => (
            <TabsTrigger
              key={category.category}
              value={category.category}
              onClick={() => setActiveCategory(category.category)}
            >
              {category.category}
            </TabsTrigger>
          ))}
        </TabsList>

        {results.categories.map((category) => (
          <TabsContent key={category.category} value={category.category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  Searching for items in {category.category.toLowerCase()}...
                </div>
              ) : (
                category.items.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover rounded mb-4" />
                    <h3 className="font-semibold text-lg">{item.name}</h3>
                    <p className="text-gray-600">{item.description}</p>
                    <p className="text-lg font-bold mt-2">${item.price}</p>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 