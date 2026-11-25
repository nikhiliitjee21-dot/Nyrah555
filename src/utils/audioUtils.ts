export async function playPCM(base64Data: string, volume: number = 1.0): Promise<void> {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("AudioContext not supported");
      return;
    }
    const audioCtx = new AudioContextClass({ sampleRate: 24000 });
    const binaryString = atob(base64Data);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    let audioBuffer: AudioBuffer;

    // Check if data is a standard WAV file (RIFF header)
    if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
      audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
    } else {
      // Raw 24kHz 16-bit PCM little-endian
      const numSamples = Math.floor(bytes.length / 2);
      audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);
      const dataView = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      for (let i = 0; i < numSamples; i++) {
        channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }
    }

    const source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    source.start();
    
    return new Promise<void>(resolve => {
      source.onended = () => {
        try {
          audioCtx.close();
        } catch {}
        resolve();
      };
    });
  } catch (error) {
    console.error("Error playing audio:", error);
  }
}
