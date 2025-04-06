import { allCategories } from "@/categories";
import { ProductCard } from "@/components/ProductCard";
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
      <button
        onClick={() => router.push('/')}
        className="mb-8 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
      >
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Home
      </button>

      <div className="mb-16">
        <h1 className="text-4xl font-bold mb-4">Your Personalized Results</h1>
        <p className="text-xl text-gray-600 mb-12">Based on your style preferences, we've curated these recommendations just for you.</p>

        <h2 className="text-3xl font-bold mb-8">Recommended Aesthetic</h2>
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex">
            <div className="w-1/3">
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

      <h2 className="text-3xl font-bold mb-8">Recommended Items</h2>
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