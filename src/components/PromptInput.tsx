import React, { useState } from "react";
import {
  Sparkles,
  Shuffle,
  Wand2,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { AspectRatioOption, StyleOption } from "../types";
import { STYLE_OPTIONS, PROMPT_IDEAS } from "../data/mockGallery";

interface PromptInputProps {
  prompt: string;
  setPrompt: (value: string) => void;
  aspectRatio: AspectRatioOption;
  setAspectRatio: (value: AspectRatioOption) => void;
  selectedStyle: string;
  setSelectedStyle: (value: string) => void;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onShowToast: (msg: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  setPrompt,
  aspectRatio,
  setAspectRatio,
  selectedStyle,
  setSelectedStyle,
  negativePrompt,
  setNegativePrompt,
  onGenerate,
  isGenerating,
  onShowToast,
}) => {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const aspectRatios: { label: string; value: AspectRatioOption; icon: string }[] = [
    { label: "1:1 Square", value: "1:1", icon: "aspect-square" },
    { label: "16:9 Landscape", value: "16:9", icon: "aspect-video" },
    { label: "9:16 Portrait", value: "9:16", icon: "aspect-portrait" },
    { label: "4:3 Standard", value: "4:3", icon: "aspect-4-3" },
    { label: "3:4 Photo", value: "3:4", icon: "aspect-3-4" },
  ];

  const handleSurpriseMe = () => {
    const randomIdea = PROMPT_IDEAS[Math.floor(Math.random() * PROMPT_IDEAS.length)];
    setPrompt(randomIdea.prompt);
    onShowToast(`Applied idea: "${randomIdea.title}"`);
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) {
      onShowToast("Enter a prompt first to enhance!");
      return;
    }
    setIsEnhancing(true);
    try {
      const res = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        onShowToast("AI Enhanced your prompt!");
      } else {
        onShowToast("Could not enhance prompt.");
      }
    } catch (err) {
      console.error(err);
      onShowToast("Failed to connect to prompt enhancer.");
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="input-area bg-[#2d2d2d] border border-[#3e3e3e] rounded-2xl p-4 shadow-xl mb-6">
      {/* Top action row */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#157ff0]" />
          Image Prompt
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={isGenerating || isEnhancing}
            className="text-xs text-gray-300 hover:text-white bg-[#222222] hover:bg-[#333333] border border-[#444] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors"
          >
            <Shuffle className="w-3 h-3 text-[#38bdf8]" />
            Surprise Me
          </button>

          <button
            type="button"
            onClick={handleEnhancePrompt}
            disabled={isGenerating || isEnhancing || !prompt.trim()}
            className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium transition-all ${
              isEnhancing
                ? "bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/40 animate-pulse"
                : "bg-gradient-to-r from-[#157ff0]/20 to-[#8b5cf6]/20 text-white hover:from-[#157ff0]/40 hover:to-[#8b5cf6]/40 border border-[#8b5cf6]/30"
            }`}
          >
            <Wand2 className={`w-3 h-3 text-[#8b5cf6] ${isEnhancing ? "animate-spin" : ""}`} />
            {isEnhancing ? "Enhancing..." : "AI Enhance"}
          </button>
        </div>
      </div>

      {/* Main input & clear */}
      <div className="relative mb-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate (e.g. 'A futuristic cyberpunk motorcycle speeding through glowing neon rain')..."
          rows={3}
          disabled={isGenerating}
          className="w-full bg-[#121212] border border-[#444] focus:border-[#157ff0] focus:ring-1 focus:ring-[#157ff0] text-white p-3 rounded-xl text-sm resize-none outline-none transition-all placeholder:text-gray-500"
        />
        {prompt && (
          <button
            type="button"
            onClick={() => setPrompt("")}
            className="absolute top-2.5 right-2.5 text-gray-400 hover:text-white p-1 rounded-full bg-[#252525] hover:bg-[#333]"
            title="Clear prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Aspect Ratio Options */}
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">
          Aspect Ratio
        </label>
        <div className="flex flex-wrap gap-1.5">
          {aspectRatios.map((ar) => (
            <button
              key={ar.value}
              type="button"
              onClick={() => setAspectRatio(ar.value)}
              className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                aspectRatio === ar.value
                  ? "bg-[#157ff0] text-white border-[#157ff0] font-semibold shadow-md shadow-[#157ff0]/20"
                  : "bg-[#222222] text-gray-300 border-[#3d3d3d] hover:border-[#555]"
              }`}
            >
              {ar.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style Presets */}
      <div className="mb-3">
        <label className="text-xs font-medium text-gray-400 mb-1.5 block">
          Art Style Preset
        </label>
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-gray-700">
          {STYLE_OPTIONS.map((style: StyleOption) => (
            <button
              key={style.id}
              type="button"
              onClick={() => setSelectedStyle(style.name)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition-all ${
                selectedStyle === style.name
                  ? "bg-gradient-to-r from-[#157ff0] to-[#8b5cf6] text-white border-transparent font-semibold shadow-md"
                  : "bg-[#222222] text-gray-300 border-[#3d3d3d] hover:border-[#555]"
              }`}
            >
              <span>{style.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Collapsible Advanced Settings */}
      <div className="border-t border-[#3a3a3a] pt-2 mt-2">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1 py-1 w-full justify-between"
        >
          <span className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8b5cf6]" />
            Advanced Options (Negative Prompt)
          </span>
          {showAdvanced ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>

        {showAdvanced && (
          <div className="pt-2 mt-1 space-y-2">
            <div>
              <label className="text-[11px] font-medium text-gray-400 block mb-1">
                Negative Prompt (Elements to avoid)
              </label>
              <input
                type="text"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="blurry, low resolution, distorted hands, extra limbs, bad framing"
                className="w-full bg-[#121212] border border-[#444] text-white p-2 rounded-lg text-xs outline-none focus:border-[#157ff0]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Generate Button */}
      <div className="mt-4">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all ${
            isGenerating || !prompt.trim()
              ? "bg-gray-600 cursor-not-allowed opacity-60"
              : "bg-gradient-to-r from-[#157ff0] via-[#2563eb] to-[#8b5cf6] hover:brightness-110 active:scale-[0.98] shadow-[#157ff0]/25"
          }`}
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Generating AI Artwork...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
