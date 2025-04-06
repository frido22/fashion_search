import React from "react";

export default function BrandShowcase() {
  // Placeholder for brand logos
  const brands = [
    "Nike", "Adidas", "Zara", "H&M", "Uniqlo", "Gucci"
  ];

  return (
    <section id="showcase" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">Trusted by Fashion Brands</h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          We partner with the best fashion brands to bring you curated looks that match your style.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          {brands.map((brand, index) => (
            <div key={index} className="text-2xl font-bold text-gray-400 hover:text-gray-800 transition-colors">
              {brand}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
