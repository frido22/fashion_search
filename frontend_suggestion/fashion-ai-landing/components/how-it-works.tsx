import { Card, CardContent } from "@/components/ui/card"
import { Upload, Sparkles, ShoppingBag } from "lucide-react"

const steps = [
  {
    id: 1,
    title: "Upload Your Images",
    description:
      "Share both your fashion inspiration and a photo of yourself to help our AI understand your style goals.",
    icon: <Upload className="h-8 w-8" />,
  },
  {
    id: 2,
    title: "AI Analysis",
    description:
      "Our advanced AI analyzes your inputs to create personalized style recommendations that match your preferences and budget.",
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 3,
    title: "Shop Your Looks",
    description:
      "Browse AI-curated outfits and experience virtual try-ons to see how each style would look on you before purchasing.",
    icon: <ShoppingBag className="h-8 w-8" />,
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="container mx-auto px-4 py-16 bg-black text-white rounded-3xl my-8">
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-4">How It Works</h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Our AI-powered platform makes finding your perfect style match simple and intuitive.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step) => (
          <Card key={step.id} className="border-0 shadow-md bg-white text-black">
            <CardContent className="p-8 text-center">
              <div className="bg-black/5 rounded-full p-4 inline-flex mb-6">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

