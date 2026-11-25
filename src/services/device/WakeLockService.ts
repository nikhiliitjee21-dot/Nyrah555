// Hardware Screen Wake Lock manager to keep real-time voice streaming alive on mobile devices
export class WakeLockService {
  private wakeLock: any = null;

  async request(): Promise<void> {
    if (typeof navigator !== "undefined" && "wakeLock" in navigator) {
      try {
        this.wakeLock = await (navigator as any).wakeLock.request("screen");
      } catch {
        // Safe to ignore if unsupported or permission declined
      }
    }
  }

  release(): void {
    if (this.wakeLock) {
      try {
        this.wakeLock.release().catch(() => {});
      } catch {}
      this.wakeLock = null;
    }
  }
}
