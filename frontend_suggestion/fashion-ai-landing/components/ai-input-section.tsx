"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Upload, Search, Sparkles } from "lucide-react"

export default function AIInputSection() {
  const [isRecording, setIsRecording] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <section id="ai-input" className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto relative">
        <Card className="border border-black/10 shadow-lg rounded-xl overflow-hidden bg-white relative z-10">
          <CardContent className="p-0">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="w-full grid grid-cols-3 rounded-none h-16 bg-black text-white">
                <TabsTrigger
                  value="text"
                  className="data-[state=active]:bg-white data-[state=active]:text-black h-full transition-colors"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="data-[state=active]:bg-white data-[state=active]:text-black h-full transition-colors"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger
                  value="voice"
                  className="data-[state=active]:bg-white data-[state=active]:text-black h-full transition-colors"
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Voice
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Describe your style preferences</h3>
                  <Textarea
                    placeholder="I like minimalist designs with neutral colors. I prefer sustainable brands with clean silhouettes..."
                    className="min-h-[120px]"
                  />
                  <Button className="w-full bg-black hover:bg-black/90 text-white">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Find My Style
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="image" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Upload an image that represents your style</h3>

                  {uploadedImage ? (
                    <div className="relative aspect-video rounded-md overflow-hidden">
                      <Image
                        src={uploadedImage || "/placeholder.svg"}
                        alt="Uploaded style reference"
                        fill
                        className="object-cover"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute bottom-2 right-2"
                        onClick={() => setUploadedImage(null)}
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-md p-8 text-center">
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 mb-4">Drag and drop an image, or click to browse</p>
                      <Input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={handleImageUpload}
                      />
                      <Button variant="outline" onClick={() => document.getElementById("image-upload")?.click()}>
                        Select Image
                      </Button>
                    </div>
                  )}

                  <Button className="w-full bg-black hover:bg-black/90 text-white" disabled={!uploadedImage}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze My Style
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="voice" className="p-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Describe your style preferences with your voice</h3>

                  <div className="border rounded-md p-8 text-center">
                    <Button
                      variant={isRecording ? "destructive" : "outline"}
                      size="lg"
                      className="rounded-full h-16 w-16"
                      onClick={toggleRecording}
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                    <p className="mt-4 text-sm text-gray-500">
                      {isRecording ? "Recording... Click to stop" : "Click to start recording"}
                    </p>
                  </div>

                  <Button className="w-full bg-black hover:bg-black/90 text-white" disabled={!isRecording}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze My Voice
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

