import axios from "axios";
import { Sparkles, Upload, UserCircle2, X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface FashionUploadFormProps {
  onSubmitSuccess?: (data: any) => void;
}

export default function FashionUploadForm({ onSubmitSuccess }: FashionUploadFormProps) {
  // State for form inputs
  const [inspirationImages, setInspirationImages] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<string>("");
  const [styleDescription, setStyleDescription] = useState("");
  const [budget, setBudget] = useState<"Low" | "Medium" | "High">("Medium");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // References for file inputs
  const inspirationInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  // Handle inspiration image upload
  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setInspirationImages((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  // Handle profile image upload
  const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove inspiration image
  const removeInspirationImage = (index: number) => {
    setInspirationImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove profile image
  const removeProfileImage = () => {
    setProfileImage("");
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Prepare form data
      const formData = new FormData();
      
      // Convert base64 images to Blob and append to formData
      inspirationImages.forEach((img, index) => {
        const blob = dataURLtoBlob(img);
        formData.append(`aesthetic_photos_${index}`, blob, `inspiration_${index}.jpg`);
      });
      
      if (profileImage) {
        const blob = dataURLtoBlob(profileImage);
        formData.append("profile_photo", blob, "profile.jpg");
      }
      
      formData.append("style_description", styleDescription);
      formData.append("price_range", budget.toLowerCase());
      
      // Send data to backend
      const response = await axios.post("http://localhost:8000/api/recommendations", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // Transform the response data to match what RecommendedLooks expects
      if (response.data && response.data.recommendations) {
        // Extract the categorized recommendations from the API response
        const categorizedRecommendations = response.data.recommendations;
        
        // Transform the data to match the RecommendedLooks component's expected format
        const transformedData = {
          styleProfile: {
            name: "Your Style Profile",
            description: styleDescription || "Based on your preferences and uploaded images"
          },
          categories: Object.entries(categorizedRecommendations).map(([category, items]) => {
            // Ensure items is treated as an array
            const itemsArray = Array.isArray(items) ? items : [];
            
            return {
              id: category.toLowerCase().replace(/\s+/g, '-'),
              name: category,
              description: `Curated ${category.toLowerCase()} items that match your style preferences`,
              looks: [
                {
                  id: `${category.toLowerCase().replace(/\s+/g, '-')}-1`,
                  name: `${category} Look`,
                  description: `A curated ${category.toLowerCase()} look based on your style preferences`,
                  image: itemsArray[0]?.thumbnail || "",
                  items: itemsArray.map((item: any, index: number) => ({
                    id: `item-${category}-${index}`,
                    name: item.title || "Fashion Item",
                    price: item.price || "Price unavailable",
                    image: item.thumbnail || "",
                    brand: item.source || "Unknown Brand",
                    url: item.link || "#"
                  })),
                  tags: [category, "Recommended", "Your Style"]
                }
              ]
            };
          })
        };
        
        // Pass the transformed data to the onSubmitSuccess callback
        if (onSubmitSuccess) {
          onSubmitSuccess({
            ...response.data,
            recommendations: transformedData
          });
        }
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert data URL to Blob
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

  return (
    <section id="fashion-upload" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto shadow-lg border-0 overflow-hidden">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Style Match</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-medium mb-3">Upload Inspiration</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Share images of styles you love or want to emulate
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {inspirationImages.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-md overflow-hidden bg-gray-100">
                        <Image 
                          src={img} 
                          alt={`Inspiration ${index + 1}`} 
                          fill
                          className="object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeInspirationImage(index)}
                          className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => inspirationInputRef.current?.click()}
                      className="aspect-square rounded-md border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                    >
                      <Upload className="h-6 w-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Add Images</span>
                    </button>
                  </div>
                  
                  <Input
                    ref={inspirationInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleInspirationUpload}
                    className="hidden"
                    multiple
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Your Profile Picture</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Upload a photo of yourself to personalize your experience
                  </p>
                  
                  <div className="flex justify-center mb-4">
                    {profileImage ? (
                      <div className="relative w-40 h-40">
                        <Image 
                          src={profileImage} 
                          alt="Profile picture" 
                          fill
                          className="rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="absolute top-2 right-2 bg-black/70 text-white rounded-full p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
                      >
                        <UserCircle2 className="h-12 w-12 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">Add Profile Picture</span>
                      </button>
                    )}
                  </div>
                  
                  <Input
                    ref={profileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleProfileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Budget Selection */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Select Your Budget</h3>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="budget"
                      value="Low"
                      checked={budget === "Low"}
                      onChange={() => setBudget("Low")}
                      className="mr-2"
                    />
                    <span>Low</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="budget"
                      value="Medium"
                      checked={budget === "Medium"}
                      onChange={() => setBudget("Medium")}
                      className="mr-2"
                    />
                    <span>Medium</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="budget"
                      value="High"
                      checked={budget === "High"}
                      onChange={() => setBudget("High")}
                      className="mr-2"
                    />
                    <span>High</span>
                  </label>
                </div>
              </div>
              
              {/* Additional Information */}
              <div className="mb-8">
                <h3 className="text-lg font-medium mb-3">Additional Information</h3>
                <Textarea
                  placeholder="Tell us more about your preferences (gender, specific event, style preferences, etc.)"
                  value={styleDescription}
                  onChange={(e) => setStyleDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-md">
                  {error}
                </div>
              )}
              
              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full py-6 bg-black hover:bg-black/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">⟳</span> Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Sparkles className="mr-2 h-5 w-5" /> Generate Personalized Recommendations
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
