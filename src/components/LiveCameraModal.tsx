import React, { useRef, useState, useEffect } from "react";
import { X, Camera, RefreshCw, Sparkles, Video, VideoOff } from "lucide-react";

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapturePrompt: (prompt: string) => void;
  onShowToast: (msg: string) => void;
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapturePrompt,
  onShowToast,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera();

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.log("Camera access status:", err?.name || err?.message);
      if (
        err?.name === "NotAllowedError" ||
        err?.name === "PermissionDeniedError" ||
        err?.message?.includes("Permission denied") ||
        err?.message?.includes("Permission")
      ) {
        setCameraError(
          "Camera access permission was denied by browser settings. To use live camera, click the camera icon in your browser URL address bar to allow permissions, or use 'Upload Photo' instead."
        );
      } else {
        setCameraError(
          err?.message || "Could not access live device camera. Please check camera availability."
        );
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleFacingMode = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  const handleCaptureAndDescribe = async () => {
    if (!videoRef.current) return;

    setIsCapturing(true);
    onShowToast("Capturing frame from live stream...");

    try {
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context missing");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Data = canvas.toDataURL("image/jpeg", 0.85);

      onShowToast("Analyzing live camera frame with Gemini AI...");
      const res = await fetch("/api/describe-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: "image/jpeg",
        }),
      });

      const data = await res.json();
      if (data.prompt) {
        onCapturePrompt(data.prompt);
        onShowToast("Prompt extracted from live camera frame!");
        stopCamera();
        onClose();
      } else {
        onShowToast("Could not generate prompt from camera frame.");
      }
    } catch (err: any) {
      console.error("Capture error:", err);
      onShowToast("Failed to analyze live stream frame.");
    } finally {
      setIsCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
      onClick={() => {
        stopCamera();
        onClose();
      }}
    >
      <div
        className="bg-[#1e1e1e] border border-[#383838] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col text-white animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex justify-between items-center px-4 py-3 border-b border-[#2d2d2d] bg-[#141414]">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Live Camera Stream
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleFacingMode}
              className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white transition-colors"
              title="Switch Camera (Front/Rear)"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 rounded-lg bg-[#2a2a2a] hover:bg-[#333] text-gray-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Video Viewport */}
        <div className="relative bg-black aspect-video sm:aspect-[4/3] flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="p-6 text-center text-gray-400 max-w-xs">
              <VideoOff className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="text-xs text-rose-300 mb-2 font-medium">{cameraError}</p>
              <button
                type="button"
                onClick={startCamera}
                className="text-xs bg-[#157ff0] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#126ccb]"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Viewfinder crosshair overlay */}
              <div className="absolute inset-0 pointer-events-none border-2 border-white/15 m-6 rounded-xl flex items-center justify-center">
                <div className="w-8 h-8 border-t-2 border-l-2 border-[#157ff0] absolute top-0 left-0 rounded-tl-lg" />
                <div className="w-8 h-8 border-t-2 border-r-2 border-[#157ff0] absolute top-0 right-0 rounded-tr-lg" />
                <div className="w-8 h-8 border-b-2 border-l-2 border-[#157ff0] absolute bottom-0 left-0 rounded-bl-lg" />
                <div className="w-8 h-8 border-b-2 border-r-2 border-[#157ff0] absolute bottom-0 right-0 rounded-br-lg" />
              </div>

              {/* Bottom live overlay label */}
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-gray-300 border border-white/10 flex items-center gap-1.5">
                <Video className="w-3 h-3 text-[#38bdf8]" />
                <span>Device Live Viewfinder ({facingMode === "user" ? "Front" : "Rear"})</span>
              </div>
            </>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-4 bg-[#141414] border-t border-[#2d2d2d] flex items-center justify-between gap-3">
          <p className="text-[11px] text-gray-400 hidden sm:block">
            Point camera at any scene or subject
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="text-xs px-3 py-2 rounded-xl bg-[#282828] hover:bg-[#333] text-gray-300 font-medium border border-[#444]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleCaptureAndDescribe}
              disabled={isCapturing || !!cameraError}
              className={`text-xs px-4 py-2 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all ${
                isCapturing || !!cameraError
                  ? "bg-gray-600 opacity-50 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#157ff0] to-[#8b5cf6] hover:brightness-110 active:scale-95"
              }`}
            >
              {isCapturing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Analyzing Frame...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Capture Live Frame</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
