"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, ShoppingBag, Sparkles } from "lucide-react"

// Sample data for demonstration - Evening Elegance theme
const eveningEleganceLooks = [
  {
    id: 1,
    name: "Classic Glamour",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000",
    description: "Timeless elegance with a modern twist, perfect for formal evening events.",
    items: [
      {
        id: 101,
        category: "Dress",
        name: "Black Satin Gown",
        brand: "EveningChic",
        price: "$245",
        image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=1000",
        link: "#",
      },
      {
        id: 102,
        category: "Shoes",
        name: "Crystal Embellished Heels",
        brand: "LuxStep",
        price: "$189",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1000",
        link: "#",
      },
      {
        id: 103,
        category: "Accessories",
        name: "Diamond Drop Earrings",
        brand: "GlamJewels",
        price: "$120",
        image: "https://images.unsplash.com/photo-1630019852942-f89202989a59?q=80&w=1000",
        link: "#",
      },
      {
        id: 104,
        category: "Accessories",
        name: "Satin Clutch",
        brand: "EveningBags",
        price: "$95",
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=1000",
        link: "#",
      },
    ],
  },
  {
    id: 2,
    name: "Modern Sophistication",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000",
    description: "Contemporary elegance with clean lines and minimalist accessories.",
    items: [
      {
        id: 201,
        category: "Dress",
        name: "Asymmetric Midi Dress",
        brand: "ModernGlam",
        price: "$220",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000",
        link: "#",
      },
      {
        id: 202,
        category: "Shoes",
        name: "Strappy Metallic Sandals",
        brand: "UrbanStep",
        price: "$165",
        image: "https://images.unsplash.com/photo-1554238113-6d3dbed5cf55?q=80&w=1000",
        link: "#",
      },
      {
        id: 203,
        category: "Accessories",
        name: "Geometric Gold Cuff",
        brand: "MinimalistLux",
        price: "$85",
        image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=1000",
        link: "#",
      },
      {
        id: 204,
        category: "Accessories",
        name: "Structured Metallic Clutch",
        brand: "ArchBags",
        price: "$110",
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1000",
        link: "#",
      },
    ],
  },
  {
    id: 3,
    name: "Romantic Allure",
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000",
    description: "Soft, flowing silhouettes with feminine details for a romantic evening look.",
    items: [
      {
        id: 301,
        category: "Dress",
        name: "Blush Chiffon Gown",
        brand: "SoftGlam",
        price: "$275",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?q=80&w=1000",
        link: "#",
      },
      {
        id: 302,
        category: "Shoes",
        name: "Nude Ankle Strap Heels",
        brand: "ElegantStep",
        price: "$145",
        image: "https://images.unsplash.com/photo-1573100925118-870b8efc799d?q=80&w=1000",
        link: "#",
      },
      {
        id: 303,
        category: "Accessories",
        name: "Pearl Drop Earrings",
        brand: "SoftLux",
        price: "$95",
        image: "https://images.unsplash.com/photo-1635767798638-3665c3f02acf?q=80&w=1000",
        link: "#",
      },
      {
        id: 304,
        category: "Accessories",
        name: "Crystal Embellished Hairpin",
        brand: "HairGlam",
        price: "$65",
        image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=1000",
        link: "#",
      },
    ],
  },
  {
    id: 4,
    name: "Bold Statement",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000",
    description: "Make an entrance with striking colors and statement pieces that command attention.",
    items: [
      {
        id: 401,
        category: "Dress",
        name: "Red Sequin Gown",
        brand: "StatementChic",
        price: "$295",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=1000",
        link: "#",
      },
      {
        id: 402,
        category: "Shoes",
        name: "Black Platform Heels",
        brand: "BoldStep",
        price: "$175",
        image: "https://images.unsplash.com/photo-1596703263926-eb0762ee17e4?q=80&w=1000",
        link: "#",
      },
      {
        id: 403,
        category: "Accessories",
        name: "Statement Chandelier Earrings",
        brand: "DramaGlam",
        price: "$110",
        image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?q=80&w=1000",
        link: "#",
      },
      {
        id: 404,
        category: "Accessories",
        name: "Gold Cuff Bracelet",
        brand: "LuxAccess",
        price: "$85",
        image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000",
        link: "#",
      },
    ],
  },
]

