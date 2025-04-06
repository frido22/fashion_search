import { allCategories } from "@/categories";
import { FashionRecommendationResponse } from "@/services/fashionService";
import { getSearchResults } from "@/services/searchService";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

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
      <div className="mb-16">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-4xl font-bold">Your Personalized Results</h1>
          <button
            onClick={() => router.push('/')}
            className="flex items-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>
        <p className="text-xl text-gray-600 mb-12">Based on your style preferences, we've curated these recommendations just for you.</p>

        <h2 className="text-2xl font-bold mb-8">Recommended Aesthetic</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            <div className="w-1/3 h-[240px]">
              <img 
                src={recommendation?.style?.image || 'https://picsum.photos/200/300'} 
                alt="Style aesthetic" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="w-2/3 p-8">
              <h3 className="text-2xl font-bold mb-4">{recommendation?.style.title}</h3>
              <p className="text-gray-600 mb-6">{recommendation?.style.description}</p>
              <div className="flex gap-3">
                {recommendation?.style.tags.map((tag: string) => (
                  <span key={tag} className="px-4 py-2 bg-gray-100 rounded-full text-sm">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6">Recommended Items</h2>
      <Tabs defaultValue={activeCategory} className="w-full">
        <TabsList className="flex space-x-2 mb-8 border-b">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setActiveCategory(category)}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {categoryResults[category]?.map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm relative group">
                  <div className="aspect-w-1 aspect-h-1">
                    <img
                      src={item.thumbnailURL}
                      alt={item.description}
                      className="w-full h-full object-cover"
                    />
                    <a
                      href={item.productURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm hover:bg-gray-100 transition-colors"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">{item.price}</span>
                      <button className="text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-md">
                        View Product
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 