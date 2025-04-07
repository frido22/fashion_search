import React, { useState } from "react";
import Head from "next/head";
import FashionUploadForm from "../components/FashionUploadForm";
import SiteLogo from "../components/SiteLogo";
import FashionBackground from "../components/FashionBackground";
import { ArrowDown } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Home() {
  const [recommendations, setRecommendations] = useState(null);

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted with data:", data);
    setRecommendations(data.recommendations);
    document.getElementById("recommendations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen relative">
      <Head>
        <title>Fashion Search | AI-Powered Fashion Recommendations</title>
        <meta name="description" content="Get personalized fashion recommendations based on your style preferences and photos." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FashionBackground />

      {/* Hero Section */}
      <section className="container relative mx-auto px-4 py-20 md:py-24 flex flex-col items-center text-center z-10">
        <div className="mb-8">
          <SiteLogo size="large" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Re-defining Fashion Discovery.</h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-12">
          Find new styles, shop recommended "looks" and experience AI-generated fashion recommendations with Fashion Search
        </p>
        <Button
          className="rounded-full px-8 py-6 text-lg bg-black hover:bg-black/90 text-white border-0"
          size="lg"
          onClick={() => {
            document.getElementById("fashion-upload")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          Get Started <ArrowDown className="ml-2 h-5 w-4" />
        </Button>
      </section>

      {/* Fashion Upload Form */}
      <div id="fashion-upload">
        <FashionUploadForm onSubmitSuccess={handleFormSubmit} />
      </div>
      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 mt-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="mb-6 flex justify-center">
            <SiteLogo size="medium" />
          </div>
          <div className="flex justify-center space-x-8 mb-8">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <p className="text-gray-500"> 2023 Fashion Search. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
