import React, { useState } from "react";
import { GeneratedImage } from "../types";
import { Heart, Download, Eye, Sparkles, Filter } from "lucide-react";

interface GalleryProps {
  images: GeneratedImage[];
  isGenerating: boolean;
  onSelectImage: (img: GeneratedImage) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onShowToast: (msg: string) => void;
  generatingPrompt?: string;
}

export const Gallery: React.FC<GalleryProps> = ({
  images,
  isGenerating,
  onSelectImage,
  onToggleFavorite,
  onShowToast,
  generatingPrompt,
}) => {
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const filteredImages = images.filter((img) => {
    if (filter === "favorites") return img.isFavorite;
    return true;
  });

  const handleDownload = (img: GeneratedImage, e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = img.url;
    link.download = `AuraAI-${img.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Image download started!");
  };

  return (
    <div className="w-full mb-8">
      {/* Gallery Header & Tabs */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Creations Gallery</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-gray-400 border border-[#3e3e3e]">
              {images.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1 bg-[#222222] p-1 rounded-xl border border-[#333]">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 rounded-lg transition-all ${
              filter === "all"
                ? "bg-[#157ff0] text-white font-medium shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("favorites")}
            className={`text-xs px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              filter === "favorites"
                ? "bg-[#157ff0] text-white font-medium shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
            Favorites
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="gallery grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {/* Loading Target Slot during image generation */}
        {isGenerating && (
          <div
            id="target-slot"
            className="img-card bg-[#2d2d2d] border-2 border-dashed border-[#157ff0] rounded-xl h-[180px] sm:h-[220px] flex flex-col items-center justify-center relative overflow-hidden shadow-2xl p-4 text-center animate-pulse"
          >
            <div className="loading-spinner mb-3 border-3 border-white/10 border-t-[#157ff0] rounded-full w-8 h-8 animate-spin" />
            <span className="text-xs font-semibold text-[#38bdf8] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              Synthesizing...
            </span>
            <p className="text-[10px] text-gray-400 mt-1 line-clamp-2 px-2 italic">
              "{generatingPrompt || "Rendering vision pixels..."}"
            </p>
          </div>
        )}

        {filteredImages.map((img) => (
          <div
            key={img.id}
            onClick={() => onSelectImage(img)}
            className="img-card group bg-[#2d2d2d] rounded-xl h-[180px] sm:h-[220px] relative overflow-hidden shadow-lg border border-[#383838] hover:border-[#157ff0]/60 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <img
              src={img.url}
              alt={img.prompt}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] bg-black/60 backdrop-blur text-[#38bdf8] font-medium px-2 py-0.5 rounded-full border border-white/10">
                  {img.style || "AI"}
                </span>

                <button
                  type="button"
                  onClick={(e) => onToggleFavorite(img.id, e)}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-black text-white transition-colors"
                  title="Favorite"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      img.isFavorite
                        ? "text-rose-500 fill-rose-500"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              </div>

              <div>
                <p className="text-xs text-white line-clamp-2 font-medium leading-snug mb-1">
                  {img.prompt}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-300">
                  <span>{img.createdAt}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleDownload(img, e)}
                      className="p-1 rounded hover:bg-white/20 text-white"
                      title="Download PNG"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-white/20 text-white"
                      title="View full image"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredImages.length === 0 && !isGenerating && (
        <div className="text-center py-12 px-4 bg-[#222] rounded-2xl border border-[#333]">
          <p className="text-gray-400 text-sm">
            {filter === "favorites"
              ? "No favorite images saved yet."
              : "No images generated yet."}
          </p>
        </div>
      )}
    </div>
  );
};
