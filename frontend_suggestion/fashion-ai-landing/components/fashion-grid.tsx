import Image from "next/image"

export default function FashionGrid() {
  // Real fashion image URLs - replace these with your own images
  const fashionImages = [
    "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1000",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?q=80&w=1000",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1000",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000",
    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1000",
    "https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93?q=80&w=1000",
  ]

  return (
    <div className="grid grid-cols-3 gap-2 md:gap-4 max-w-4xl mx-auto my-16">
      {fashionImages.map((src, index) => (
        <div
          key={index}
          className={`relative overflow-hidden rounded-lg ${index % 3 === 0 ? "col-span-2 row-span-2" : "col-span-1"}`}
        >
          <div className="relative aspect-[3/4] w-full h-full">
            <Image
              src={src || "/placeholder.svg"}
              alt={`Fashion inspiration ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm font-medium">Trending Style</p>
                <p className="text-xs opacity-80">Discover More</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

