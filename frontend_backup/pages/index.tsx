import { useState, useRef } from 'react';
import { Inter } from 'next/font/google';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';
import Image from 'next/image';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [styleDescription, setStyleDescription] = useState('');
  const [skinColor, setSkinColor] = useState('');
  const [gender, setGender] = useState('');
  const [priceRange, setPriceRange] = useState('medium'); // Default to medium price range
  const [expression, setExpression] = useState('');
  
  // User photos (photos of the person standing)
  const [userPhotos, setUserPhotos] = useState<File[]>([]);
  const [userPhotoPreviews, setUserPhotoPreviews] = useState<string[]>([]);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);
  
  // Aesthetic reference photos
  const [aestheticPhotos, setAestheticPhotos] = useState<File[]>([]);
  const [aestheticPhotoPreviews, setAestheticPhotoPreviews] = useState<string[]>([]);
  const aestheticPhotoInputRef = useRef<HTMLInputElement>(null);
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [categorizedRecommendations, setCategorizedRecommendations] = useState<Record<string, any[]>>({});
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleUserPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedPhotos = Array.from(e.target.files);
      setUserPhotos(prev => [...prev, ...selectedPhotos]);
      
      // Create image previews
      const newPreviews: string[] = [];
      selectedPhotos.forEach(image => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === selectedPhotos.length) {
              setUserPhotoPreviews(prev => [...prev, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(image);
      });
    }
  };

  const handleAestheticPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedPhotos = Array.from(e.target.files);
      setAestheticPhotos(prev => [...prev, ...selectedPhotos]);
      
      // Create image previews
      const newPreviews: string[] = [];
      selectedPhotos.forEach(image => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            if (newPreviews.length === selectedPhotos.length) {
              setAestheticPhotoPreviews(prev => [...prev, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(image);
      });
    }
  };

  const removeUserPhoto = (index: number) => {
    setUserPhotos(prev => prev.filter((_, i) => i !== index));
    setUserPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAestheticPhoto = (index: number) => {
    setAestheticPhotos(prev => prev.filter((_, i) => i !== index));
    setAestheticPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const triggerUserPhotoInput = () => {
    if (userPhotoInputRef.current) {
      userPhotoInputRef.current.click();
    }
  };

  const triggerAestheticPhotoInput = () => {
    if (aestheticPhotoInputRef.current) {
      aestheticPhotoInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setRecommendations([]);
    setCategorizedRecommendations({});
    setSearchQueries([]);

    try {
      // Create FormData object
      const formData = new FormData();
      
      // Add required text fields
      formData.append('style_description', styleDescription);
      
      // Add optional text fields
      if (skinColor) formData.append('skin_color', skinColor);
      if (gender) formData.append('gender', gender);
      if (expression) formData.append('expression', expression);
      if (priceRange) formData.append('price_range', priceRange);
      
      // Add user photos (photos of the person)
      userPhotos.forEach((photo) => {
        formData.append('user_photos', photo);
      });
      
      // Add aesthetic photos (style reference photos)
      aestheticPhotos.forEach((photo) => {
        formData.append('aesthetic_photos', photo);
      });

      console.log('Submitting form data with:');
      console.log(`- Style description: ${styleDescription}`);
      console.log(`- User photos: ${userPhotos.length}`);
      console.log(`- Aesthetic photos: ${aestheticPhotos.length}`);
      console.log(`- Price range: ${priceRange}`);

      // Make API request
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/recommendations`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        // Set search queries used
        if (response.data.search_queries_used) {
          setSearchQueries(response.data.search_queries_used);
        }
        
        // Process categorized recommendations
        const categories = response.data.recommendations || {};
        setCategorizedRecommendations(categories);
        
        // Flatten recommendations for legacy support
        const allRecommendations = Object.values(categories).flat() as any[];
        setRecommendations(allRecommendations);
        
        // Scroll to results
        if (resultsRef.current) {
          resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setError(response.data.error || 'Failed to get recommendations');
      }
    } catch (err: any) {
      console.error('Error fetching recommendations:', err);
      setError(err.message || 'An error occurred while fetching recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to capitalize first letter of each word
  const capitalizeFirstLetter = (string: string) => {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <main className={`min-h-screen flex flex-col ${inter.className} bg-gray-50`}>
      <Header />
      
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-3 text-center text-gray-800">Fashion Perplexity</h1>
          <p className="text-lg mb-10 text-center text-gray-600">
            Upload photos of yourself and your style aesthetic to get personalized fashion recommendations
          </p>
          
          <form onSubmit={handleSubmit} className="mb-10 bg-white p-8 rounded-xl shadow-lg">
            {/* User Photo Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Photos of Yourself</h2>
              <p className="text-gray-600 mb-4">
                Upload photos of yourself standing to help us recommend clothes that fit your body type
              </p>
              
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUserPhotoChange}
                  className="hidden"
                  ref={userPhotoInputRef}
                />
                
                <div 
                  onClick={triggerUserPhotoInput}
                  className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:bg-green-50 transition duration-200"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-green-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-green-500 font-medium">Click to upload photos of yourself</p>
                    <p className="text-gray-500 text-sm mt-1">Full body standing photos work best</p>
                  </div>
                </div>
              </div>
              
              {/* User Photo Previews */}
              {userPhotoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {userPhotoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={preview}
                          alt={`User Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeUserPhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Aesthetic Photo Upload Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Upload Style Aesthetic Photos</h2>
              <p className="text-gray-600 mb-4">
                Upload photos of fashion styles, aesthetics, or outfits you like
              </p>
              
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAestheticPhotoChange}
                  className="hidden"
                  ref={aestheticPhotoInputRef}
                />
                
                <div 
                  onClick={triggerAestheticPhotoInput}
                  className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition duration-200"
                >
                  <div className="flex flex-col items-center">
                    <svg className="w-12 h-12 text-blue-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-blue-500 font-medium">Click to upload style reference photos</p>
                    <p className="text-gray-500 text-sm mt-1">Upload multiple photos for better recommendations</p>
                  </div>
                </div>
              </div>
              
              {/* Aesthetic Photo Previews */}
              {aestheticPhotoPreviews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {aestheticPhotoPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <div className="h-32 w-full rounded-lg overflow-hidden border border-gray-200">
                        <img
                          src={preview}
                          alt={`Style Reference ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAestheticPhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition duration-200"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Style Description - Making this optional */}
            <div className="mb-6">
              <label htmlFor="style-description" className="block text-gray-700 font-medium mb-2">
                Describe Your Style (Optional)
              </label>
              <textarea
                id="style-description"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Describe your preferred fashion style, colors, patterns, etc."
                value={styleDescription}
                onChange={(e) => setStyleDescription(e.target.value)}
                required={false}
              ></textarea>
            </div>
            
            {/* Additional Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Gender Selection */}
              <div>
                <label htmlFor="gender" className="block text-gray-700 font-medium mb-2">
                  Gender Preference (Optional)
                </label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="border border-gray-300 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
                >
                  <option value="">Any Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
              
              {/* Price Range */}
              <div>
                <label htmlFor="priceRange" className="block text-gray-700 font-medium mb-2">
                  Budget
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPriceRange('low')}
                    className={`flex-1 py-2 px-3 rounded-lg border transition duration-200 ${
                      priceRange === 'low' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Budget
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceRange('medium')}
                    className={`flex-1 py-2 px-3 rounded-lg border transition duration-200 ${
                      priceRange === 'medium' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Mid-Range
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceRange('high')}
                    className={`flex-1 py-2 px-3 rounded-lg border transition duration-200 ${
                      priceRange === 'high' 
                        ? 'bg-blue-500 text-white border-blue-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Luxury
                  </button>
                </div>
              </div>
            </div>
            
            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                disabled={isLoading || (userPhotoPreviews.length === 0 && aestheticPhotoPreviews.length === 0)}
                className={`bg-blue-600 text-white py-3 px-8 rounded-lg font-medium text-lg shadow-md transition duration-200 ${
                  isLoading || (userPhotoPreviews.length === 0 && aestheticPhotoPreviews.length === 0)
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-blue-700 hover:shadow-lg'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Your Style...
                  </div>
                ) : 'Get Fashion Recommendations'}
              </button>
            </div>
          </form>
          
          {/* Error Message */}
          {error && (
            <div className="mb-8 p-4 bg-red-100 text-red-700 rounded-lg">
              <p className="font-medium">Error:</p>
              <p>{error}</p>
            </div>
          )}
          
          {/* Search Queries */}
          {searchQueries.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold mb-3 text-gray-800">Search Queries Used:</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <ul className="list-disc pl-5 space-y-1">
                  {searchQueries.map((query, index) => (
                    <li key={index} className="text-gray-700">{query}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* Categorized Recommendations */}
          {Object.keys(categorizedRecommendations).length > 0 && (
            <div className="mb-8" ref={resultsRef}>
              <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">Your Fashion Recommendations</h2>
              
              {Object.entries(categorizedRecommendations).map(([category, items]) => (
                items.length > 0 && (
                  <div key={category} className="mb-10 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200 text-gray-800">
                      {capitalizeFirstLetter(category)}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {items.map((item, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
                          <a 
                            href={item.link || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="block"
                            onClick={(e) => {
                              // Validate the link before allowing navigation
                              if (!item.link || item.link === '#') {
                                e.preventDefault();
                                alert('Product link is not available');
                                return;
                              }
                              
                              // Check if the link is properly formatted
                              const isValidUrl = (url: string) => {
                                try {
                                  new URL(url);
                                  return true;
                                } catch (e) {
                                  return false;
                                }
                              };
                              
                              if (!isValidUrl(item.link)) {
                                e.preventDefault();
                                // Try to fix the URL by adding https://
                                const fixedUrl = `https://${item.link}`;
                                if (isValidUrl(fixedUrl)) {
                                  // Open the fixed URL
                                  window.open(fixedUrl, '_blank', 'noopener,noreferrer');
                                } else {
                                  alert('Invalid product link format');
                                }
                              }
                              
                              // Track click for analytics (optional)
                              console.log(`Clicked on product: ${item.title}`);
                            }}
                          >
                            <div className="h-48 bg-gray-200 relative">
                              {item.thumbnail ? (
                                <img
                                  src={item.thumbnail}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">
                                  No image available
                                </div>
                              )}
                              {priceRange === 'low' && (
                                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  Budget Pick
                                </div>
                              )}
                              {priceRange === 'high' && (
                                <div className="absolute top-2 left-2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded">
                                  Luxury
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{item.title}</h4>
                              <p className="text-blue-600 font-bold mb-2">{item.price}</p>
                              <p className="text-gray-600 text-sm mb-2">{item.source}</p>
                              {item.rating && (
                                <div className="flex items-center mb-1">
                                  <span className="text-yellow-500 mr-1">★</span>
                                  <span>{item.rating}</span>
                                  {item.reviews && (
                                    <span className="text-gray-500 text-xs ml-1">({item.reviews})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
          
          {/* Non-categorized Recommendations (Fallback) */}
          {recommendations.length > 0 && Object.keys(categorizedRecommendations).length === 0 && (
            <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Fashion Recommendations</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((item, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
                    <a 
                      href={item.link || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="block"
                      onClick={(e) => {
                        // Validate the link before allowing navigation
                        if (!item.link || item.link === '#') {
                          e.preventDefault();
                          alert('Product link is not available');
                          return;
                        }
                        
                        // Check if the link is properly formatted
                        const isValidUrl = (url: string) => {
                          try {
                            new URL(url);
                            return true;
                          } catch (e) {
                            return false;
                          }
                        };
                        
                        if (!isValidUrl(item.link)) {
                          e.preventDefault();
                          // Try to fix the URL by adding https://
                          const fixedUrl = `https://${item.link}`;
                          if (isValidUrl(fixedUrl)) {
                            // Open the fixed URL
                            window.open(fixedUrl, '_blank', 'noopener,noreferrer');
                          } else {
                            alert('Invalid product link format');
                          }
                        }
                        
                        // Track click for analytics (optional)
                        console.log(`Clicked on product: ${item.title}`);
                      }}
                    >
                      <div className="h-48 bg-gray-200 relative">
                        {item.thumbnail ? (
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-500">
                            No image available
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h4 className="font-medium text-gray-800 mb-2 line-clamp-2">{item.title}</h4>
                        <p className="text-blue-600 font-bold mb-2">{item.price}</p>
                        <p className="text-gray-600 text-sm mb-2">{item.source}</p>
                        {item.rating && (
                          <div className="flex items-center mb-1">
                            <span className="text-yellow-500 mr-1">★</span>
                            <span>{item.rating}</span>
                            {item.reviews && (
                              <span className="text-gray-500 text-xs ml-1">({item.reviews})</span>
                            )}
                          </div>
                        )}
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
