import { EQMode } from '../types';

class AudioEngine {
  private audioContext: AudioContext | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private lowFilter: BiquadFilterNode | null = null;
  private midFilter: BiquadFilterNode | null = null;
  private highFilter: BiquadFilterNode | null = null;
  private gainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private isSynthesizing = false;
  private synthInterval: number | null = null;

  constructor() {
    // Lazy initialize on user interaction
  }

  private initAudio() {
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.audioElement.crossOrigin = 'anonymous';
      this.audioElement.preload = 'auto';
    }

    if (!this.audioContext) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.audioContext = new AudioCtx();
        this.gainNode = this.audioContext.createGain();
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 64;

        // Create EQ filters
        this.lowFilter = this.audioContext.createBiquadFilter();
        this.lowFilter.type = 'lowshelf';
        this.lowFilter.frequency.value = 250;

        this.midFilter = this.audioContext.createBiquadFilter();
        this.midFilter.type = 'peaking';
        this.midFilter.frequency.value = 2500;
        this.midFilter.Q.value = 1.0;

        this.highFilter = this.audioContext.createBiquadFilter();
        this.highFilter.type = 'highshelf';
        this.highFilter.frequency.value = 6000;

        try {
          this.sourceNode = this.audioContext.createMediaElementSource(this.audioElement);
          this.sourceNode.connect(this.lowFilter);
          this.lowFilter.connect(this.midFilter);
          this.midFilter.connect(this.highFilter);
          this.highFilter.connect(this.gainNode);
          this.gainNode.connect(this.analyserNode);
          this.analyserNode.connect(this.audioContext.destination);
        } catch {
          // If already connected or CORS fallback, connect directly
        }
      }
    }

    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  public setSource(url: string) {
    this.initAudio();
    if (this.audioElement) {
      this.audioElement.src = url;
      this.audioElement.load();
    }
  }

  public play(): Promise<void> {
    this.initAudio();
    if (this.audioElement) {
      return this.audioElement.play().catch(() => {
        // Fallback to pleasant synthetic kingdom growth ambient harmony
        this.startAmbientSynthesis();
      });
    }
    return Promise.resolve();
  }

  public pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopAmbientSynthesis();
  }

  public seek(seconds: number) {
    if (this.audioElement) {
      this.audioElement.currentTime = Math.max(0, Math.min(seconds, this.audioElement.duration || seconds));
    }
  }

  // Backhopping: jump back by specified seconds (e.g. 15s)
  public backhop(seconds: number = 15) {
    if (this.audioElement) {
      this.seek(this.audioElement.currentTime - seconds);
    }
  }

  // Skip forward by specified seconds (e.g. 30s)
  public skipForward(seconds: number = 30) {
    if (this.audioElement) {
      this.seek(this.audioElement.currentTime + seconds);
    }
  }

  // Playback speed adjustment (0.75x, 1x, 1.25x, 1.5x, 1.75x, 2x)
  public setSpeed(speed: number) {
    if (this.audioElement) {
      this.audioElement.playbackRate = speed;
    }
  }

  // Volume control & Mute
  public setVolume(volume: number) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
    if (this.gainNode) {
      this.gainNode.gain.value = volume;
    }
  }

  public setMuted(muted: boolean) {
    if (this.audioElement) {
      this.audioElement.muted = muted;
    }
  }

  // Sound Control EQ Presets
  public setEQMode(mode: EQMode) {
    if (!this.lowFilter || !this.midFilter || !this.highFilter) return;

    switch (mode) {
      case 'vocal': // Vocal Clarity Boost: elevate spoken dialogue intelligibility
        this.lowFilter.gain.value = -3;
        this.midFilter.gain.value = +5;
        this.highFilter.gain.value = +3;
        break;
      case 'bass': // Warm deep resonance
        this.lowFilter.gain.value = +6;
        this.midFilter.gain.value = 0;
        this.highFilter.gain.value = -2;
        break;
      case 'studio': // Acoustic clarity
        this.lowFilter.gain.value = +2;
        this.midFilter.gain.value = +2;
        this.highFilter.gain.value = +4;
        break;
      case 'balanced':
      default:
        this.lowFilter.gain.value = 0;
        this.midFilter.gain.value = 0;
        this.highFilter.gain.value = 0;
        break;
    }
  }

  // Set audio output destination (e.g. specific headphones or speakers)
  public async setAudioOutputDevice(sinkId: string): Promise<boolean> {
    if (this.audioElement && typeof (this.audioElement as unknown as { setSinkId?: (id: string) => Promise<void> }).setSinkId === 'function') {
      try {
        await (this.audioElement as unknown as { setSinkId: (id: string) => Promise<void> }).setSinkId(sinkId);
        return true;
      } catch (err) {
        console.warn('Audio output device selection not supported or permission denied', err);
        return false;
      }
    }
    return false;
  }

  // Query audio visualizer frequencies
  public getVisualizerData(): Uint8Array {
    if (!this.analyserNode) {
      return new Uint8Array(16).fill(12);
    }
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);
    return dataArray;
  }

  // Ambient kingdom synthesis if external network file cannot be loaded
  private startAmbientSynthesis() {
    if (this.isSynthesizing || !this.audioContext) return;
    this.isSynthesizing = true;

    // Soft uplifting chord progression (C - G - Am - F) in gentle sine/triangle
    const chords = [
      [261.63, 329.63, 392.0], // C
      [246.94, 293.66, 392.0], // G
      [220.00, 261.63, 329.63], // Am
      [174.61, 220.00, 261.63]  // F
    ];
    let chordIndex = 0;

    const playChord = () => {
      if (!this.isSynthesizing || !this.audioContext) return;
      const currentChord = chords[chordIndex % chords.length];
      chordIndex++;

      currentChord.forEach(freq => {
        if (!this.audioContext) return;
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);

        oscGain.gain.setValueAtTime(0.001, this.audioContext.currentTime);
        oscGain.gain.exponentialRampToValueAtTime(0.04, this.audioContext.currentTime + 1.2);
        oscGain.gain.exponentialRampToValueAtTime(0.0001, this.audioContext.currentTime + 4.8);

        osc.connect(oscGain);
        if (this.gainNode) {
          oscGain.connect(this.gainNode);
        } else {
          oscGain.connect(this.audioContext.destination);
        }

        osc.start();
        osc.stop(this.audioContext.currentTime + 5.0);
      });
    };

    playChord();
    this.synthInterval = window.setInterval(playChord, 5000);
  }

  private stopAmbientSynthesis() {
    this.isSynthesizing = false;
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  public getAudioElement(): HTMLAudioElement | null {
    return this.audioElement;
  }
}

export const audioEngine = new AudioEngine();
