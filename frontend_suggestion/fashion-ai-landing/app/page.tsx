"use client"

import { Button } from "@/components/ui/button"
import { ArrowDown } from "lucide-react"
import BrandShowcase from "@/components/brand-showcase"
import HowItWorks from "@/components/how-it-works"
import SiteLogo from "@/components/site-logo"
import FashionBackground from "@/components/fashion-background"
import FashionUploadForm from "@/components/fashion-upload-form"
import RecommendedLooks from "@/components/recommended-looks"

export default function Home() {
  return (
    <div className="min-h-screen relative">
      <FashionBackground />

      {/* Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-black/5">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="w-20"></div> {/* Empty div for spacing */}
          <nav className="hidden md:flex space-x-8">
            <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How It Works
            </a>
            <a href="#showcase" className="text-gray-600 hover:text-black transition-colors">
              Showcase
            </a>
            <a href="#about" className="text-gray-600 hover:text-black transition-colors">
              About
            </a>
          </nav>
          <Button variant="outline" className="rounded-full border-black/20 hover:border-black/40">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container relative mx-auto px-4 py-20 md:py-24 flex flex-col items-center text-center z-10">
        <div className="mb-8">
          <SiteLogo size="large" />
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">Re-defining Fashion Discovery.</h1>
        <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-12">
          Find new styles, shop recommended "looks" and experience AI-generated virtual try-ons with Moda.AI
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
      <FashionUploadForm />

      {/* Recommended Looks */}
      <RecommendedLooks />

      {/* How It Works */}
      <HowItWorks />

      {/* Brand Showcase */}
      <BrandShowcase />

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
          <p className="text-gray-500">© {new Date().getFullYear()} MODA.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

