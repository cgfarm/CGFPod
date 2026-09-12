import React, { useState, useEffect } from 'react';
import {
  INITIAL_EPISODES,
  INITIAL_NOTIFICATIONS
} from './data/episodesData';
import { Episode, PlayerState, NotificationAlert } from './types';
import { Header } from './components/Header';
import { EpisodeList } from './components/EpisodeList';
import { EpisodeDetailsModal } from './components/EpisodeDetailsModal';
import { Player } from './components/Player';
import { WebcastStudio } from './components/WebcastStudio';
import { LiveBroadcastModal } from './components/LiveBroadcastModal';
import { UserDashboard } from './components/UserDashboard';
import { PodcastNetworksModal } from './components/PodcastNetworksModal';
import { ShareModal } from './components/ShareModal';
import { DeviceSettingsModal } from './components/DeviceSettingsModal';
import { audioEngine } from './services/audioEngine';
import {
  Sparkles,
  Radio,
  Rss,
  Headphones,
  CheckCircle2,
  Bell,
  Heart
} from 'lucide-react';

export default function App() {
  const [episodes] = useState<Episode[]>(INITIAL_EPISODES);
  const [activeView, setActiveView] = useState<'episodes' | 'dashboard' | 'webcast'>('episodes');

  // Player State
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentEpisode: INITIAL_EPISODES[0],
    isPlaying: false,
    currentTime: 0,
    duration: INITIAL_EPISODES[0].durationSeconds,
    playbackSpeed: 1.0,
    volume: 0.85,
    isMuted: false,
    eqMode: 'balanced',
    isExpanded: false,
    mediaType: 'video',
    isPiP: false
  });

  // Modal States
  const [detailModalEpisode, setDetailModalEpisode] = useState<Episode | null>(null);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isNetworksModalOpen, setIsNetworksModalOpen] = useState(false);
  const [isDeviceSettingsOpen, setIsDeviceSettingsOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEpisode, setShareEpisode] = useState<Episode | null>(INITIAL_EPISODES[0]);
  const [shareQuote, setShareQuote] = useState<string | undefined>(undefined);
  const [shareTimestamp, setShareTimestamp] = useState<number | undefined>(undefined);

  // Offline Mode & Real-time Notifications
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(!navigator.onLine);
  const [notifications, setNotifications] = useState<NotificationAlert[]>(INITIAL_NOTIFICATIONS);
  const [toastMessage, setToastMessage] = useState<{ title: string; message: string } | null>(null);

  // Check URL params on initial mount for shared timestamps or specific episodes
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const epParam = params.get('ep');
      const timeParam = params.get('t');

      if (epParam) {
        const found = episodes.find(e => e.id === epParam);
        if (found) {
          const seekTime = timeParam ? parseInt(timeParam, 10) : 0;
          handlePlayEpisode(found, seekTime);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Monitor online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update player state helper
  const handleUpdatePlayerState = (updates: Partial<PlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }));
  };

  // Play Episode
  const handlePlayEpisode = (episode: Episode, startAtSeconds?: number) => {
    const seekTime = startAtSeconds !== undefined ? startAtSeconds : 0;
    setPlayerState(prev => ({
      ...prev,
      currentEpisode: episode,
      isPlaying: true,
      currentTime: seekTime,
      duration: episode.durationSeconds,
      mediaType: episode.type === 'video' ? 'video' : 'audio'
    }));

    audioEngine.setSource(episode.audioUrl);
    audioEngine.seek(seekTime);
    audioEngine.play();
  };

  // Open Share with optional quote & timestamp
  const handleOpenShare = (episode: Episode, quote?: string, timestamp?: number) => {
    setShareEpisode(episode);
    setShareQuote(quote);
    setShareTimestamp(timestamp);
    setIsShareModalOpen(true);
  };

  // Add Real-Time Notification Alert
  const handleNewNotification = (title: string, message: string, type: 'new_episode' | 'live_webcast' | 'cloud_backup' | 'system') => {
    const newAlert: NotificationAlert = {
      id: 'notif-' + Date.now(),
      title,
      message,
      timestamp: 'Just now',
      type,
      read: false
    };
    setNotifications(prev => [newAlert, ...prev]);
    setToastMessage({ title, message });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleSelectEpisodeById = (id: string) => {
    const found = episodes.find(e => e.id === id);
    if (found) {
      setDetailModalEpisode(found);
    }
  };

  return (
    <div id="cgf-app-root" className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans pb-28">
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-amber-500/40 shadow-2xl backdrop-blur-md animate-slideDown flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <Bell className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-100">{toastMessage.title}</h4>
            <p className="text-[11px] text-slate-300 mt-0.5">{toastMessage.message}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Global Header */}
      <Header
        activeView={activeView}
        setActiveView={setActiveView}
        onOpenLiveModal={() => setIsLiveModalOpen(true)}
        onOpenNetworksModal={() => setIsNetworksModalOpen(true)}
        onOpenDeviceSettings={() => setIsDeviceSettingsOpen(true)}
        isOfflineMode={isOfflineMode}
        setIsOfflineMode={setIsOfflineMode}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onSelectEpisodeById={handleSelectEpisodeById}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeView === 'episodes' && (
          <EpisodeList
            episodes={episodes}
            onPlayEpisode={handlePlayEpisode}
            onOpenTranscriptModal={ep => setDetailModalEpisode(ep)}
            onOpenShare={ep => handleOpenShare(ep)}
            onOpenNetworks={() => setIsNetworksModalOpen(true)}
            currentPlayingId={playerState.currentEpisode?.id}
            isOfflineMode={isOfflineMode}
          />
        )}

        {activeView === 'dashboard' && (
          <UserDashboard
            episodes={episodes}
            onPlayEpisode={handlePlayEpisode}
            onOpenShare={ep => handleOpenShare(ep)}
            onOpenTranscriptModal={ep => setDetailModalEpisode(ep)}
            isOfflineMode={isOfflineMode}
            setIsOfflineMode={setIsOfflineMode}
            onNewNotification={handleNewNotification}
          />
        )}

        {activeView === 'webcast' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  Webcast & Commentary Engine
                </span>
                <h2 className="text-xl font-bold text-white font-display mt-1">
                  CGF Live Commentary Recording Studio
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Record live commentary with virtual backgrounds, studio lower-thirds, and automated cloud backup to Google Cloud Storage.
                </p>
              </div>
              <button
                onClick={() => setIsDeviceSettingsOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Test Mic & Camera
              </button>
            </div>

            {/* Embedded Webcast Studio */}
            <WebcastStudio
              isOpen={true}
              onClose={() => setActiveView('episodes')}
              episodes={episodes}
              onNewNotification={handleNewNotification}
              onOpenDeviceSettings={() => setIsDeviceSettingsOpen(true)}
            />
          </div>
        )}
      </main>

      {/* Episode Details & Interactive Transcript Modal */}
      <EpisodeDetailsModal
        episode={detailModalEpisode}
        isOpen={!!detailModalEpisode}
        onClose={() => setDetailModalEpisode(null)}
        onPlayEpisode={handlePlayEpisode}
        onOpenShare={handleOpenShare}
        onOpenNetworks={() => setIsNetworksModalOpen(true)}
        currentTime={playerState.currentTime}
      />

      {/* Live Broadcast & Real-Time Viewer Statistics Modal */}
      <LiveBroadcastModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onOpenShare={() => {
          if (episodes[0]) handleOpenShare(episodes[0]);
        }}
      />

      {/* Podcast Networks Modal */}
      <PodcastNetworksModal
        isOpen={isNetworksModalOpen}
        onClose={() => setIsNetworksModalOpen(false)}
      />

      {/* Share & Quote Card Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        episode={shareEpisode}
        selectedQuote={shareQuote}
        initialTimestamp={shareTimestamp}
      />

      {/* Audio & Video Device Hardware Settings */}
      <DeviceSettingsModal
        isOpen={isDeviceSettingsOpen}
        onClose={() => setIsDeviceSettingsOpen(false)}
      />

      {/* Persistent Bottom Player Bar */}
      <Player
        playerState={playerState}
        onUpdatePlayerState={handleUpdatePlayerState}
        onOpenShare={ep => handleOpenShare(ep)}
        onOpenDeviceSettings={() => setIsDeviceSettingsOpen(true)}
      />
    </div>
  );
}
