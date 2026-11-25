export interface DualMediaResult {
  audioStream: MediaStream;
  videoStream?: MediaStream;
}

export class MediaPermissionService {
  /**
   * Prompts the browser for BOTH microphone and camera in a single dialog.
   * If camera is unavailable or rejected, falls back to audio-only cleanly.
   */
  public static async requestDualMedia(): Promise<DualMediaResult> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      throw new Error("MediaDevices API is not supported in this browser environment.");
    }

    try {
      // First attempt: Request BOTH audio and camera in one single prompt
      const dualStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      const audioTracks = dualStream.getAudioTracks();
      const videoTracks = dualStream.getVideoTracks();

      const audioStream = new MediaStream(audioTracks);
      const videoStream = videoTracks.length > 0 ? new MediaStream(videoTracks) : undefined;

      return { audioStream, videoStream };
    } catch (dualErr: any) {
      console.warn("Dual mic+camera request notice:", dualErr?.message || dualErr);

      // If dual request was denied or device has no camera, fall back to audio-only
      const audioOnlyStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      return { audioStream: audioOnlyStream };
    }
  }
}
