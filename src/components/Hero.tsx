import React from "react";
import { Sparkles, Wand2 } from "lucide-react";

export const Hero: React.FC = () => {
  return (
    <div className="hero text-center mb-6 pt-2 px-4">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#157ff0]/10 text-[#38bdf8] border border-[#157ff0]/20 mb-3">
        <Wand2 className="w-3.5 h-3.5" />
        Next Gen Image Generation Engine
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
        Generate in Seconds
      </h1>
      <p className="text-gray-400 text-xs sm:text-sm max-w-md mx-auto">
        Powered by <span className="text-[#38bdf8] font-semibold">Aura-7 Vision Model</span> with high-resolution image synthesis and prompt intelligence
      </p>
    </div>
  );
};
