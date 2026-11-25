import { visionService, VisionMode } from "./VisionCaptureService";
import { LiveSessionManager } from "../liveService";

export class VisionStreamManager {
  private timer: any = null;
  private isRunning: boolean = false;
  private lastCapturedFrame: string | null = null;

  public startStreaming(liveSession: LiveSessionManager | null, onFrame?: (base64: string) => void): void {
    this.stopStreaming();
    this.isRunning = true;

    // Send at 1 frame per second (1 FPS) as required by Gemini Live API specs
    this.timer = setInterval(() => {
      if (!this.isRunning || !visionService.isStreaming()) return;
      const frame = visionService.captureFrameBase64();
      if (frame) {
        this.lastCapturedFrame = frame;
        if (liveSession) {
          liveSession.sendVideoFrame(frame);
        }
        if (onFrame) {
          onFrame(frame);
        }
      }
    }, 1000);
  }

  public stopStreaming(): void {
    this.isRunning = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getLatestFrame(): string | null {
    if (this.lastCapturedFrame) return this.lastCapturedFrame;
    return visionService.captureFrameBase64();
  }
}

export const visionStreamManager = new VisionStreamManager();