export default function RecommendedLooks() {
  const [selectedLook, setSelectedLook] = useState<number | null>(null)

  // This would come from user input in a real application
  const detectedStyle = "Evening Elegance"
  const recommendedLooks = eveningEleganceLooks

  const handleLookClick = (lookId: number) => {
    setSelectedLook(lookId === selectedLook ? null : lookId)
  }

  const selectedLookData = recommendedLooks.find((look) => look.id === selectedLook)

  return (
    <section id="recommended-looks" className="container mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-4">Recommended Fashion Looks</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Based on your uploads, we've identified your style as <span className="font-semibold">{detectedStyle}</span>.
          Here are curated looks that match this aesthetic.
        </p>
      </div>

      {/* Style Theme Card */}
      <div className="bg-black text-white rounded-xl p-6 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000"
            alt="Evening Elegance"
            fill
            className="object-cover"
          />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="md:w-1/4 flex justify-center">
            <div className="bg-white/10 rounded-full p-4 backdrop-blur-sm">
              <Sparkles className="h-12 w-12" />
            </div>
          </div>
          <div className="md:w-3/4 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">Your Style: {detectedStyle}</h3>
            <p className="text-white/80">
              Sophisticated and refined, Evening Elegance is characterized by luxurious fabrics, sleek silhouettes, and
              statement accessories. Perfect for formal events, dinner parties, and special occasions where you want to
              make an impression.
            </p>
          </div>
        </div>
      </div>

      {/* Looks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {recommendedLooks.map((look) => (
          <Card
            key={look.id}
            className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg ${
              selectedLook === look.id ? "ring-2 ring-black" : ""
            }`}
            onClick={() => handleLookClick(look.id)}
          >
            <div className="relative aspect-[3/4]">
              <Image src={look.image || "/placeholder.svg"} alt={look.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                <div className="p-4 text-white">
                  <h3 className="font-semibold text-lg">{look.name}</h3>
                  <p className="text-sm text-white/80">{look.description}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Look Details */}
      {selectedLookData && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 animate-fadeIn">
          <div className="flex flex-col md:flex-row items-start gap-6 mb-8">
            <div className="md:w-1/3">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
                <Image
                  src={selectedLookData.image || "/placeholder.svg"}
                  alt={selectedLookData.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="md:w-2/3">
              <h3 className="text-2xl font-bold mb-2">{selectedLookData.name}</h3>
              <p className="text-gray-600 mb-6">{selectedLookData.description}</p>

              <h4 className="text-lg font-semibold mb-4">Individual Items</h4>

              <Tabs defaultValue="all" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All Items</TabsTrigger>
                  <TabsTrigger value="dress">Dresses</TabsTrigger>
                  <TabsTrigger value="shoes">Shoes</TabsTrigger>
                  <TabsTrigger value="accessories">Accessories</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  {selectedLookData.items.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </TabsContent>

                <TabsContent value="dress" className="space-y-4">
                  {selectedLookData.items
                    .filter((item) => ["Dress", "Gown"].includes(item.category))
                    .map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                </TabsContent>

                <TabsContent value="shoes" className="space-y-4">
                  {selectedLookData.items
                    .filter((item) => item.category === "Shoes")
                    .map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                </TabsContent>

                <TabsContent value="accessories" className="space-y-4">
                  {selectedLookData.items
                    .filter((item) => item.category === "Accessories")
                    .map((item) => (
                      <ItemCard key={item.id} item={item} />
                    ))}
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="flex justify-center">
            <Button className="bg-black hover:bg-black/90 text-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shop Complete Look
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}

interface ItemProps {
  item: {
    id: number
    category: string
    name: string
    brand: string
    price: string
    image: string
    link: string
  }
}

function ItemCard({ item }: ItemProps) {
  return (
    <div className="flex items-center border rounded-lg overflow-hidden bg-white">
      <div className="relative w-24 h-24">
        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
      </div>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-gray-500 uppercase">{item.category}</span>
            <h4 className="font-medium">{item.name}</h4>
            <p className="text-sm text-gray-600">{item.brand}</p>
          </div>
          <div className="text-right">
            <div className="font-semibold">{item.price}</div>
          </div>
        </div>
      </div>
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="p-4 hover:bg-gray-50">
        <ExternalLink className="h-5 w-5 text-gray-500" />
      </a>
    </div>
  )
}

