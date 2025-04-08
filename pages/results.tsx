import { allCategories } from "@/categories";
import { FashionRecommendationResponse } from "@/services/fashionService";
import { getSearchResultsReal, SearchResponse } from "@/services/searchService";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { SearchResult } from "../services/searchService";
type ErrorState = {
  [key: string]: string | null;
};

interface SearchResultWithCategory extends SearchResult {
  category: string;
}

export default function ResultsPage() {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<FashionRecommendationResponse | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Tops");
  const [isLoading, setIsLoading] = useState(true);
  const [categoryResults, setCategoryResults] = useState<Record<string, SearchResult[]>>({});
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSearching, setIsSearching] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  
  const categories = useMemo(() => 
    allCategories.filter((category: string) => 
      recommendation?.items.some((item: any) => item.category === category)
    ),
    [allCategories, recommendation?.items]
  );

  useEffect(() => {
    const resultsData = router.query.results;
    if (resultsData) {
      try {
        const parsedResults = JSON.parse(decodeURIComponent(resultsData as string));
        setRecommendation(parsedResults);
        
        // If the image is already available (including default image), don't show spinner
        if (parsedResults.style?.image) {
          setIsImageLoading(false);
        } else {
          // Set a timeout to stop the spinner after a reasonable time
          // in case the image generation fails silently
          const timeoutId = setTimeout(() => {
            setIsImageLoading(false);
          }, 10000); // 10 seconds timeout
          
          return () => clearTimeout(timeoutId);
        }
      } catch (error) {
        setErrors(prev => ({ ...prev, parsing: "Failed to parse results data" }));
      } finally {
        setIsLoading(false);
      }
    }
  }, [router.query]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!recommendation) return;

      setIsSearching(true);

      const results: SearchResultWithCategory[] = await Promise.all(
        recommendation.items.map(async item => {
          const r: SearchResponse = await getSearchResultsReal(item.description);
          console.log('result', r);
          return {
            ...r.results[0],
            category: item.category
          }
        })
      );

      console.log('results', results);

      setCategoryResults(results.reduce((acc, curr) => {
        acc[curr.category] = [...(acc[curr.category] || []), curr];
        return acc;
      }, {} as Record<string, SearchResultWithCategory[]>));

     setIsSearching(false); 
    };

    fetchSearchResults();
  }, [recommendation, setCategoryResults, setIsSearching]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-16">
          <div className="flex justify-between items-center mb-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-32" />
          </div>
          <Skeleton className="h-6 w-96 mb-12" />

          <h2 className="text-2xl font-bold mb-8">Recommended Aesthetic</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="flex">
              <Skeleton className="w-1/3 h-[240px]" />
              <div className="w-2/3 p-8">
                <Skeleton className="h-8 w-48 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-6" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Recommended Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <Skeleton className="aspect-w-1 aspect-h-1 w-full" />
              <div className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!recommendation || errors.parsing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg">{errors.parsing || "No results found"}</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
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
              {isImageLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              ) : (
                <img 
                  src={recommendation?.style?.image || '/images/default-style.svg'} 
                  alt="Style aesthetic" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if the image fails to load
                    e.currentTarget.src = '/images/default-style.svg';
                    setIsImageLoading(false);
                  }}
                  onLoad={() => setIsImageLoading(false)}
                />
              )}
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
            {isSearching && category === activeCategory ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white rounded-lg overflow-hidden shadow-sm">
                    <Skeleton className="aspect-w-1 aspect-h-1 w-full" />
                    <div className="p-4">
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-10 w-28" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : errors[category] ? (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg">{errors[category]}</p>
                </div>
                <button
                  onClick={() => {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors[category];
                      return newErrors;
                    });
                    setCategoryResults(prev => {
                      const newResults = { ...prev };
                      delete newResults[category];
                      return newResults;
                    });
                  }}
                  className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryResults[category]?.map((item: SearchResult, index: number) => (
                  <div key={index} className="bg-white rounded-lg overflow-hidden shadow-sm relative group">
                    <div className="aspect-w-1 aspect-h-1">
                      <img
                        src={item.thumbnailURL}
                        alt={item.description}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://picsum.photos/400/400';
                        }}
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
                      <p className="text-gray-600 mb-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">{item.price}</span>
                        <a
                          href={item.productURL}
                          target="_blank"
                          rel="noopener noreferrer" 
                          className="text-gray-600 hover:text-gray-900 px-4 py-2 border rounded-md"
                        >
                          View Product
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
} 