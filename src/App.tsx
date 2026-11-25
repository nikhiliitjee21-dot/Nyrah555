import React, { useState, useEffect, useRef, useCallback } from "react";
import { usePWAInstall } from "./hooks/usePWAInstall";
import { useVoiceCompanion } from "./hooks/useVoiceCompanion";
import { AppHeader } from "./components/Header/AppHeader";
import { VisualizerSection } from "./components/VisualizerCard/VisualizerSection";
import { VoiceControls } from "./components/Controls/VoiceControls";
import { VideoBackgroundLayer } from "./components/Background/VideoBackgroundLayer";
import { AmbientAuroraBackdrop } from "./components/Background/AmbientAuroraBackdrop";
import { PWAInstallModals } from "./components/Overlays/PWAInstallModals";
import SetupScreen from "./components/SetupScreen";
import PermissionModal from "./components/PermissionModal";
import TopicScriptModal from "./components/TopicScriptModal";
import VoiceSelectorModal from "./components/VoiceSelectorModal";
import { LiveTimerWidget } from "./components/Productivity/LiveTimerWidget";
import { ProductivityDashboard } from "./components/Productivity/ProductivityDashboard";
import { useVisionCompanion } from "./hooks/useVisionCompanion";
import { VisionVideoPreview } from "./components/Vision/VisionVideoPreview";
import { VisionPermissionGuide } from "./components/Vision/VisionPermissionGuide";
import { WebActionCard } from "./components/Productivity/WebActionCard";
import { AppConfig } from "./types";
import { DEFAULT_CONFIG } from "./lib/defaultConfig";

