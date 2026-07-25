import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PromptInput } from "./components/PromptInput";
import { Gallery } from "./components/Gallery";
import { ImageModal } from "./components/ImageModal";
import { InstallBanner } from "./components/InstallBanner";
import { Toast } from "./components/Toast";
import { GeneratedImage, AspectRatioOption } from "./types";
import { INITIAL_GALLERY } from "./data/mockGallery";

export default function App() {
  const [images, setImages] = useState<GeneratedImage[]>(INITIAL_GALLERY);
  const [prompt, setPrompt] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<AspectRatioOption>("1:1");
  const [selectedStyle, setSelectedStyle] = useState<string>("None");
  const [negativePrompt, setNegativePrompt] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingPrompt, setGeneratingPrompt] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(true);

  // Check health status on mount
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.apiKeyConfigured === "boolean") {
          setApiKeyConfigured(data.apiKeyConfigured);
        }
      })
      .catch(() => {
        // Fallback assuming ready
      });
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast("Please enter a prompt first!");
      return;
    }

    setIsGenerating(true);
    setGeneratingPrompt(prompt);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style: selectedStyle,
          negativePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate image.");
      }

      const newImg: GeneratedImage = {
        id: `gen-${Date.now()}`,
        url: data.imageUrl,
        prompt: prompt.trim(),
        aspectRatio,
        style: selectedStyle !== "None" ? selectedStyle : undefined,
        createdAt: "Just now",
        isFavorite: false,
        likesCount: 1,
        tags: [selectedStyle, aspectRatio].filter(Boolean) as string[],
      };

      setImages((prev) => [newImg, ...prev]);
      showToast("Image synthesized successfully!");
      // Automatically open modal to view new image
      setSelectedImage(newImg);
    } catch (error: any) {
      console.error("Generation error:", error);
      showToast(error.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
      setGeneratingPrompt("");
    }
  };

  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          const nextFav = !img.isFavorite;
          showToast(nextFav ? "Saved to Favorites!" : "Removed from Favorites.");
          return { ...img, isFavorite: nextFav };
        }
        return img;
      })
    );
    if (selectedImage && selectedImage.id === id) {
      setSelectedImage((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    }
  };

  const handleDeleteImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    showToast("Image deleted.");
  };

  const handleUsePrompt = (newPrompt: string) => {
    setPrompt(newPrompt);
    showToast("Prompt applied to input box!");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col font-sans selection:bg-[#157ff0] selection:text-white">
      {/* Top Navigation */}
      <Header apiKeyConfigured={apiKeyConfigured} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 overflow-y-auto">
        <Hero />

        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          aspectRatio={aspectRatio}
          setAspectRatio={setAspectRatio}
          selectedStyle={selectedStyle}
          setSelectedStyle={setSelectedStyle}
          negativePrompt={negativePrompt}
          setNegativePrompt={setNegativePrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          onShowToast={showToast}
        />

        <Gallery
          images={images}
          isGenerating={isGenerating}
          generatingPrompt={generatingPrompt}
          onSelectImage={(img) => setSelectedImage(img)}
          onToggleFavorite={handleToggleFavorite}
          onShowToast={showToast}
        />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-[#2e2e2e] text-center text-xs text-gray-500 bg-[#141414]">
        <p>AuraAI Studio &copy; {new Date().getFullYear()} &bull; Powered by Gemini AI</p>
      </footer>

      {/* Full Size Image Modal */}
      <ImageModal
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
        onToggleFavorite={handleToggleFavorite}
        onDeleteImage={handleDeleteImage}
        onUsePrompt={handleUsePrompt}
        onShowToast={showToast}
      />

      {/* PWA Install Banner */}
      <InstallBanner onShowToast={showToast} />

      {/* Floating Notification Toast */}
      <Toast message={toastMessage} />
    </div>
  );
}
