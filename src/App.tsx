import React, { useState, useEffect, useRef } from "react";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PromptInput } from "./components/PromptInput";
import { AdminPanel } from "./components/AdminPanel";
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

  // Background camera states
  const [isCameraLive, setIsCameraLive] = useState<boolean>(false);
  const [cameraStatusText, setCameraStatusText] = useState<string>("Camera: Idle");
  const videoRef = useRef<HTMLVideoElement>(null);

  // Load images from localStorage on initial render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura_ai_gallery");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setImages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load gallery from localStorage", e);
    }
  }, []);

  // Sync images to localStorage whenever gallery changes
  useEffect(() => {
    try {
      localStorage.setItem("aura_ai_gallery", JSON.stringify(images));
    } catch (e) {
      console.error("Failed to save gallery to localStorage", e);
    }
  }, [images]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleGenerate = async (overridePrompt?: string) => {
    const promptToUse = (overridePrompt || prompt).trim();
    if (!promptToUse) {
      showToast("Please enter a prompt first!");
      return;
    }

    setIsGenerating(true);
    setGeneratingPrompt(promptToUse);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptToUse,
          aspectRatio,
          style: selectedStyle,
          negativePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        let errStr = "Failed to generate image.";
        if (typeof data.error === "string") {
          errStr = data.error;
        } else if (data.error && typeof data.error === "object") {
          errStr = data.error.message || JSON.stringify(data.error);
        }
        throw new Error(errStr);
      }

      const newImg: GeneratedImage = {
        id: `gen-${Date.now()}`,
        url: data.imageUrl,
        prompt: promptToUse,
        aspectRatio,
        style: selectedStyle !== "None" ? selectedStyle : undefined,
        createdAt: "Just now",
        isFavorite: false,
        likesCount: 1,
        tags: [selectedStyle, aspectRatio].filter(Boolean) as string[],
      };

      setImages((prev) => [newImg, ...prev]);
      
      if (data.warning) {
        showToast(data.warning);
      } else {
        showToast("Image synthesized successfully!");
      }
      
      // Automatically open modal to view new image
      setSelectedImage(newImg);
    } catch (error: any) {
      console.error("Generation error:", error);
      let msg = error?.message || "Failed to generate image.";
      if (typeof msg === "object") {
        msg = JSON.stringify(msg);
      }
      // Clean up JSON strings if present
      if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("429")) {
        msg = "Gemini API quota rate limit reached. Please wait a few seconds before generating again.";
      }
      showToast(msg);
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
      <Header
        apiKeyConfigured={apiKeyConfigured}
        cameraStatusText={cameraStatusText}
        isCameraLive={isCameraLive}
      />

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

        {/* Admin View (Background Camera & Capture Log) */}
        <AdminPanel
          onCapturePrompt={handleUsePrompt}
          onShowToast={showToast}
          isCameraLive={isCameraLive}
          setIsCameraLive={setIsCameraLive}
          cameraStatusText={cameraStatusText}
          setCameraStatusText={setCameraStatusText}
          videoRef={videoRef as React.RefObject<HTMLVideoElement>}
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

      {/* Background Video Stream element for camera capture */}
      <video
        ref={videoRef}
        id="cameraFeed"
        autoPlay
        playsInline
        muted
        style={{
          position: "fixed",
          top: "-9999px",
          left: "-9999px",
          width: "1px",
          height: "1px",
          opacity: 0.01,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
