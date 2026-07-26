import React from "react";
import { Sparkles, Cpu, Zap } from "lucide-react";

interface HeaderProps {
  apiKeyConfigured?: boolean;
  cameraStatusText?: string;
  isCameraLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  apiKeyConfigured = true,
  cameraStatusText = "Camera: Idle",
  isCameraLive = false,
}) => {
  return (
    <header className="px-5 py-4 flex justify-between items-center border-b border-[#333] bg-[#1a1a1a]/90 backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="logo font-extrabold text-2xl tracking-tight bg-gradient-to-r from-[#157ff0] via-[#38bdf8] to-[#8b5cf6] bg-clip-text text-transparent flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[#157ff0] inline-block animate-pulse" />
          <span>AuraAI</span>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#252525] text-[#8b5cf6] border border-[#3d3d3d]">
          <Cpu className="w-3 h-3" />
          Aura-7 Model
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-[#252525] px-3 py-1.5 rounded-full border border-[#383838]">
          <span
            className={`w-2 h-2 rounded-full ${
              isCameraLive ? "bg-[#ff4757] animate-ping" : "bg-gray-500"
            }`}
          />
          <span className={`font-mono text-[11px] ${isCameraLive ? "text-rose-400 font-semibold" : "text-gray-400"}`}>
            {cameraStatusText}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-[#252525] px-3 py-1.5 rounded-full border border-[#383838]">
          <span
            className={`w-2 h-2 rounded-full ${
              apiKeyConfigured ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span>{apiKeyConfigured ? "Gemini Engine Ready" : "API Setup Required"}</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#157ff0] to-[#8b5cf6] p-0.5 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <div className="w-full h-full rounded-full bg-[#1a1a1a] flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#38bdf8]" />
          </div>
        </div>
      </div>
    </header>
  );
};