export default function App() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem("zoya_app_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.voiceName !== "Aoede") parsed.voiceName = "Kore";
        return parsed;
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  const [showSettings, setShowSettings] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showProductivity, setShowProductivity] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [updatingPWA, setUpdatingPWA] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(() => {
    try { return localStorage.getItem("zoya_video_bg") || null; } catch { return null; }
  });

  useEffect(() => {
    document.title = config?.assistantName ? `${config.assistantName} - Virtual Companion` : "Your Virtual Companion";
  }, [config?.assistantName]);

  const handleVisionIntentRef = useRef<((intent: any) => void) | undefined>(undefined);
  const handleVisionIntent = useCallback((intent: any) => {
    handleVisionIntentRef.current?.(intent);
  }, []);

  const {
    appState,
    messages,
    isSessionActive,
    isMicHearing,
    liveNotice,
    setLiveNotice,
    liveSessionRef,
    toggleListening,
    handleTextCommand,
    clearMessages,
    activeWebAction,
    clearWebAction,
  } = useVoiceCompanion(
    config,
    isMuted,
    volume,
    () => setShowPermissionModal(true),
    handleVisionIntent
  );

  const {
    visionMode,
    visionError,
    clearVisionError,
    toggleCamera,
    toggleScreen,
    stopVision,
    startCamera,
    attachCameraStream,
    startScreen,
    uploadPhoto,
    isScreenSupported,
  } = useVisionCompanion(liveSessionRef, isSessionActive);

  const handleToggleSession = useCallback(async () => {
    if (isSessionActive) {
      stopVision();
      toggleListening();
    } else {
      await toggleListening();
    }
  }, [isSessionActive, stopVision, toggleListening]);

  const handleToggleCamera = useCallback(async () => {
    if (visionMode === "camera") {
      stopVision();
    } else {
      if (!isSessionActive) {
        toggleListening();
      }
      await startCamera();
    }
  }, [visionMode, isSessionActive, stopVision, toggleListening, startCamera]);

  useEffect(() => {
    handleVisionIntentRef.current = (intent: string) => {
      if (intent === "open_camera") {
        startCamera();
      } else if (intent === "close_camera") {
        stopVision();
      } else if (intent === "open_screen") {
        startScreen();
      }
    };
  }, [startCamera, stopVision, startScreen]);

  const handleConfigComplete = (newConfig: AppConfig) => {
    if (newConfig.voiceName !== "Aoede") newConfig.voiceName = "Kore";
    try { localStorage.setItem("zoya_app_config", JSON.stringify(newConfig)); } catch {}
    setConfig(newConfig);
    setShowSettings(false);
    if (liveSessionRef.current) liveSessionRef.current.updateConfig(newConfig);
  };

  const applyConfigUpdate = (partial: Partial<AppConfig>) => {
    if (!config) return;
    const updated = { ...config, ...partial };
    setConfig(updated);
    try { localStorage.setItem("zoya_app_config", JSON.stringify(updated)); } catch {}
    if (liveSessionRef.current) liveSessionRef.current.updateConfig(updated);
  };

  const handleSelectVoice = (v: string) => applyConfigUpdate({ voiceName: v === "Aoede" ? "Aoede" : "Kore" });
  const handleUpdateTopic = (t: string) => applyConfigUpdate({ activeTopicOrScript: t });
  const handleToggleSearchGrounding = () => applyConfigUpdate({ googleSearchGrounding: config?.googleSearchGrounding === false });

  const handleForceUpdateApp = async () => {
    setUpdatingPWA(true);
    try {
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const reg of regs) await reg.unregister();
      }
      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch {} finally {
      window.location.reload();
    }
  };

  const handleInstallClick = async () => {
    if (isIOS) setShowIOSGuide(true);
    else {
      const ok = await install();
      if (!ok && !isInstallable) setShowAndroidGuide(true);
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;
    handleTextCommand(textInput);
    setTextInput("");
    setShowTextInput(false);
  };

  return (
    <div
      className="h-[100dvh] w-screen bg-[#0A0C10] text-white flex flex-col items-center justify-between font-sans relative overflow-hidden m-0 p-0"
      onClick={() => { setMenuOpen(false); setShowVolumeSlider(false); }}
    >
      {showSettings && (
        <SetupScreen initialConfig={config} onComplete={handleConfigComplete} onCancel={() => setShowSettings(false)} />
      )}
      {showPermissionModal && (
        <PermissionModal assistantName={config.assistantName} onClose={() => setShowPermissionModal(false)} />
      )}
      <PWAInstallModals
        assistantName={config.assistantName}
        showIOSGuide={showIOSGuide}
        onCloseIOSGuide={() => setShowIOSGuide(false)}
        showAndroidGuide={showAndroidGuide}
        onCloseAndroidGuide={() => setShowAndroidGuide(false)}
      />
      <AmbientAuroraBackdrop appState={appState} />
      <VideoBackgroundLayer videoSrc={videoSrc} />
      <AppHeader
        config={config}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        onOpenSettings={() => setShowSettings(true)}
        onOpenVoiceModal={() => setShowVoiceModal(true)}
        onOpenTopicModal={() => setShowTopicModal(true)}
        onToggleSearchGrounding={handleToggleSearchGrounding}
        onOpenProductivity={() => setShowProductivity(true)}
        onInstallApp={handleInstallClick}
        isInstalled={isInstalled}
        videoSrc={videoSrc}
        onVideoUpload={(e) => {
          const file = e.target.files?.[0];
          if (file) setVideoSrc(URL.createObjectURL(file));
        }}
        onRemoveVideo={() => { setVideoSrc(null); localStorage.removeItem("zoya_video_bg"); }}
        onUpdateApp={handleForceUpdateApp}
        updatingPWA={updatingPWA}
        onClearMemory={clearMessages}
        liveNotice={liveNotice}
        onDismissNotice={() => setLiveNotice(null)}
      />
      <VisualizerSection
        appState={appState}
        isMicHearing={isMicHearing}
        videoSrc={videoSrc}
        isSessionActive={isSessionActive}
        onToggleSession={handleToggleSession}
        lastMessage={messages.length > 0 ? messages[messages.length - 1] : undefined}
      />
      <VoiceControls
        assistantName={config.assistantName}
        appState={appState}
        isSessionActive={isSessionActive}
        onToggleSession={handleToggleSession}
        isMuted={isMuted}
        volume={volume}
        onVolumeChange={setVolume}
        onMuteToggle={() => setIsMuted((prev) => !prev)}
        showVolumeSlider={showVolumeSlider}
        setShowVolumeSlider={setShowVolumeSlider}
        showTextInput={showTextInput}
        setShowTextInput={setShowTextInput}
        textInput={textInput}
        setTextInput={setTextInput}
        onTextSubmit={handleTextSubmit}
        visionMode={visionMode}
        onToggleCamera={handleToggleCamera}
        onToggleScreen={toggleScreen}
        isScreenSupported={isScreenSupported}
      />
      {showTopicModal && (
        <TopicScriptModal
          assistantName={config.assistantName}
          currentTopic={config.activeTopicOrScript || ""}
          onSave={handleUpdateTopic}
          onClose={() => setShowTopicModal(false)}
        />
      )}
      {showVoiceModal && (
        <VoiceSelectorModal
          assistantName={config.assistantName}
          currentVoice={config.voiceName || "Kore"}
          onSelectVoice={handleSelectVoice}
          onClose={() => setShowVoiceModal(false)}
        />
      )}
      <LiveTimerWidget />
      <ProductivityDashboard
        isOpen={showProductivity}
        onClose={() => setShowProductivity(false)}
      />
      <VisionVideoPreview
        mode={visionMode}
        onClose={stopVision}
        onSwitchMode={(m) => (m === "camera" ? startCamera() : startScreen())}
        assistantName={config.assistantName}
        isScreenSupported={isScreenSupported}
      />
      <VisionPermissionGuide
        error={visionError}
        onClose={clearVisionError}
        onPhotoSelected={uploadPhoto}
        onRetryCamera={startCamera}
      />
      <WebActionCard action={activeWebAction} onDismiss={clearWebAction} />
    </div>
  );
}
