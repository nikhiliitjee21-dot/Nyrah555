export class AudioPlaybackQueue {
  private playbackContext: AudioContext | null = null;
  private playbackGain: GainNode | null = null;
  private activeSources: Set<AudioBufferSourceNode> = new Set();
  private nextPlayTime: number = 0;
  private isPlaying: boolean = false;
  private residualAudioBytes: Uint8Array | null = null;
  private playbackTimeout: any = null;
  private speakingHangoverTimer: any = null;

  public isMuted: boolean = false;
  public volume: number = 1.0;
  public onPlaybackStateChange: (isPlaying: boolean) => void = () => {};

  async init(): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!this.playbackContext) {
      try {
        this.playbackContext = new AudioContextClass({ sampleRate: 24000 });
      } catch {
        this.playbackContext = new AudioContextClass();
      }
    }

    if (this.playbackContext.state === "suspended") {
      await this.playbackContext.resume().catch(() => {});
    }

    if (!this.playbackGain && this.playbackContext) {
      this.playbackGain = this.playbackContext.createGain();
      this.playbackGain.gain.value = this.isMuted ? 0 : this.volume;
      this.playbackGain.connect(this.playbackContext.destination);
    }
    this.nextPlayTime = this.playbackContext.currentTime;
  }

  setVolume(vol: number, muted: boolean): void {
    this.volume = vol;
    this.isMuted = muted;
    if (this.playbackGain) {
      this.playbackGain.gain.value = muted ? 0 : vol;
    }
  }

  resumeIfNeeded(): void {
    if (this.playbackContext?.state === "suspended") {
      this.playbackContext.resume().catch(() => {});
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  playChunk(base64Data: string): void {
    if (!this.playbackContext || this.isMuted) return;

    if (this.playbackContext.state === "suspended") {
      this.playbackContext.resume().catch(() => {});
    }

    try {
      const binaryString = atob(base64Data);
      const newLen = binaryString.length;
      if (newLen === 0) return;

      // Merge with residual byte from previous chunk if available
      let rawBytes: Uint8Array;
      if (this.residualAudioBytes && this.residualAudioBytes.length > 0) {
        rawBytes = new Uint8Array(this.residualAudioBytes.length + newLen);
        rawBytes.set(this.residualAudioBytes, 0);
        for (let i = 0; i < newLen; i++) {
          rawBytes[this.residualAudioBytes.length + i] = binaryString.charCodeAt(i);
        }
        this.residualAudioBytes = null;
      } else {
        rawBytes = new Uint8Array(newLen);
        for (let i = 0; i < newLen; i++) {
          rawBytes[i] = binaryString.charCodeAt(i);
        }
      }

      // Preserve leftover odd byte for next packet
      if (rawBytes.length % 2 !== 0) {
        this.residualAudioBytes = rawBytes.slice(rawBytes.length - 1);
        rawBytes = rawBytes.subarray(0, rawBytes.length - 1);
      }

      const numSamples = rawBytes.length / 2;
      if (numSamples === 0) return;

      const audioBuffer = this.playbackContext.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(rawBytes.buffer, rawBytes.byteOffset, rawBytes.byteLength);

      for (let i = 0; i < numSamples; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const source = this.playbackContext.createBufferSource();
      source.buffer = audioBuffer;

      if (this.playbackGain) {
        this.playbackGain.gain.value = this.isMuted ? 0 : this.volume;
        source.connect(this.playbackGain);
      } else {
        source.connect(this.playbackContext.destination);
      }

      const currentTime = this.playbackContext.currentTime;
      // 20ms lead cushion to prevent buffer underrun while keeping playback instant
      if (this.nextPlayTime < currentTime) {
        this.nextPlayTime = currentTime + 0.02;
      }

      source.start(this.nextPlayTime);
      this.nextPlayTime += audioBuffer.duration;

      if (!this.isPlaying) {
        this.isPlaying = true;
        this.onPlaybackStateChange(true);
      }

      this.activeSources.add(source);

      if (this.playbackTimeout) clearTimeout(this.playbackTimeout);
      if (this.speakingHangoverTimer) clearTimeout(this.speakingHangoverTimer);

      source.onended = () => {
        this.activeSources.delete(source);
        if (this.activeSources.size === 0) {
          if (this.speakingHangoverTimer) clearTimeout(this.speakingHangoverTimer);
          this.speakingHangoverTimer = setTimeout(() => {
            if (this.activeSources.size === 0) {
              this.isPlaying = false;
              this.onPlaybackStateChange(false);
            }
          }, 80);
        }
      };

      const remainingTimeMs = Math.max(100, (this.nextPlayTime - currentTime) * 1000 + 300);
      this.playbackTimeout = setTimeout(() => {
        if (this.activeSources.size === 0 && this.isPlaying) {
          this.isPlaying = false;
          this.onPlaybackStateChange(false);
        }
      }, remainingTimeMs);
    } catch (e) {
      console.error("Error playing audio chunk", e);
    }
  }

  stop(): void {
    for (const source of this.activeSources) {
      try {
        source.stop();
        source.disconnect();
      } catch {}
    }
    this.activeSources.clear();

    if (this.playbackTimeout) {
      clearTimeout(this.playbackTimeout);
      this.playbackTimeout = null;
    }
    if (this.speakingHangoverTimer) {
      clearTimeout(this.speakingHangoverTimer);
      this.speakingHangoverTimer = null;
    }

    if (this.playbackContext) {
      this.nextPlayTime = this.playbackContext.currentTime;
    }
    this.isPlaying = false;
    this.residualAudioBytes = null;
    this.onPlaybackStateChange(false);
  }

  teardown(): void {
    this.stop();
    if (this.playbackGain) {
      this.playbackGain.disconnect();
      this.playbackGain = null;
    }
    if (this.playbackContext) {
      this.playbackContext.close().catch(() => {});
      this.playbackContext = null;
    }
  }
}
