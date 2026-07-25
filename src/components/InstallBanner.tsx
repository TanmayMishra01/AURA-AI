import React, { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface InstallBannerProps {
  onShowToast: (msg: string) => void;
}

export const InstallBanner: React.FC<InstallBannerProps> = ({ onShowToast }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        onShowToast("AuraAI app installed!");
      }
      setDeferredPrompt(null);
    } else {
      onShowToast("App added to home screen standard shortcut!");
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      id="install-banner"
      className="fixed bottom-0 left-0 right-0 bg-[#252525] border-t border-[#444] p-4 flex justify-between items-center z-50 shadow-2xl transition-transform duration-300 transform translate-y-0"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#157ff0] to-[#8b5cf6] flex items-center justify-center text-white shrink-0 shadow-md">
          <Smartphone className="w-5 h-5" />
        </div>
        <div>
          <p className="install-text text-sm font-semibold text-white">
            Install AuraAI App
          </p>
          <p className="text-xs text-gray-400 hidden sm:block">
            Fast full-screen access on Desktop and Mobile
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleInstall}
          className="install-btn bg-[#8b5cf6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Install
        </button>

        <button
          type="button"
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-[#333]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
