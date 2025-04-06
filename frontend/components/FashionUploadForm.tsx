import { Sparkles, Upload, UserCircle2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { getFashionRecommendations } from "../services/fashionService";

interface FashionUploadFormProps {
  onSubmitSuccess?: (data: any) => void;
}

export default function FashionUploadForm({ onSubmitSuccess }: FashionUploadFormProps) {
  const router = useRouter();
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
      const response = await getFashionRecommendations(inspirationImages, profileImage, budget, styleDescription);
      
      const encodedResults = encodeURIComponent(JSON.stringify(response));
      router.push(`/results?results=${encodedResults}`);
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
