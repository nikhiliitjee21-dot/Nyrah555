import { useState, useCallback, useEffect } from "react";
import { visionService, VisionMode } from "../services/vision/VisionCaptureService";
import { visionStreamManager } from "../services/vision/VisionStreamManager";
import { LiveSessionManager } from "../services/liveService";

export function useVisionCompanion(
  liveSessionRef: React.RefObject<LiveSessionManager | null>,
  isSessionActive: boolean
) {
  const [visionMode, setVisionMode] = useState<VisionMode>("off");
  const [visionError, setVisionError] = useState<string | null>(null);

  const stopVision = useCallback(() => {
    visionStreamManager.stopStreaming();
    visionService.stop();
    setVisionMode("off");
    setVisionError(null);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      setVisionError(null);
      await visionService.startCamera("user");
      setVisionMode("camera");
      visionStreamManager.startStreaming(liveSessionRef.current);
    } catch (err: any) {
      console.warn("Camera access notification:", err?.message || err);
      visionStreamManager.stopStreaming();
      visionService.stop();
      setVisionMode("off");
      const msg = err.message || "Camera permission denied. Please allow camera access in browser site settings.";
      setVisionError(msg);
    }
  }, [liveSessionRef]);

  const attachCameraStream = useCallback(async (stream: MediaStream) => {
    try {
      setVisionError(null);
      await visionService.attachExistingStream(stream, "camera");
      setVisionMode("camera");
      visionStreamManager.startStreaming(liveSessionRef.current);
    } catch (err: any) {
      console.warn("Attach camera stream notice:", err);
    }
  }, [liveSessionRef]);

  const startScreen = useCallback(async () => {
    try {
      setVisionError(null);
      await visionService.startScreen();
      setVisionMode("screen");
      visionStreamManager.startStreaming(liveSessionRef.current);
    } catch (err: any) {
      console.warn("Screen share notification:", err?.message || err);
      visionStreamManager.stopStreaming();
      visionService.stop();
      setVisionMode("off");
      const msg = err.message || "Screen share cancelled or not supported.";
      setVisionError(msg);
    }
  }, [liveSessionRef]);

  const uploadPhoto = useCallback(
    (file: File) => {
      return new Promise<void>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          if (base64) {
            visionService.setStaticImage(base64);
            setVisionMode("photo");
            setVisionError(null);
            visionStreamManager.startStreaming(liveSessionRef.current);
            resolve();
          } else {
            reject(new Error("Image processing failed"));
          }
        };
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    },
    [liveSessionRef]
  );

  const toggleCamera = useCallback(() => {
    if (visionMode === "camera") {
      stopVision();
    } else {
      startCamera();
    }
  }, [visionMode, startCamera, stopVision]);

  const toggleScreen = useCallback(() => {
    if (visionMode === "screen") {
      stopVision();
    } else {
      startScreen();
    }
  }, [visionMode, startScreen, stopVision]);

  // When live session connects or reconnects, re-bind streamer if vision is active
  useEffect(() => {
    if (visionMode !== "off") {
      visionStreamManager.startStreaming(liveSessionRef.current);
    }
  }, [isSessionActive, liveSessionRef, visionMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVision();
    };
  }, [stopVision]);

  return {
    visionMode,
    visionError,
    clearVisionError: () => setVisionError(null),
    toggleCamera,
    toggleScreen,
    stopVision,
    startCamera,
    attachCameraStream,
    startScreen,
    uploadPhoto,
    isScreenSupported: visionService.isScreenShareSupported(),
    isCameraSupported: visionService.isCameraSupported(),
  };
}
