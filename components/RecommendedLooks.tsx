import React, { useState } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import Image from "next/image";
import { Star } from "lucide-react";

// Define types for our recommendations
interface FashionItem {
  id: string;
  name: string;
  price: string;
  image: string;
  brand: string;
  url: string;
}

interface FashionLook {
  id: string;
  name: string;
  description: string;
  image: string;
  items: FashionItem[];
  tags: string[];
}

interface StyleCategory {
  id: string;
  name: string;
  description: string;
  looks: FashionLook[];
}

interface RecommendedLooksProps {
  recommendations?: {
    styleProfile: {
      name: string;
      description: string;
    };
    categories: StyleCategory[];
  };
}

export default function RecommendedLooks({ recommendations }: RecommendedLooksProps) {
  const [selectedLook, setSelectedLook] = useState<FashionLook | null>(null);

  // If no recommendations are provided, use placeholder data
  const placeholderData = {
    styleProfile: {
      name: "Evening Elegance",
      description: "Sophisticated and refined, Evening Elegance is characterized by luxurious fabrics, sleek silhouettes, and statement accessories. Perfect for formal events, dinner parties, and special occasions where you want to make an impression."
    },
    categories: [
      {
        id: "classic",
        name: "Classic Glamour",
        description: "Timeless elegance with a modern twist, perfect for formal evening events.",
        looks: [
          {
            id: "classic-1",
            name: "Black Tie Affair",
            description: "A sophisticated ensemble perfect for upscale events.",
            image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            items: [
              {
                id: "item-1",
                name: "Silk Evening Gown",
                price: "$299",
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Elegance",
                url: "#"
              },
              {
                id: "item-2",
                name: "Crystal Earrings",
                price: "$89",
                image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Sparkle",
                url: "#"
              }
            ],
            tags: ["Formal", "Elegant", "Evening"]
          }
        ]
      },
      {
        id: "modern",
        name: "Modern Sophistication",
        description: "Contemporary elegance with clean lines and minimalist accessories.",
        looks: [
          {
            id: "modern-1",
            name: "Minimalist Chic",
            description: "Clean lines and subtle details for a modern elegant look.",
            image: "https://images.unsplash.com/photo-1583759136431-9d70db2eb04c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            items: [
              {
                id: "item-3",
                name: "Structured Blazer",
                price: "$189",
                image: "https://images.unsplash.com/photo-1583759136431-9d70db2eb04c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Modern Edge",
                url: "#"
              },
              {
                id: "item-4",
                name: "High-Waisted Trousers",
                price: "$120",
                image: "https://images.unsplash.com/photo-1551854638-d9d3a494cea4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Tailored",
                url: "#"
              }
            ],
            tags: ["Modern", "Minimalist", "Professional"]
          }
        ]
      },
      {
        id: "romantic",
        name: "Romantic Allure",
        description: "Soft, flowing silhouettes with feminine details for a romantic evening look.",
        looks: [
          {
            id: "romantic-1",
            name: "Ethereal Dream",
            description: "Delicate fabrics and soft colors for a dreamy romantic look.",
            image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            items: [
              {
                id: "item-5",
                name: "Floral Maxi Dress",
                price: "$159",
                image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Bloom",
                url: "#"
              },
              {
                id: "item-6",
                name: "Pearl Hair Pins",
                price: "$45",
                image: "https://images.unsplash.com/photo-1589798733650-4d701ea9bc64?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Delicate",
                url: "#"
              }
            ],
            tags: ["Romantic", "Feminine", "Dreamy"]
          }
        ]
      },
      {
        id: "bold",
        name: "Bold Statement",
        description: "Make an entrance with striking colors and statement pieces that command attention.",
        looks: [
          {
            id: "bold-1",
            name: "Power Move",
            description: "Bold colors and strong silhouettes for a confident statement.",
            image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
            items: [
              {
                id: "item-7",
                name: "Red Power Suit",
                price: "$259",
                image: "https://images.unsplash.com/photo-1589465885857-44edb59bbff2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Bold",
                url: "#"
              },
              {
                id: "item-8",
                name: "Statement Necklace",
                price: "$79",
                image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
                brand: "Accent",
                url: "#"
              }
            ],
            tags: ["Bold", "Confident", "Statement"]
          }
        ]
      }
    ]
  };

  const data = recommendations || placeholderData;
  const { styleProfile, categories } = data;

  const handleLookClick = (look: FashionLook) => {
    setSelectedLook(look);
  };

  const closeLookDetails = () => {
    setSelectedLook(null);
  };

  // If no recommendations yet, don't render anything
  if (!recommendations && !placeholderData) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        {/* Style Profile Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Recommended Fashion Looks</h2>
          <p className="text-gray-600 mb-6 max-w-3xl mx-auto">
            Based on your uploads, we've identified your style as <span className="font-semibold">{styleProfile.name}</span>. Here are curated looks that match this aesthetic.
          </p>
          
          {/* Style Profile Card */}
          <div className="bg-black text-white p-6 rounded-lg max-w-3xl mx-auto">
            <div className="flex items-center mb-2">
              <Star className="h-6 w-6 mr-2 text-yellow-400" />
              <h3 className="text-xl font-bold">Your Style: {styleProfile.name}</h3>
            </div>
            <p className="text-gray-300">{styleProfile.description}</p>
          </div>
        </div>

        {/* Tabs for different style categories */}
        <Tabs defaultValue={categories[0].id} className="max-w-5xl mx-auto">
          <TabsList className="mb-8 flex justify-center space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <TabsTrigger 
                key={category.id} 
                value={category.id}
                className="px-6 py-3 rounded-full data-[state=active]:bg-black data-[state=active]:text-white"
              >
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id}>
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-6">{category.description}</p>
              </div>
              
              {/* Grid of looks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {category.looks.map((look) => (
                  <div key={look.id} className="group cursor-pointer" onClick={() => handleLookClick(look)}>
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-3">
                      <Image 
                        src={look.image} 
                        alt={look.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <div className="p-4 text-white">
                          <h4 className="font-medium">{look.name}</h4>
                        </div>
                      </div>
                    </div>
                    <h4 className="font-medium">{look.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{look.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {look.tags.map((tag, idx) => (
                        <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        {/* Look Details Modal */}
        {selectedLook && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold">{selectedLook.name}</h3>
                  <button 
                    onClick={closeLookDetails}
                    className="text-gray-500 hover:text-gray-800"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                    <Image 
                      src={selectedLook.image} 
                      alt={selectedLook.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <p className="text-gray-700 mb-6">{selectedLook.description}</p>
                    
                    <h4 className="text-lg font-semibold mb-4">Items in this look:</h4>
                    <div className="space-y-4">
                      {selectedLook.items.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4">
                          <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                            <Image 
                              src={item.image} 
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-grow">
                            <h5 className="font-medium">{item.name}</h5>
                            <p className="text-sm text-gray-500">{item.brand}</p>
                            <p className="text-sm font-semibold">{item.price}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex-shrink-0"
                            onClick={() => window.open(item.url, '_blank')}
                          >
                            Shop
                          </Button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8">
                      <Button 
                        className="w-full"
                        onClick={() => window.open(selectedLook.items[0].url, '_blank')}
                      >
                        Shop Complete Look
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
