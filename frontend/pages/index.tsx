import { useState } from 'react';
import Head from 'next/head';
import ImageUploader from '../components/ImageUploader';
import StyleForm from '../components/StyleForm';
import RecommendationResults from '../components/RecommendationResults';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

// Define types for our recommendation data
type Recommendation = {
  title: string;
  link: string;
  source: string;
  price: string;
  thumbnail: string;
  rating?: number;
  reviews?: number;
  extensions: string[];
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    // Create a preview URL for the uploaded image
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (formData: {
    styleDescription: string;
    skinColor: string;
    gender: string;
    expression: string;
  }) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create form data for API request
      const apiFormData = new FormData();
      apiFormData.append('style_description', formData.styleDescription);
      
      if (formData.skinColor) {
        apiFormData.append('skin_color', formData.skinColor);
      }
      
      if (formData.gender) {
        apiFormData.append('gender', formData.gender);
      }
      
      if (formData.expression) {
        apiFormData.append('expression', formData.expression);
      }
      
      if (uploadedImage) {
        apiFormData.append('image', uploadedImage);
      }
      
      // Make API request to backend
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/recommendations`, apiFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update recommendations state with API response
      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to fetch recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Head>
        <title>Fashion Perplexity | Personalized Fashion Recommendations</title>
        <meta name="description" content="Get personalized fashion recommendations based on your style preferences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-primary-800 mb-4">Fashion Perplexity</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload images of your preferred fashion style and get personalized recommendations tailored to your preferences.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Upload Your Style</h2>
            <ImageUploader onImageUpload={handleImageUpload} imagePreview={imagePreview} />
          </div>

          <div className="card p-6">
            <h2 className="text-2xl font-semibold mb-6">Describe Your Style</h2>
            <StyleForm onSubmit={handleSubmit} isLoading={isLoading} />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8" role="alert">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-lg text-gray-600">Finding the perfect fashion recommendations for you...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <RecommendationResults recommendations={recommendations} />
        ) : null}
      </main>

      <Footer />
    </div>
  );
}
