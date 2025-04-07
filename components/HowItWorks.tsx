import React from "react";
import { Upload, Star, ShoppingBag } from "lucide-react";

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-black text-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">How It Works</h2>
        <p className="text-center text-gray-400 mb-16 max-w-2xl mx-auto">
          Our AI-powered platform makes finding your perfect style match simple and intuitive.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Upload Your Images */}
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Upload className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Upload Your Images</h3>
            <p className="text-gray-400">
              Share both your fashion inspiration and photos of yourself to help our AI understand your style goals.
            </p>
          </div>

          {/* AI Analysis */}
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">AI Analysis</h3>
            <p className="text-gray-400">
              Our advanced AI analyzes your uploads and preferences to identify your unique style profile.
            </p>
          </div>

          {/* Shop Your Looks */}
          <div className="bg-gray-900 p-8 rounded-lg text-center">
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-4">Shop Your Looks</h3>
            <p className="text-gray-400">
              Browse AI-curated outfits and individual pieces that match your style, budget, and preferences.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
