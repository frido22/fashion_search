import Image from "next/image"

export default function FashionBackground() {
  // Real fashion image URLs - replace these with your own images
  const fashionImages = [
    {
      src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1000",
      alt: "Street fashion model in urban setting",
      className: "absolute top-10 -left-10 w-96 h-[600px] object-cover rounded-lg opacity-40 rotate-3 hidden lg:block",
    },
    {
      src: "https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1000",
      alt: "Fashion week street style",
      className:
        "absolute top-40 -right-10 w-80 h-[500px] object-cover rounded-lg opacity-35 -rotate-2 hidden lg:block",
    },
    {
      src: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?q=80&w=1000",
      alt: "Minimalist fashion outfit",
      className:
        "absolute bottom-20 -left-10 w-80 h-[550px] object-cover rounded-lg opacity-40 rotate-2 hidden lg:block",
    },
    {
      src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1000",
      alt: "High fashion street look",
      className:
        "absolute bottom-40 -right-10 w-96 h-[600px] object-cover rounded-lg opacity-35 -rotate-3 hidden lg:block",
    },
  ]

  return (
    <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-pink-50/70 via-purple-50/70 to-blue-50/70 backdrop-blur-sm"></div>

      {fashionImages.map((image, index) => (
        <div key={index} className={image.className}>
          <Image src={image.src || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
        </div>
      ))}

      {/* Diagonal lines - fashion runway inspired */}
      <div className="absolute h-px w-full top-1/4 left-0 bg-gradient-to-r from-transparent via-black/5 to-transparent transform -rotate-6"></div>
      <div className="absolute h-px w-full top-2/4 left-0 bg-gradient-to-r from-transparent via-black/5 to-transparent transform rotate-3"></div>
      <div className="absolute h-px w-full top-3/4 left-0 bg-gradient-to-r from-transparent via-black/5 to-transparent transform -rotate-2"></div>
    </div>
  )
}

