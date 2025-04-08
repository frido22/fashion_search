import Image from 'next/image';
import { useRouter } from 'next/router';

interface ProductCardProps {
  thumbnailURL: string;
  description: string;
  productURL: string;
  price: string;
}

export function ProductCard({ thumbnailURL, description, productURL, price }: ProductCardProps) {
  const router = useRouter();

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transform transition-transform hover:scale-105"
      onClick={() => window.open(productURL, '_blank')}
    >
      <div className="relative h-48 w-full">
        <Image
          src={thumbnailURL}
          alt={description}
          fill
          style={{ objectFit: 'cover' }}
        />
      </div>
      <div className="p-4">
        <p className="text-gray-800 font-medium mb-2">{description}</p>
        <p className="text-gray-600">{price}</p>
      </div>
    </div>
  );
} 