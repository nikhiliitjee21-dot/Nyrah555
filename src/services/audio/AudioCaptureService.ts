import { calculateRMS, downsampleTo16k, uint8ToBase64 } from "./pcmUtils";

export interface AudioCaptureCallbacks {
  onAudioLevel: (rms: number) => void;
  onAudioChunk: (base64Pcm: string) => void;
  onBargeIn: () => void;
  onUserSpeakingStateChange: (isSpeaking: boolean) => void;
}

export class AudioCaptureService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private muteGain: GainNode | null = null;
  private isUserSpeaking: boolean = false;

  public setMediaStream(stream: MediaStream): void {
    this.mediaStream = stream;
  }

  async start(
    callbacks: AudioCaptureCallbacks,
    isPlaybackActive: () => boolean
  ): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

    if (!this.audioContext) {
      try {
        this.audioContext = new AudioContextClass({ sampleRate: 16000 });
      } catch {
        this.audioContext = new AudioContextClass();
      }
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume().catch(() => {});
    }

    if (!this.mediaStream) {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }

    if (!this.source && this.mediaStream && this.audioContext) {
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.processor = this.audioContext.createScriptProcessor(2048, 1, 1);

      this.processor.onaudioprocess = (e: AudioProcessingEvent) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const rms = calculateRMS(inputData);
        callbacks.onAudioLevel(rms);

        // Barge-in interruption check
        if (isPlaybackActive()) {
          if (rms > 0.038) {
            callbacks.onBargeIn();
          } else {
            // Avoid speaker echo feedback to server while model is speaking
            return;
          }
        }

        // Voice activity change detection
        if (rms > 0.015) {
          if (!this.isUserSpeaking) {
            this.isUserSpeaking = true;
            callbacks.onUserSpeakingStateChange(true);
          }
        } else if (rms < 0.008) {
          if (this.isUserSpeaking) {
            this.isUserSpeaking = false;
            callbacks.onUserSpeakingStateChange(false);
          }
        }

        // Downsample to clean 16000Hz PCM16 and base64 encode
        const pcm16 = downsampleTo16k(inputData, this.audioContext?.sampleRate || 16000);
        const uint8 = new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
        const base64Data = uint8ToBase64(uint8);
        callbacks.onAudioChunk(base64Data);
      };

      this.source.connect(this.processor);
      this.muteGain = this.audioContext.createGain();
      this.muteGain.gain.value = 0;
      this.processor.connect(this.muteGain);
      this.muteGain.connect(this.audioContext.destination);
    }
  }

  resumeIfNeeded(): void {
    if (this.audioContext?.state === "suspended") {
      this.audioContext.resume().catch(() => {});
    }
  }

  stop(): void {
    if (this.processor) {
      this.processor.disconnect();
      this.processor = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    if (this.muteGain) {
      this.muteGain.disconnect();
      this.muteGain = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((t) => t.stop());
      this.mediaStream = null;
    }
    if (this.audioContext) {
      this.audioContext.close().catch(() => {});
      this.audioContext = null;
    }
    this.isUserSpeaking = false;
  }
}
