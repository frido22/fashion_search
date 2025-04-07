import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const statusMessages = [
  {
    title: "Analyzing your style...",
    subtitle: "Finding the perfect fashion matches"
  },
  {
    title: "Processing your preferences...",
    subtitle: "Matching with trending styles"
  },
  {
    title: "Creating your style profile...",
    subtitle: "Discovering unique combinations"
  },
  {
    title: "Almost there...",
    subtitle: "Curating personalized recommendations"
  },
  {
    title: "Finalizing your look...",
    subtitle: "Putting together the perfect ensemble"
  }
];

export default function LoadingAnimation() {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === statusMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentMessage = statusMessages[currentMessageIndex];

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-black"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-8 h-8 text-black animate-pulse" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-lg font-medium text-gray-700">{currentMessage.title}</p>
        <p className="text-sm text-gray-500">{currentMessage.subtitle}</p>
      </div>
    </div>
  );
} 