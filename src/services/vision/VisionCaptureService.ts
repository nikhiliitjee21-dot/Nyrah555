export type VisionMode = "camera" | "screen" | "photo" | "off";

export class VisionCaptureService {
  private stream: MediaStream | null = null;
  private videoEl: HTMLVideoElement | null = null;
  private canvasEl: HTMLCanvasElement | null = null;
  private mode: VisionMode = "off";
  private facingMode: "user" | "environment" = "user";
  private staticFrame: string | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.videoEl = document.createElement("video");
      this.videoEl.setAttribute("autoplay", "true");
      this.videoEl.setAttribute("playsinline", "true");
      this.videoEl.muted = true;
      this.canvasEl = document.createElement("canvas");
    }
  }

  public isScreenShareSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getDisplayMedia === "function"
    );
  }

  public isCameraSupported(): boolean {
    return (
      typeof navigator !== "undefined" &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === "function"
    );
  }

  /**
   * Progressive camera acquisition with graceful constraint degradation.
   * Handles desktop external cams, virtual webcams, mobile front/back cams seamlessly.
   */
  private async acquireCameraStream(facing: "user" | "environment"): Promise<MediaStream> {
    // Stage 1: Ideal facingMode and ideal resolution
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
    } catch (e1: any) {
      if (
        e1.name === "NotAllowedError" ||
        e1.name === "PermissionDeniedError" ||
        e1.name === "SecurityError"
      ) {
        throw e1;
      }
    }

    // Stage 2: Ideal facingMode only (no resolution constraint)
    try {
      return await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facing } },
        audio: false,
      });
    } catch (e2: any) {
      if (
        e2.name === "NotAllowedError" ||
        e2.name === "PermissionDeniedError" ||
        e2.name === "SecurityError"
      ) {
        throw e2;
      }
    }

    // Stage 3: Pure video fallback (universal for any camera device)
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });
  }

  public async startCamera(facing: "user" | "environment" = "user"): Promise<MediaStream> {
    this.stop();
    if (!this.isCameraSupported()) {
      throw new Error("Aapke browser me camera supported ya accessible nahi hai.");
    }
    try {
      this.facingMode = facing;
      const stream = await this.acquireCameraStream(this.facingMode);
      this.stream = stream;
      this.mode = "camera";
      if (this.videoEl) {
        this.videoEl.srcObject = stream;
        await this.videoEl.play().catch(() => {});
      }
      return stream;
    } catch (err: any) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError" ||
        err.message?.includes("Permission denied")
      ) {
        throw new Error(
          "Camera permission block hai. Browser ke address bar me Lock (🔒) icon par tap karke Camera 'Allow' karein."
        );
      }
      if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        throw new Error(
          "Camera kisi doosri app (jaise Zoom, Meet, Teams ya doosre tab) me busy hai. Use close karke Retry karein."
        );
      }
      if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        throw new Error("Device me koi camera nahi mila. Kripya webcam connect karein ya photo attach karein.");
      }
      throw new Error(err.message || "Camera start karne me dikkat aayi. Kripya dobara koshish karein.");
    }
  }

  public async attachExistingStream(stream: MediaStream, mode: VisionMode = "camera"): Promise<void> {
    this.stop();
    this.stream = stream;
    this.mode = mode;
    if (this.videoEl) {
      this.videoEl.srcObject = stream;
      await this.videoEl.play().catch(() => {});
    }
  }

  public async startScreen(): Promise<MediaStream> {
    this.stop();
    if (!this.isScreenShareSupported()) {
      throw new Error("Screen sharing mobile devices par available nahi hai. Aap camera use kar sakte hain.");
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 5 },
        audio: false,
      });
      this.stream = stream;
      this.mode = "screen";

      stream.getVideoTracks()[0].onended = () => {
        this.stop();
      };

      if (this.videoEl) {
        this.videoEl.srcObject = stream;
        await this.videoEl.play().catch(() => {});
      }
      return stream;
    } catch (err: any) {
      if (err.name === "NotAllowedError" || err.message?.includes("Permission denied")) {
        throw new Error("Screen sharing permission cancel ya deny ho gayi.");
      }
      throw err;
    }
  }

  public setStaticImage(base64: string): void {
    this.stop();
    this.staticFrame = base64;
    this.mode = "photo";
  }

  public captureFrameBase64(): string | null {
    if (this.mode === "photo") {
      return this.staticFrame;
    }

    if (!this.videoEl || !this.canvasEl || !this.stream || this.mode === "off") {
      return null;
    }
    const width = this.videoEl.videoWidth || 640;
    const height = this.videoEl.videoHeight || 480;
    if (width === 0 || height === 0) return null;

    const maxDim = 640;
    const scale = Math.min(1, maxDim / Math.max(width, height));
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    this.canvasEl.width = targetW;
    this.canvasEl.height = targetH;

    const ctx = this.canvasEl.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(this.videoEl, 0, 0, targetW, targetH);
    const dataUrl = this.canvasEl.toDataURL("image/jpeg", 0.65);
    return dataUrl.split(",")[1] || null;
  }

  public async switchFacingMode(): Promise<MediaStream | null> {
    if (this.mode !== "camera") return null;
    const nextFacing = this.facingMode === "user" ? "environment" : "user";
    return this.startCamera(nextFacing);
  }

  public stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    if (this.videoEl) {
      this.videoEl.srcObject = null;
    }
    this.staticFrame = null;
    this.mode = "off";
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public getMode(): VisionMode {
    return this.mode;
  }

  public isStreaming(): boolean {
    return this.mode !== "off" && (this.stream !== null || this.staticFrame !== null);
  }
}

export const visionService = new VisionCaptureService();
