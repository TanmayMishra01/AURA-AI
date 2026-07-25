import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ToastProps {
  message: string | null;
}

export const Toast: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="toast fixed top-5 left-1/2 -translate-x-1/2 bg-[#333] border border-[#555] text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <CheckCircle2 className="w-4 h-4 text-[#38bdf8]" />
      <span>{message}</span>
    </div>
  );
};
