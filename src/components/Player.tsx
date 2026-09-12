import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Video,
  Headphones,
  Sliders,
  Bookmark,
  Share2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Settings,
  X
} from 'lucide-react';
import { Episode, EQMode, PlayerState } from '../types';
import { audioEngine } from '../services/audioEngine';
import { TranscriptBrowser } from './TranscriptBrowser';
import { SyncService } from '../services/syncService';

interface PlayerProps {
  playerState: PlayerState;
  onUpdatePlayerState: (updates: Partial<PlayerState>) => void;
  onOpenShare: (episode: Episode) => void;
  onOpenDeviceSettings: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  playerState,
  onUpdatePlayerState,
  onOpenShare,
  onOpenDeviceSettings
}) => {
  const { currentEpisode, isPlaying, currentTime, duration, playbackSpeed, volume, isMuted, eqMode, isExpanded, mediaType } = playerState;

  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEQMenu, setShowEQMenu] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [visualizerBars, setVisualizerBars] = useState<number[]>([12, 24, 18, 32, 28, 40, 36, 20]);

  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Sync saved status
  useEffect(() => {
    if (currentEpisode) {
      const saved = SyncService.getSavedEpisodeIds();
      setIsSaved(saved.includes(currentEpisode.id));
    }
  }, [currentEpisode]);

  // Audio element setup and time updates
  useEffect(() => {
    if (!currentEpisode) return;

    audioEngine.setSource(currentEpisode.audioUrl);
    audioEngine.setVolume(volume);
    audioEngine.setSpeed(playbackSpeed);
    audioEngine.setEQMode(eqMode);

    const audio = audioEngine.getAudioElement();
    if (!audio) return;

    const handleTimeUpdate = () => {
      const current = audio.currentTime;
      const total = audio.duration || currentEpisode.durationSeconds;
      onUpdatePlayerState({ currentTime: current, duration: total });

      // Save position to listening history
      SyncService.updateListeningPosition(currentEpisode.id, Math.floor(current), Math.floor(total));
    };

    const handleEnded = () => {
      onUpdatePlayerState({ isPlaying: false, currentTime: 0 });
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [currentEpisode]);

  // Visualizer loop when playing
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      return;
    }

    const updateVisualizer = () => {
      const data = audioEngine.getVisualizerData();
      const sampled: number[] = [];
      const step = Math.floor(data.length / 10) || 1;
      for (let i = 0; i < 10; i++) {
        const val = data[i * step] || 20;
        sampled.push(Math.max(8, Math.min(50, Math.round((val / 255) * 50))));
      }
      setVisualizerBars(sampled);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    updateVisualizer();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlaying]);

  // Play / Pause handler
  const handleTogglePlay = () => {
    if (!currentEpisode) return;

    if (isPlaying) {
      audioEngine.pause();
      if (videoElementRef.current) videoElementRef.current.pause();
      onUpdatePlayerState({ isPlaying: false });
    } else {
      audioEngine.play();
      if (videoElementRef.current) videoElementRef.current.play();
      onUpdatePlayerState({ isPlaying: true });
    }
  };

  // Backhopping (-15 seconds)
  const handleBackhop = () => {
    audioEngine.backhop(15);
    const newTime = Math.max(0, currentTime - 15);
    if (videoElementRef.current) videoElementRef.current.currentTime = newTime;
    onUpdatePlayerState({ currentTime: newTime });
  };

  // Skip Forward (+30 seconds)
  const handleSkipForward = () => {
    audioEngine.skipForward(30);
    const newTime = Math.min(duration || currentEpisode?.durationSeconds || 9999, currentTime + 30);
    if (videoElementRef.current) videoElementRef.current.currentTime = newTime;
    onUpdatePlayerState({ currentTime: newTime });
  };

  // Seek handler from scrubber
  const handleSeek = (newSeconds: number) => {
    audioEngine.seek(newSeconds);
    if (videoElementRef.current) videoElementRef.current.currentTime = newSeconds;
    onUpdatePlayerState({ currentTime: newSeconds });
  };

  // Speed Adjustment
  const handleSetSpeed = (speed: number) => {
    audioEngine.setSpeed(speed);
    if (videoElementRef.current) videoElementRef.current.playbackRate = speed;
    onUpdatePlayerState({ playbackSpeed: speed });
    setShowSpeedMenu(false);
  };

  // Volume & Mute
  const handleVolumeChange = (newVolume: number) => {
    audioEngine.setVolume(newVolume);
    onUpdatePlayerState({ volume: newVolume, isMuted: newVolume === 0 });
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    audioEngine.setMuted(nextMuted);
    onUpdatePlayerState({ isMuted: nextMuted });
  };

  // EQ Sound Control
  const handleSetEQ = (mode: EQMode) => {
    audioEngine.setEQMode(mode);
    onUpdatePlayerState({ eqMode: mode });
    setShowEQMenu(false);
  };

  // Bookmark toggle
  const handleToggleSave = () => {
    if (!currentEpisode) return;
    const nowSaved = SyncService.toggleSavedEpisode(currentEpisode.id);
    setIsSaved(nowSaved);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentEpisode) return null;

  const totalDuration = duration || currentEpisode.durationSeconds || 1;
  const progressPercent = Math.min(100, (currentTime / totalDuration) * 100);

  return (
    <>
      {/* FULL EXPANDED PLAYER MODAL */}
      {isExpanded && (
        <div id="expanded-player-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-fadeIn overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100 max-h-[95vh] overflow-y-auto">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Episode {currentEpisode.episodeNumber} • {currentEpisode.series}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDeviceSettings}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Audio Output / Device Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <button
                  id="minimize-player-btn"
                  onClick={() => onUpdatePlayerState({ isExpanded: false })}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Stage: Media Player & Synchronized Transcript */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Media & Controls */}
              <div className="lg:col-span-7 space-y-5">
                {/* Media Stage (Video or Audio Artwork with Waveform) */}
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex items-center justify-center group">
                  {mediaType === 'video' && currentEpisode.videoUrl ? (
                    <video
                      ref={videoElementRef}
                      src={currentEpisode.videoUrl}
                      controls={false}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="relative w-full h-full">
                      <img
                        src={currentEpisode.coverImage}
                        alt={currentEpisode.title}
                        className="w-full h-full object-cover opacity-35 filter blur-[2px]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent flex flex-col items-center justify-center p-6 text-center">
                        <img
                          src={currentEpisode.coverImage}
                          alt={currentEpisode.title}
                          className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover shadow-2xl border-2 border-amber-500/40 mb-4"
                        />
                        {/* Audio Wave Visualizer */}
                        <div className="flex items-end justify-center gap-1.5 h-10 mb-2">
                          {visualizerBars.map((height, i) => (
                            <div
                              key={i}
                              className="w-1.5 bg-gradient-to-t from-amber-500 to-amber-300 rounded-full transition-all duration-75"
                              style={{ height: `${height}px` }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Mode Switch (Audio vs Video) if video is available */}
                  {currentEpisode.type === 'video' && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-slate-900/80 backdrop-blur p-1 rounded-xl border border-slate-700">
                      <button
                        onClick={() => onUpdatePlayerState({ mediaType: 'audio' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          mediaType === 'audio' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Headphones className="w-3.5 h-3.5" /> Audio
                      </button>
                      <button
                        onClick={() => onUpdatePlayerState({ mediaType: 'video' })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                          mediaType === 'video' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" /> Video
                      </button>
                    </div>
                  )}
                </div>

                {/* Episode Details */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-display">
                    {currentEpisode.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Hosted by {currentEpisode.host} {currentEpisode.guest ? `• Featuring ${currentEpisode.guest}` : ''}
                  </p>
                </div>

                {/* Progress Scrubber */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group cursor-pointer">
                    <input
                      type="range"
                      min={0}
                      max={totalDuration}
                      value={currentTime}
                      onChange={e => handleSeek(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500 group-hover:h-2.5 transition-all"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>{formatSeconds(currentTime)}</span>
                    <span>{formatSeconds(totalDuration)}</span>
                  </div>
                </div>

                {/* Main Expanded Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
                  {/* Sound Control & EQ */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleToggleMute}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-5 h-5 text-rose-400" /> : <Volume2 className="w-5 h-5 text-amber-400" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={e => handleVolumeChange(Number(e.target.value))}
                      className="w-20 sm:w-24 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                    />

                    {/* Sound Control EQ Mode */}
                    <div className="relative">
                      <button
                        onClick={() => setShowEQMenu(!showEQMenu)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center gap-1 font-medium"
                      >
                        <Sliders className="w-3 h-3" />
                        <span className="capitalize">{eqMode} EQ</span>
                      </button>

                      {showEQMenu && (
                        <div className="absolute left-0 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-xl w-44 z-20 space-y-1 text-xs">
                          <button
                            onClick={() => handleSetEQ('balanced')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${eqMode === 'balanced' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            Balanced Studio
                          </button>
                          <button
                            onClick={() => handleSetEQ('vocal')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${eqMode === 'vocal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            Vocal Clarity Boost
                          </button>
                          <button
                            onClick={() => handleSetEQ('bass')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${eqMode === 'bass' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            Deep Resonance (Bass)
                          </button>
                          <button
                            onClick={() => handleSetEQ('studio')}
                            className={`w-full text-left px-2.5 py-1.5 rounded-lg ${eqMode === 'studio' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            Acoustic Dynamic
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Primary Playback Buttons (Backhop, Play/Pause, Skip) */}
                  <div className="flex items-center gap-3">
                    <button
                      id="expanded-backhop-btn"
                      onClick={handleBackhop}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
                      title="Backhop 15 seconds"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-400" />
                      <span>15s</span>
                    </button>

                    <button
                      id="expanded-play-btn"
                      onClick={handleTogglePlay}
                      className="w-12 h-12 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition-all shadow-lg shadow-amber-500/30 active:scale-95"
                    >
                      {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
                    </button>

                    <button
                      id="expanded-skip-forward-btn"
                      onClick={handleSkipForward}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center gap-1 text-xs font-semibold"
                      title="Skip forward 30 seconds"
                    >
                      <span>30s</span>
                      <RotateCw className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>

                  {/* Speed & Share */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono font-semibold text-amber-400 border border-slate-700"
                      >
                        {playbackSpeed}x Speed
                      </button>
                      {showSpeedMenu && (
                        <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-xl w-28 z-20 space-y-1 text-xs font-mono">
                          {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(s => (
                            <button
                              key={s}
                              onClick={() => handleSetSpeed(s)}
                              className={`w-full text-center py-1 rounded-lg ${
                                playbackSpeed === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleToggleSave}
                      className={`p-2 rounded-xl border transition-all ${
                        isSaved
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Bookmarked in library' : 'Save to library'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenShare(currentEpisode)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      title="Share episode"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Transcript Browser */}
              <div className="lg:col-span-5 h-[480px]">
                <TranscriptBrowser
                  transcript={currentEpisode.transcript}
                  currentTime={currentTime}
                  onSeek={handleSeek}
                  scriptureReferences={currentEpisode.scriptureReferences}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT BOTTOM PLAYER BAR */}
      <div
        id="persistent-player-bar"
        className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800/80 shadow-2xl px-4 py-2.5 sm:py-3 transition-all"
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Top miniature progress bar (clickable scrubber) */}
          <div
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const ratio = Math.max(0, Math.min(1, clickX / rect.width));
              handleSeek(ratio * totalDuration);
            }}
            className="w-full h-1.5 bg-slate-800/90 rounded-full overflow-hidden cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 transition-all duration-100"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Left: Episode Info & Thumbnail */}
            <div className="flex items-center gap-3 min-w-0 max-w-[280px] sm:max-w-xs md:max-w-sm">
              <div className="relative group shrink-0">
                <img
                  src={currentEpisode.coverImage}
                  alt={currentEpisode.title}
                  className="w-12 h-12 rounded-xl object-cover border border-slate-700"
                />
                <button
                  onClick={() => onUpdatePlayerState({ isExpanded: true })}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center text-white"
                  title="Expand Player"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block truncate">
                  Ep. {currentEpisode.episodeNumber} • {currentEpisode.series}
                </span>
                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                  {currentEpisode.title}
                </h4>
                <span className="text-[11px] text-slate-400 truncate block">
                  {currentEpisode.host}
                </span>
              </div>
            </div>

            {/* Center: Playback Controls (Backhop, Play, Skip) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Backhopping Button */}
              <button
                id="backhop-15s-btn"
                onClick={handleBackhop}
                className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-1"
                title="Backhop 15 seconds"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-bold font-mono">15s</span>
              </button>

              {/* Play / Pause Toggle */}
              <button
                id="main-play-pause-btn"
                onClick={handleTogglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              {/* Skip Forward Button */}
              <button
                id="skip-forward-30s-btn"
                onClick={handleSkipForward}
                className="p-2 sm:p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all flex items-center gap-1"
                title="Skip forward 30 seconds"
              >
                <span className="text-[10px] sm:text-xs font-bold font-mono">30s</span>
                <RotateCw className="w-4 h-4 text-amber-400" />
              </button>

              <span className="hidden md:inline font-mono text-xs text-slate-400 pl-2">
                {formatSeconds(currentTime)} / {formatSeconds(totalDuration)}
              </span>
            </div>

            {/* Right: Sound Control, Playback Speed, Expand */}
            <div className="flex items-center gap-2">
              {/* Playback speed selector pill */}
              <div className="relative hidden sm:block">
                <button
                  id="speed-select-btn"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono font-bold text-amber-400 hover:bg-slate-800"
                >
                  {playbackSpeed}x
                </button>
                {showSpeedMenu && (
                  <div className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-xl w-24 z-20 font-mono text-xs">
                    {[0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map(s => (
                      <button
                        key={s}
                        onClick={() => handleSetSpeed(s)}
                        className={`w-full text-center py-1 rounded ${
                          playbackSpeed === s ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {s}x
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sound Control Slider */}
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleToggleMute}
                  className="text-slate-400 hover:text-white"
                >
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={e => handleVolumeChange(Number(e.target.value))}
                  className="w-16 h-1 bg-slate-800 rounded-full appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Quick Save Bookmark */}
              <button
                onClick={handleToggleSave}
                className={`p-2 rounded-xl transition-all ${
                  isSaved ? 'text-amber-400' : 'text-slate-400 hover:text-white'
                }`}
                title="Save episode"
              >
                <Bookmark className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={() => onOpenShare(currentEpisode)}
                className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
                title="Share episode"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Expand to Modal */}
              <button
                id="expand-player-btn"
                onClick={() => onUpdatePlayerState({ isExpanded: true })}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Expand Full Transcript & Video"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
