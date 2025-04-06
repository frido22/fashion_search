import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

const brands = [
  {
    id: 1,
    name: "Minimale",
    description: "Sustainable minimalist essentials",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1000",
    tags: ["Minimalist", "Sustainable", "Neutral"],
  },
  {
    id: 2,
    name: "Eco Chic",
    description: "Eco-friendly statement pieces",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1000",
    tags: ["Eco-friendly", "Bold", "Artisanal"],
  },
  {
    id: 3,
    name: "Urban Nomad",
    description: "Versatile pieces for the modern explorer",
    image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=1000",
    tags: ["Versatile", "Modern", "Functional"],
  },
]

export default function BrandShowcase() {
  return (
    <section id="showcase" className="container mx-auto px-4 py-16 relative">
      <div className="absolute inset-0 bg-black/5 -z-10 rounded-3xl mx-4"></div>
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">Discover Boutique Brands</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Our AI agent connects you with unique fashion brands that align with your personal style and values.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {brands.map((brand) => (
          <Card
            key={brand.id}
            className="overflow-hidden border-0 shadow-md transition-all duration-300 hover:shadow-xl bg-white group"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src={brand.image || "/placeholder.svg"}
                alt={brand.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-2">{brand.name}</h3>
              <p className="text-gray-600 mb-4">{brand.description}</p>
              <div className="flex flex-wrap gap-2">
                {brand.tags.map((tag) => (
                  <span key={tag} className="bg-black text-white text-xs px-3 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

