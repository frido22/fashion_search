"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Sparkles, Plus, User } from "lucide-react"

export default function FashionUploadForm() {
  const [inspirationImages, setInspirationImages] = useState<string[]>([])
  const [selfImage, setSelfImage] = useState<string | null>(null)
  const [budget, setBudget] = useState<string>("medium")

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      const reader = new FileReader()
      reader.onload = (e) => {
        setInspirationImages((prev) => [...prev, e.target?.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSelfImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelfImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <section id="fashion-upload" className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <Card className="border border-black/10 shadow-lg rounded-xl overflow-hidden bg-white">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Find Your Perfect Style Match</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Fashion Inspiration Upload */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Upload Fashion Inspiration</h3>
                  <p className="text-sm text-gray-500">Share images that represent your style goals</p>
                </div>

                <div className="grid grid-cols-2 gap-2 h-[300px]">
                  {/* Display uploaded inspiration images */}
                  {inspirationImages.map((img, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-md overflow-hidden border border-gray-200"
                    >
                      <Image
                        src={img || "/placeholder.svg"}
                        alt={`Fashion inspiration ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 bg-white/80"
                        onClick={() => setInspirationImages((prev) => prev.filter((_, i) => i !== index))}
                      >
                        ✕
                      </Button>
                    </div>
                  ))}

                  {/* Upload new inspiration image */}
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-md flex flex-col items-center justify-center bg-gray-50/50">
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="inspiration-upload"
                        onChange={handleInspirationUpload}
                      />
                      <Plus className="h-8 w-8 text-gray-400 mb-2" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => document.getElementById("inspiration-upload")?.click()}
                      >
                        Add Image
                      </Button>
                    </div>
                  </div>

                  {/* Grid-like shadows to imply multiple photos */}
                  <div className="relative aspect-square">
                    <div className="absolute inset-0 border-2 border-dashed border-gray-200 rounded-md flex items-center justify-center bg-gray-50/50">
                      <div className="text-gray-300 text-xs">More photos</div>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-gray-500 italic mt-2">
                  Upload multiple inspiration photos to help our AI understand your style
                </p>
              </div>

              {/* Self Image Upload */}
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-medium">Upload Your Photo</h3>
                  <p className="text-sm text-gray-500">We'll use this for virtual try-on recommendations</p>
                </div>
                {selfImage ? (
                  <div className="relative h-[300px] rounded-md overflow-hidden border border-gray-200">
                    <Image src={selfImage || "/placeholder.svg"} alt="Your photo" fill className="object-cover" />
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute bottom-2 right-2"
                      onClick={() => setSelfImage(null)}
                    >
                      Change
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-md p-4 text-center h-[300px] flex flex-col items-center justify-center bg-gray-50/50">
                    <div className="relative w-20 h-40 mb-4 flex items-center justify-center">
                      <User className="w-full h-full text-gray-300" strokeWidth={1} />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Upload a full-body photo of yourself</p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="self-upload"
                      onChange={handleSelfImageUpload}
                    />
                    <Button variant="outline" onClick={() => document.getElementById("self-upload")?.click()}>
                      Select Image
                    </Button>
                  </div>
                )}
                <div className="h-[22px]"></div> {/* Spacer to match the height of the helper text on the left */}
              </div>
            </div>

            {/* Budget Selection */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Select Your Budget</h3>
              <RadioGroup
                defaultValue="medium"
                value={budget}
                onValueChange={setBudget}
                className="flex flex-wrap gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="budget-low" />
                  <Label htmlFor="budget-low">Low</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="budget-medium" />
                  <Label htmlFor="budget-medium">Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="budget-high" />
                  <Label htmlFor="budget-high">High</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Additional Information */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Additional Information</h3>
              <Textarea
                placeholder="Tell us more about your preferences (gender, specific event, style preferences, etc.)"
                className="min-h-[120px]"
              />
            </div>

            <Button
              className="w-full bg-black hover:bg-black/90 text-white py-6"
              size="lg"
              disabled={inspirationImages.length === 0 || !selfImage}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Personalized Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

