import React, { useEffect, useState, useRef } from 'react';
import { Mic, Volume2, Video, Check, X, AlertCircle } from 'lucide-react';
import { audioEngine } from '../services/audioEngine';

interface DeviceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceSettingsModal: React.FC<DeviceSettingsModalProps> = ({ isOpen, onClose }) => {
  const [audioInputs, setAudioInputs] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputs, setAudioOutputs] = useState<MediaDeviceInfo[]>([]);
  const [videoInputs, setVideoInputs] = useState<MediaDeviceInfo[]>([]);

  const [selectedAudioInput, setSelectedAudioInput] = useState<string>('');
  const [selectedAudioOutput, setSelectedAudioOutput] = useState<string>('');
  const [selectedVideoInput, setSelectedVideoInput] = useState<string>('');

  const [micLevel, setMicLevel] = useState<number>(0);
  const [isPlayingTestSound, setIsPlayingTestSound] = useState<boolean>(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Clean up media stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      return;
    }

    const loadDevices = async () => {
      try {
        // Request temporary permissions to get device labels
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        mediaStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Set up microphone level analyser
        const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 32;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const checkLevel = () => {
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
          const average = sum / dataArray.length;
          setMicLevel(Math.min(100, Math.round((average / 128) * 100)));
          animFrameRef.current = requestAnimationFrame(checkLevel);
        };
        checkLevel();

        const devices = await navigator.mediaDevices.enumerateDevices();
        const aIns = devices.filter(d => d.kind === 'audioinput');
        const aOuts = devices.filter(d => d.kind === 'audiooutput');
        const vIns = devices.filter(d => d.kind === 'videoinput');

        setAudioInputs(aIns);
        setAudioOutputs(aOuts);
        setVideoInputs(vIns);

        if (aIns.length > 0 && !selectedAudioInput) setSelectedAudioInput(aIns[0].deviceId);
        if (aOuts.length > 0 && !selectedAudioOutput) setSelectedAudioOutput(aOuts[0].deviceId);
        if (vIns.length > 0 && !selectedVideoInput) setSelectedVideoInput(vIns[0].deviceId);

        setPermissionError(null);
      } catch (err: unknown) {
        console.warn('Media devices access notice:', err);
        setPermissionError('Camera or microphone permissions need to be enabled for live testing. Default browser devices will be used.');
      }
    };

    loadDevices();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isOpen]);

  const handleOutputChange = async (deviceId: string) => {
    setSelectedAudioOutput(deviceId);
    await audioEngine.setAudioOutputDevice(deviceId);
  };

  const testAudioOutputChime = () => {
    setIsPlayingTestSound(true);
    const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.65);

    setTimeout(() => setIsPlayingTestSound(false), 700);
  };

  if (!isOpen) return null;

  return (
    <div id="device-settings-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/70 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Audio & Video Input/Output</h2>
              <p className="text-xs text-slate-400">Configure studio hardware for listening and webcast commentary</p>
            </div>
          </div>
          <button
            id="close-device-settings-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {permissionError && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{permissionError}</span>
          </div>
        )}

        <div className="space-y-5">
          {/* Audio Input (Microphone) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              Microphone (Audio Input)
            </label>
            <select
              id="audio-input-select"
              value={selectedAudioInput}
              onChange={e => setSelectedAudioInput(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {audioInputs.length > 0 ? (
                audioInputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.substring(0, 6)}`}
                  </option>
                ))
              ) : (
                <option value="default">Default Studio Microphone</option>
              )}
            </select>

            {/* Live Mic Level Meter */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Input Signal Level</span>
                <span className={micLevel > 50 ? 'text-amber-400 font-medium' : 'text-slate-400'}>{micLevel}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 transition-all duration-75"
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>
          </div>

          {/* Audio Output (Speakers/Headphones) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-amber-400" />
                Speaker / Headphones (Audio Output)
              </label>
              <button
                id="test-chime-btn"
                type="button"
                onClick={testAudioOutputChime}
                disabled={isPlayingTestSound}
                className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors"
              >
                {isPlayingTestSound ? 'Playing Chime...' : 'Test Sound'}
              </button>
            </div>
            <select
              id="audio-output-select"
              value={selectedAudioOutput}
              onChange={e => handleOutputChange(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {audioOutputs.length > 0 ? (
                audioOutputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Speaker Output ${device.deviceId.substring(0, 6)}`}
                  </option>
                ))
              ) : (
                <option value="default">Default System Audio Output</option>
              )}
            </select>
          </div>

          {/* Video Input (Camera) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Video className="w-4 h-4 text-amber-400" />
              Camera (Video Input for Webcast)
            </label>
            <select
              id="video-input-select"
              value={selectedVideoInput}
              onChange={e => setSelectedVideoInput(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {videoInputs.length > 0 ? (
                videoInputs.map(device => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.substring(0, 6)}`}
                  </option>
                ))
              ) : (
                <option value="default">Default HD Webcam</option>
              )}
            </select>

            {/* Camera Preview Thumbnail */}
            <div className="relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video max-h-36 flex items-center justify-center">
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-amber-400 flex items-center gap-1.5 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Hardware Active
              </div>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
          <button
            id="save-device-settings-btn"
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
          >
            <Check className="w-4 h-4" />
            Apply Hardware Settings
          </button>
        </div>
      </div>
    </div>
  );
};
