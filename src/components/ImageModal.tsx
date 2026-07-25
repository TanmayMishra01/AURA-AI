import React from "react";
import { GeneratedImage } from "../types";
import {
  X,
  Download,
  Copy,
  Heart,
  Trash2,
  Sparkles,
  Share2,
} from "lucide-react";

interface ImageModalProps {
  image: GeneratedImage | null;
  onClose: () => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeleteImage: (id: string) => void;
  onUsePrompt: (prompt: string) => void;
  onShowToast: (msg: string) => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({
  image,
  onClose,
  onToggleFavorite,
  onDeleteImage,
  onUsePrompt,
  onShowToast,
}) => {
  if (!image) return null;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    onShowToast("Prompt copied to clipboard!");
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = image.url;
    link.download = `AuraAI-${image.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast("Downloading high resolution image...");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AuraAI Generated Artwork",
          text: image.prompt,
          url: image.url,
        });
      } catch (e) {
        handleCopyPrompt();
      }
    } else {
      handleCopyPrompt();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-[#242424] border border-[#3e3e3e] rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-auto text-white relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center px-5 py-3 border-b border-[#333]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#157ff0] bg-[#157ff0]/10 px-2.5 py-1 rounded-full border border-[#157ff0]/30">
              {image.style || "AI Artwork"}
            </span>
            <span className="text-xs text-gray-400">{image.aspectRatio}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-[#333] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Preview */}
        <div className="relative bg-[#181818] flex items-center justify-center max-h-[60vh] overflow-hidden">
          <img
            src={image.url}
            alt={image.prompt}
            referrerPolicy="no-referrer"
            className="max-h-[60vh] w-auto object-contain mx-auto"
          />
        </div>

        {/* Modal Content Details */}
        <div className="p-5 space-y-4">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">
              Generation Prompt
            </label>
            <p className="text-sm text-gray-100 bg-[#191919] p-3 rounded-xl border border-[#333] leading-relaxed">
              "{image.prompt}"
            </p>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#333]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="text-xs bg-[#2f2f2f] hover:bg-[#3f3f3f] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium border border-[#444] transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-[#38bdf8]" />
                Copy Prompt
              </button>

              <button
                type="button"
                onClick={() => {
                  onUsePrompt(image.prompt);
                  onClose();
                }}
                className="text-xs bg-[#2f2f2f] hover:bg-[#3f3f3f] text-gray-200 px-3 py-2 rounded-lg flex items-center gap-1.5 font-medium border border-[#444] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#8b5cf6]" />
                Re-use Prompt
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="text-xs bg-[#2f2f2f] hover:bg-[#3f3f3f] text-gray-200 p-2 rounded-lg border border-[#444] transition-colors"
                title="Share"
              >
                <Share2 className="w-3.5 h-3.5 text-gray-300" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => onToggleFavorite(image.id, e)}
                className={`p-2 rounded-lg border transition-colors ${
                  image.isFavorite
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/40"
                    : "bg-[#2f2f2f] text-gray-300 border-[#444] hover:bg-[#3f3f3f]"
                }`}
                title="Favorite"
              >
                <Heart
                  className={`w-4 h-4 ${
                    image.isFavorite ? "fill-rose-500" : ""
                  }`}
                />
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteImage(image.id);
                  onClose();
                }}
                className="p-2 rounded-lg bg-[#2f2f2f] hover:bg-rose-900/30 text-gray-400 hover:text-rose-400 border border-[#444] transition-colors"
                title="Delete Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownload}
                className="text-xs bg-gradient-to-r from-[#157ff0] to-[#8b5cf6] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-lg hover:brightness-110 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download PNG
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
