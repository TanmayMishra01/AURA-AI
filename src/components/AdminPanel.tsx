import React, { useState, useEffect, useRef } from "react";
import { Camera, ShieldCheck, Trash2, Video, Eye, EyeOff, Sparkles } from "lucide-react";

interface CapturedFrame {
  url: string;
  time: string;
  userId: string;
}

interface AdminPanelProps {
  onCapturePrompt?: (prompt: string) => void;
  onShowToast: (msg: string) => void;
  isCameraLive: boolean;
  setIsCameraLive: (live: boolean) => void;
  cameraStatusText: string;
  setCameraStatusText: (text: string) => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onCapturePrompt,
  onShowToast,
  isCameraLive,
  setIsCameraLive,
  cameraStatusText,
  setCameraStatusText,
  videoRef,
}) => {
  const [captures, setCaptures] = useState<CapturedFrame[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const captureIntervalRef = useRef<any>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("auraAI_captures");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCaptures(parsed.slice(-10)); // Keep recent 10
        }
      }
    } catch (e) {
      console.error("Error reading auraAI_captures", e);
    }
  }, []);

  // Sync captures to localStorage
  const saveFrameToBackend = (dataUrl: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const newFrame: CapturedFrame = {
      url: dataUrl,
      time: timestamp,
      userId: "User_123",
    };

    setCaptures((prev) => {
      const updated = [newFrame, ...prev].slice(0, 10);
      try {
        localStorage.setItem("auraAI_captures", JSON.stringify(updated));
      } catch (err) {
        console.error("LocalStorage save error:", err);
      }
      return updated;
    });
  };

  // Start background camera
  const startCamera = async () => {
    try {
      setCameraStatusText("Camera: Requesting...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraLive(true);
      setCameraStatusText("Camera: Live");
      onShowToast("Background camera feed active!");

      // Start periodic background frame captures (every 3 seconds)
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = setInterval(() => {
        captureFrameNow();
      }, 3000);
    } catch (err: any) {
      console.error("Camera Error:", err);
      setIsCameraLive(false);
      if (err?.name === "NotAllowedError" || err?.message?.includes("Permission")) {
        setCameraStatusText("Camera: Blocked");
        onShowToast("Camera permission denied in browser settings.");
      } else {
        setCameraStatusText("Camera: Error");
        onShowToast("Could not start background camera feed.");
      }
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraLive(false);
    setCameraStatusText("Camera: Idle");
    onShowToast("Background camera stopped.");
  };

  // Capture single frame onto canvas
  const captureFrameNow = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      saveFrameToBackend(dataUrl);
    }
  };

  const handleClearHistory = () => {
    setCaptures([]);
    localStorage.removeItem("auraAI_captures");
    onShowToast("Captured frame log cleared.");
  };

  const handleAnalyzeLatest = async () => {
    if (captures.length === 0) {
      onShowToast("No captured frame available yet.");
      return;
    }

    setIsAnalyzing(true);
    onShowToast("Analyzing background frame with Gemini AI...");

    try {
      const latestUrl = captures[0].url;
      const res = await fetch("/api/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: latestUrl,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (data.prompt) {
        if (onCapturePrompt) onCapturePrompt(data.prompt);
        onShowToast("Extracted prompt from background camera frame!");
      } else {
        onShowToast("Could not interpret background frame.");
      }
    } catch (e) {
      console.error(e);
      onShowToast("Failed to analyze frame.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="my-4 bg-[#232323] border border-[#ff4757]/30 rounded-xl overflow-hidden shadow-lg">
      {/* Header Bar */}
      <div className="px-4 py-2.5 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#ff4757]" />
          <span className="text-xs font-bold text-gray-200 tracking-wide uppercase">
            🕵️ Admin View (Background Capture)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-xs text-gray-400 hover:text-white p-1 rounded transition-colors"
          >
            {isOpen ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Panel Body */}
      {isOpen && (
        <div className="p-4 space-y-3">
          {/* Controls & Status */}
          <div className="flex items-center justify-between flex-wrap gap-2 bg-[#121212] p-2.5 rounded-lg border border-[#333]">
            <div className="flex items-center gap-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isCameraLive ? "bg-[#ff4757] animate-ping" : "bg-gray-500"
                }`}
              />
              <span className="font-mono text-gray-300 font-semibold">{cameraStatusText}</span>
            </div>

            <div className="flex items-center gap-2">
              {!isCameraLive ? (
                <button
                  type="button"
                  onClick={startCamera}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#ff4757] hover:bg-[#ff3344] text-white font-semibold flex items-center gap-1.5 shadow transition-all active:scale-95"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Start Live Stream</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopCamera}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#333] hover:bg-[#444] text-gray-200 font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Video className="w-3.5 h-3.5 text-rose-400" />
                  <span>Stop Stream</span>
                </button>
              )}

              {isCameraLive && (
                <button
                  type="button"
                  onClick={captureFrameNow}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-[#157ff0] hover:bg-[#126ccb] text-white font-medium flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Snap Frame</span>
                </button>
              )}
            </div>
          </div>

          {/* Captured Log Display */}
          <div className="bg-[#181818] rounded-lg p-3 border border-[#2d2d2d]">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Captured Frames Log ({captures.length})
              </span>

              {captures.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeLatest}
                    disabled={isAnalyzing}
                    className="text-[11px] text-[#38bdf8] hover:underline flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{isAnalyzing ? "Analyzing..." : "Analyze Latest Frame"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-[11px] text-gray-400 hover:text-rose-400 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>
              )}
            </div>

            {captures.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-500 italic">
                No frames captured yet. Start live stream to record background camera frames every 3s.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                {captures.map((item, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-lg overflow-hidden border border-[#333] bg-black aspect-video flex flex-col"
                  >
                    <img
                      src={item.url}
                      alt={`Captured Frame ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[9px] text-gray-300 flex justify-between">
                      <span>{item.userId}</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
