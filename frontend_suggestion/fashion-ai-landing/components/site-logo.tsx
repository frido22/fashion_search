import Image from "next/image"

interface SiteLogoProps {
  className?: string
  size?: "small" | "medium" | "large"
  textColor?: string
}

export default function SiteLogo({ className = "", size = "medium", textColor = "text-black" }: SiteLogoProps) {
  const sizes = {
    small: { width: 100, height: 60 },
    medium: { width: 150, height: 90 },
    large: { width: 220, height: 130 },
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Moda_A%20Logo-P885wcTCZYTFe5mklfb30T4RbL9OZB.png"
        alt="MODA.AI Logo"
        width={sizes[size].width}
        height={sizes[size].height}
        className="object-contain"
        priority
        onError={(e) => console.error("Logo image failed to load", e)}
      />
    </div>
  )
}

