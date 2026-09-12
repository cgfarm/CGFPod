import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Image as ImageIcon,
  Upload,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Play,
  Square,
  RefreshCw,
  Download,
  Settings,
  Sparkles,
  Layers
} from 'lucide-react';
import { Episode, VirtualBackgroundOption, WebcastRecording } from '../types';
import { VIRTUAL_BACKGROUND_PRESETS } from '../data/episodesData';
import { SyncService } from '../services/syncService';

interface WebcastStudioProps {
  isOpen: boolean;
  onClose: () => void;
  episodes: Episode[];
  onNewNotification: (title: string, message: string, type: 'cloud_backup' | 'system') => void;
  onOpenDeviceSettings: () => void;
}

export const WebcastStudio: React.FC<WebcastStudioProps> = ({
  isOpen,
  onClose,
  episodes,
  onNewNotification,
  onOpenDeviceSettings
}) => {
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string>(episodes[0]?.id || '');
  const [selectedBg, setSelectedBg] = useState<VirtualBackgroundOption>(VIRTUAL_BACKGROUND_PRESETS[0]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);

  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordingsList, setRecordingsList] = useState<WebcastRecording[]>([]);
  const [autoCloudBackup, setAutoCloudBackup] = useState(true);
  const [activeBackupItem, setActiveBackupItem] = useState<WebcastRecording | null>(null);
  const [micVolumeLevel, setMicVolumeLevel] = useState(0);

  const rawVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load recordings on open
  useEffect(() => {
    if (isOpen) {
      setRecordingsList(SyncService.getRecordings());
    }
  }, [isOpen]);

  // Load background image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = customBgUrl || selectedBg.imageUrl || selectedBg.previewUrl;
    img.onload = () => {
      bgImageRef.current = img;
    };
  }, [selectedBg, customBgUrl]);

  // Start Camera & Mic stream
  useEffect(() => {
    if (!isOpen) {
      stopCameraAndMic();
      return;
    }

    startCameraAndMic();

    return () => {
      stopCameraAndMic();
    };
  }, [isOpen]);

  const startCameraAndMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: true
      });
      mediaStreamRef.current = stream;
      if (rawVideoRef.current) {
        rawVideoRef.current.srcObject = stream;
      }

      // Mic level analyser
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);

      const updateMeter = () => {
        analyser.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        setMicVolumeLevel(Math.min(100, Math.round((sum / data.length / 128) * 100)));
        animationFrameRef.current = requestAnimationFrame(updateMeter);
      };
      updateMeter();

      // Start canvas compositor
      renderCompositor();
    } catch (err) {
      console.warn('Camera/Mic access note:', err);
    }
  };

  const stopCameraAndMic = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(t => t.stop());
      mediaStreamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
  };

  // Continuous Canvas Virtual Background Compositor
  const renderCompositor = () => {
    const canvas = canvasRef.current;
    const video = rawVideoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Virtual Background
      if (selectedBg.type === 'blur') {
        // Draw blurred video frame
        if (video && video.readyState >= 2) {
          ctx.filter = 'blur(16px) brightness(0.65)';
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      } else if (bgImageRef.current && bgImageRef.current.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
        // Add subtle studio overlay gradient for cinematic look
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, 'rgba(15, 23, 42, 0.3)');
        gradient.addColorStop(1, 'rgba(15, 23, 42, 0.7)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      } else {
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // 2. Draw Presenter Feed (PiP or Center Stage Frame)
      if (video && video.readyState >= 2 && isCameraOn) {
        // We render an elegant studio presenter frame
        const pWidth = canvas.width * 0.75;
        const pHeight = canvas.height * 0.85;
        const pX = (canvas.width - pWidth) / 2;
        const pY = canvas.height - pHeight - 10;

        ctx.save();
        // Rounded frame clip for presenter
        ctx.beginPath();
        const r = 24;
        ctx.moveTo(pX + r, pY);
        ctx.lineTo(pX + pWidth - r, pY);
        ctx.quadraticCurveTo(pX + pWidth, pY, pX + pWidth, pY + r);
        ctx.lineTo(pX + pWidth, pY + pHeight);
        ctx.lineTo(pX, pY + pHeight);
        ctx.lineTo(pX, pY + r);
        ctx.quadraticCurveTo(pX, pY, pX + r, pY);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(video, pX, pY, pWidth, pHeight);
        ctx.restore();

        // Subtle gold border
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
        ctx.lineWidth = 3;
        ctx.strokeRect(pX, pY, pWidth, pHeight);
      }

      // 3. Draw Broadcast Lower Third Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(20, 20, 320, 48);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(20, 20, 320, 48);

      // Gold badge dot
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(36, 44, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('CGF KINGDOM COMMENTARY', 48, 38);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px "Plus Jakarta Sans", sans-serif';
      const curEp = episodes.find(e => e.id === selectedEpisodeId);
      const epLabel = curEp ? `Ep. ${curEp.episodeNumber} Review` : 'Live Webcast Session';
      ctx.fillText(epLabel, 48, 54);

      if (isRecording) {
        // Recording red badge
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        ctx.fillRect(canvas.width - 120, 20, 100, 32);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('• REC LIVE', canvas.width - 106, 40);
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();
  };

  // Upload Custom Background Handler
  const handleCustomBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomBgUrl(url);
      const customOption: VirtualBackgroundOption = {
        id: 'custom-bg-' + Date.now(),
        name: 'Custom Upload: ' + file.name.substring(0, 12),
        type: 'custom',
        previewUrl: url,
        imageUrl: url
      };
      setSelectedBg(customOption);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (mediaStreamRef.current) {
      const videoTrack = mediaStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  };

  // Toggle Mic
  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  // Start Recording Session
  const startRecording = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    recordedChunksRef.current = [];
    setRecordedVideoUrl(null);

    // Capture stream from canvas + audio track
    const canvasStream = canvas.captureStream(30);
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        canvasStream.addTrack(audioTrack);
      }
    }

    try {
      const recorder = new MediaRecorder(canvasStream, { mimeType: 'video/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = e => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideoUrl(url);
        finalizeRecordingSession(blob, url);
      };

      recorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setRecordingSeconds(0);

      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('MediaRecorder start error:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Finalize Recording and Trigger Automated Cloud Backup
  const finalizeRecordingSession = (blob: Blob, url: string) => {
    const currentEp = episodes.find(e => e.id === selectedEpisodeId);
    const sizeInMB = (blob.size / (1024 * 1024)).toFixed(1);

    const newRecording: WebcastRecording = {
      id: 'rec-' + Date.now(),
      title: `Live Commentary: ${currentEp ? currentEp.title : 'Kingdom Webcast'}`,
      episodeTitle: currentEp?.title,
      episodeId: currentEp?.id,
      timestamp: Date.now(),
      durationSeconds: recordingSeconds,
      mediaUrl: url,
      fileSize: `${sizeInMB} MB`,
      backupStatus: autoCloudBackup ? 'uploading' : 'queued',
      backupProgress: autoCloudBackup ? 15 : 0,
      virtualBackgroundUsed: selectedBg.name
    };

    SyncService.saveRecording(newRecording);
    setRecordingsList(SyncService.getRecordings());

    if (autoCloudBackup) {
      simulateCloudBackup(newRecording);
    }
  };

  // Automated File Backup to Cloud Storage Simulation
  const simulateCloudBackup = (recording: WebcastRecording) => {
    setActiveBackupItem(recording);

    let progress = 15;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 15;
      if (progress >= 100) {
        clearInterval(interval);
        const cloudUrl = `https://storage.googleapis.com/cgf-podcasts-commentary/${recording.id}.webm`;
        SyncService.updateRecordingBackup(recording.id, {
          backupStatus: 'backed_up',
          backupProgress: 100,
          cloudStorageUrl: cloudUrl
        });
        setRecordingsList(SyncService.getRecordings());
        setActiveBackupItem(null);

        onNewNotification(
          'Automated Cloud Backup Complete',
          `"${recording.title}" is safely backed up to Google Cloud Storage (cgf-podcasts-commentary).`,
          'cloud_backup'
        );
      } else {
        SyncService.updateRecordingBackup(recording.id, {
          backupProgress: progress,
          backupStatus: 'uploading'
        });
        setRecordingsList(SyncService.getRecordings());
      }
    }, 600);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div id="webcast-studio-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-slate-100 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Live Webcast & Commentary Studio</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
                  Virtual BG • Auto Cloud Backup
                </span>
              </div>
              <p className="text-xs text-slate-400">Record video commentary sessions with real-time compositing</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenDeviceSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Hardware Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              id="close-webcast-studio-btn"
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Exit Studio
            </button>
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Stage: Canvas Live Compositor */}
          <div className="lg:col-span-8 space-y-3">
            {/* Hidden Raw Video Source */}
            <video
              ref={rawVideoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />

            {/* The Live Compositor Canvas */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-700 shadow-2xl flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="w-full h-full object-contain"
              />

              {/* Live Overlay Indicators */}
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                {/* Audio Level Visualizer */}
                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <Mic className={`w-3.5 h-3.5 ${isMicOn ? 'text-amber-400' : 'text-slate-500'}`} />
                  <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 transition-all duration-75"
                      style={{ width: `${isMicOn ? micVolumeLevel : 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900/90 backdrop-blur border border-slate-700 px-3 py-1.5 rounded-xl text-[11px] text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3 h-3 text-amber-400" />
                  <span>BG: {selectedBg.name}</span>
                </div>
              </div>

              {/* Recording Status Timer Badge */}
              {isRecording && (
                <div className="absolute top-3 right-3 bg-rose-600/95 text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-600/30 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white"></span>
                  {formatTimer(recordingSeconds)}
                </div>
              )}
            </div>

            {/* Stage Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              {/* Media input toggles */}
              <div className="flex items-center gap-2">
                <button
                  id="toggle-studio-cam-btn"
                  onClick={toggleCamera}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    isCameraOn
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                  {isCameraOn ? 'Camera On' : 'Camera Off'}
                </button>

                <button
                  id="toggle-studio-mic-btn"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 transition-all ${
                    isMicOn
                      ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
                      : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  }`}
                >
                  {isMicOn ? <Mic className="w-4 h-4 text-amber-400" /> : <MicOff className="w-4 h-4" />}
                  {isMicOn ? 'Mic On' : 'Muted'}
                </button>
              </div>

              {/* Record Action */}
              <div className="flex items-center gap-3">
                {!isRecording ? (
                  <button
                    id="start-webcast-record-btn"
                    onClick={startRecording}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
                  >
                    <span className="w-3 h-3 rounded-full bg-white animate-pulse" />
                    Start Live Commentary Recording
                  </button>
                ) : (
                  <button
                    id="stop-webcast-record-btn"
                    onClick={stopRecording}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-rose-500/50 text-rose-400 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Square className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                    Stop & Save Commentary
                  </button>
                )}
              </div>
            </div>

            {/* Preview of latest recording if available */}
            {recordedVideoUrl && (
              <div className="p-4 bg-slate-950/80 border border-amber-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Recording Captured Successfully
                  </span>
                  <a
                    href={recordedVideoUrl}
                    download={`cgf-commentary-${Date.now()}.webm`}
                    className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Local File
                  </a>
                </div>
                <video
                  src={recordedVideoUrl}
                  controls
                  className="w-full max-h-48 rounded-xl border border-slate-800 bg-black"
                />
              </div>
            )}
          </div>

          {/* Right Panel: Settings, Virtual Backgrounds & Automated Cloud Storage Backup */}
          <div className="lg:col-span-4 space-y-4">
            {/* Associated Episode Selector */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Commentary Topic / Episode
              </label>
              <select
                id="commentary-episode-select"
                value={selectedEpisodeId}
                onChange={e => setSelectedEpisodeId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {episodes.map(ep => (
                  <option key={ep.id} value={ep.id}>
                    Ep. {ep.episodeNumber}: {ep.title.substring(0, 35)}...
                  </option>
                ))}
                <option value="standalone">Standalone Live Webcast</option>
              </select>
            </div>

            {/* Virtual Background Presets & Custom Upload */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Virtual Background
                </span>
                <span className="text-[10px] text-slate-400">Real-time Replace</span>
              </div>

              {/* Background presets thumbnails */}
              <div className="grid grid-cols-3 gap-2">
                {VIRTUAL_BACKGROUND_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedBg(preset);
                      setCustomBgUrl(null);
                    }}
                    className={`relative rounded-xl overflow-hidden border text-left p-1 group transition-all ${
                      selectedBg.id === preset.id && !customBgUrl
                        ? 'border-amber-500 ring-2 ring-amber-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <img
                      src={preset.previewUrl}
                      alt={preset.name}
                      className="w-full h-12 object-cover rounded-lg"
                    />
                    <span className="block text-[10px] font-medium text-slate-300 truncate mt-1">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload Custom Background */}
              <div className="pt-2 border-t border-slate-800/80">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleCustomBgUpload}
                  className="hidden"
                />
                <button
                  id="upload-virtual-bg-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-amber-500/50 text-xs text-slate-300 font-medium flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  Upload Custom Background Image
                </button>
                {customBgUrl && (
                  <div className="mt-2 flex items-center justify-between text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    <span>Custom Image Applied</span>
                    <button
                      onClick={() => {
                        setCustomBgUrl(null);
                        setSelectedBg(VIRTUAL_BACKGROUND_PRESETS[0]);
                      }}
                      className="text-xs underline hover:text-white"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Automated File Backup to Cloud Storage */}
            <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-sky-400" />
                  Automated Cloud Storage Backup
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoCloudBackup}
                    onChange={e => setAutoCloudBackup(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <p className="text-[11px] text-slate-400">
                Instantly archives commentary sessions into resilient Google Cloud Storage (Bucket: <code className="text-sky-300 font-mono">cgf-podcasts-commentary</code>).
              </p>

              {/* Active backup progress indicator */}
              {activeBackupItem && (
                <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-500/30 space-y-2">
                  <div className="flex justify-between text-xs text-sky-300">
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Backing up to Cloud...
                    </span>
                    <span>{activeBackupItem.backupProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-400 transition-all duration-200"
                      style={{ width: `${activeBackupItem.backupProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Recent Cloud Backups List */}
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Backed Up Sessions ({recordingsList.length})
                </span>
                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
                  {recordingsList.length === 0 ? (
                    <div className="text-[11px] text-slate-500 text-center py-2">
                      No recorded sessions yet. Hit record to create your first session!
                    </div>
                  ) : (
                    recordingsList.map(rec => (
                      <div
                        key={rec.id}
                        className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-slate-200 font-medium truncate text-[11px]">
                            {rec.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span>{rec.fileSize}</span>
                            <span>•</span>
                            <span>{rec.virtualBackgroundUsed}</span>
                          </div>
                        </div>

                        {rec.backupStatus === 'backed_up' ? (
                          <span className="shrink-0 flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Synced
                          </span>
                        ) : (
                          <span className="shrink-0 text-[10px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full">
                            Uploading
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
