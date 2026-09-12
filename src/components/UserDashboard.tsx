import React, { useState, useEffect } from 'react';
import {
  User,
  Clock,
  Bookmark,
  HardDrive,
  RefreshCw,
  Play,
  CheckCircle2,
  Trash2,
  Download,
  Share2,
  Smartphone,
  Laptop,
  Flame,
  Award,
  Sparkles,
  WifiOff,
  Wifi,
  Copy,
  Check,
  BarChart3,
  TrendingUp,
  Compass
} from 'lucide-react';
import { Episode, ListeningHistoryItem, SyncState, ListeningStats } from '../types';
import { SyncService } from '../services/syncService';
import { ListeningStatsView } from './ListeningStatsView';
import { SavedEpisodesManager } from './SavedEpisodesManager';
import { RecommendedEpisodesView } from './RecommendedEpisodesView';

interface UserDashboardProps {
  episodes: Episode[];
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenShare: (episode: Episode) => void;
  onOpenTranscriptModal?: (episode: Episode) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  onNewNotification: (title: string, message: string, type: 'system' | 'cloud_backup') => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  episodes,
  onPlayEpisode,
  onOpenShare,
  onOpenTranscriptModal = () => {},
  isOfflineMode,
  setIsOfflineMode,
  onNewNotification
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'saved' | 'recommended' | 'history' | 'offline' | 'sync'>('stats');
  const [history, setHistory] = useState<Record<string, ListeningHistoryItem>>({});
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [offlineIds, setOfflineIds] = useState<string[]>([]);
  const [syncState, setSyncState] = useState<SyncState>(SyncService.getSyncState());
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [stats, setStats] = useState<ListeningStats>(() => SyncService.getListeningStats(episodes));

  useEffect(() => {
    loadData();
  }, [episodes]);

  const loadData = () => {
    setHistory(SyncService.getListeningHistory());
    setSavedIds(SyncService.getSavedEpisodeIds());
    setOfflineIds(SyncService.getOfflineEpisodeIds());
    setSyncState(SyncService.getSyncState());
    setStats(SyncService.getListeningStats(episodes));
  };

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const updated = {
        ...syncState,
        lastSynced: Date.now()
      };
      SyncService.saveSyncState(updated);
      setSyncState(updated);
      setIsSyncing(false);
      onNewNotification('Cross-Device Sync Complete', 'Your listening progress, saved bookmarks, and commentary backups are synchronized.', 'system');
    }, 1200);
  };

  const handleCopySyncCode = () => {
    navigator.clipboard.writeText(syncState.syncCode);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2000);
  };

  const handleToggleOffline = (id: string) => {
    SyncService.toggleOfflineEpisode(id);
    loadData();
  };

  const offlineEpisodes = episodes.filter(e => offlineIds.includes(e.id));

  const formatLastSynced = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  const totalListeningHours = (stats.totalListeningSeconds / 3600).toFixed(1);

  return (
    <div id="user-dashboard-container" className="space-y-6 max-w-6xl mx-auto">
      {/* Profile Overview Card */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-bold text-2xl font-display">
              KG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white font-display">
                  Kingdom Disciple Dashboard
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-semibold text-[11px]">
                  Ambassador Tier
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                <span>cstadning@gmail.com</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Connected to Cloud Sync
                </span>
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                <Clock className="w-3.5 h-3.5" />
                <span>{totalListeningHours} Hours</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Listened</span>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                <Flame className="w-3.5 h-3.5" />
                <span>{stats.currentStreakDays}-Day Streak</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Daily Intake</span>
            </div>

            <div className="px-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium">
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedIds.length} Saved</span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Study Library</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Tab 1: Listening Statistics */}
          <button
            id="tab-stats-btn"
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'stats'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Listening Statistics
          </button>

          {/* Tab 2: Saved Episodes */}
          <button
            id="tab-saved-btn"
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            Saved Episodes ({savedIds.length})
          </button>

          {/* Tab 3: Recommended Episodes */}
          <button
            id="tab-recommended-btn"
            onClick={() => setActiveTab('recommended')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'recommended'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recommended For You
          </button>

          {/* Tab 4: History & Progress */}
          <button
            id="tab-history-btn"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            History ({Object.keys(history).length})
          </button>

          {/* Tab 5: Offline Mode */}
          <button
            id="tab-offline-btn"
            onClick={() => setActiveTab('offline')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'offline'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Offline ({offlineIds.length})
          </button>

          {/* Tab 6: Cross-Device Sync */}
          <button
            id="tab-sync-btn"
            onClick={() => setActiveTab('sync')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'sync'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync
          </button>
        </div>

        {/* Global Offline Mode Toggle switch */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
          {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="text-xs text-slate-300 font-medium">
            {isOfflineMode ? 'Offline Mode Active' : 'Online Stream'}
          </span>
          <button
            id="toggle-offline-mode-btn"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
              isOfflineMode ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {isOfflineMode ? 'Go Online' : 'Simulate Offline'}
          </button>
        </div>
      </div>

      {/* TAB 1: LISTENING STATISTICS */}
      {activeTab === 'stats' && (
        <ListeningStatsView
          stats={stats}
          episodes={episodes}
          onPlayEpisode={onPlayEpisode}
          onOpenShare={onOpenShare}
        />
      )}

      {/* TAB 2: SAVED EPISODES & STUDY LIBRARY WITH NOTES & CATEGORIES */}
      {activeTab === 'saved' && (
        <SavedEpisodesManager
          episodes={episodes}
          onPlayEpisode={onPlayEpisode}
          onOpenShare={onOpenShare}
          onDataChanged={loadData}
        />
      )}

      {/* TAB 3: RECOMMENDED EPISODES */}
      {activeTab === 'recommended' && (
        <RecommendedEpisodesView
          episodes={episodes}
          stats={stats}
          savedIds={savedIds}
          onPlayEpisode={onPlayEpisode}
          onOpenTranscriptModal={onOpenTranscriptModal}
          onDataChanged={loadData}
        />
      )}

      {/* TAB 4: LISTENING HISTORY & RESUME */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {Object.keys(history).length === 0 ? (
            <div className="p-12 text-center bg-slate-900/50 rounded-2xl border border-slate-800 text-slate-400 text-xs">
              No listening history recorded yet. Start streaming an episode to track your kingdom study progress!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(Object.entries(history) as [string, ListeningHistoryItem][]).map(([epId, item]) => {
                const ep = episodes.find(e => e.id === epId);
                if (!ep) return null;
                const progressPct = Math.min(100, Math.round((item.lastPosition / ep.durationSeconds) * 100));
                const mins = Math.floor(item.lastPosition / 60);
                const secs = item.lastPosition % 60;
                const timeStr = `${mins}:${secs.toString().padStart(2, '0')}`;

                return (
                  <div
                    key={epId}
                    className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex gap-4"
                  >
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                          Episode {ep.episodeNumber}
                        </span>
                        <h4 className="text-sm font-semibold text-slate-100 truncate mt-0.5">
                          {ep.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">
                          Speaker: {ep.host}
                        </p>
                      </div>

                      <div className="mt-3 space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                          <span>{item.completed ? 'Completed' : `Resume at ${timeStr}`}</span>
                          <span>{progressPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${item.completed ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        <button
                          onClick={() => onPlayEpisode(ep, item.lastPosition)}
                          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          {item.completed ? 'Replay' : 'Resume'}
                        </button>
                        <button
                          onClick={() => onOpenShare(ep)}
                          className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
                          title="Share Episode"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: OFFLINE MODE & CACHE MANAGER */}
      {activeTab === 'offline' && (
        <div className="space-y-5">
          {/* Storage Meter Card */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                Offline Device Storage Allocation
              </span>
              <span className="text-xs font-mono text-amber-400 font-bold">
                {syncState.storageUsedMB} MB / 2,048 MB Allocated
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400"
                style={{ width: `${Math.max(3, (syncState.storageUsedMB / 2048) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400">
              Episodes marked for offline mode store audio streams and interactive transcripts locally in IndexedDB cache for seamless playback without internet connection.
            </p>
          </div>

          {/* Downloaded Offline Episodes List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Downloaded for Offline Listening ({offlineEpisodes.length})
              </h3>
              {offlineEpisodes.length > 0 && (
                <button
                  onClick={() => {
                    localStorage.setItem('cgf_podcast_offline_ids', JSON.stringify([]));
                    loadData();
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  Clear All Offline Downloads
                </button>
              )}
            </div>

            {offlineEpisodes.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                No episodes currently downloaded for offline playback. Click "Download for Offline" on any episode.
              </div>
            ) : (
              <div className="space-y-2">
                {offlineEpisodes.map(ep => (
                  <div
                    key={ep.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={ep.coverImage}
                        alt={ep.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-100 truncate">{ep.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>{ep.duration}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-medium">Offline Ready (~48.5 MB)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onPlayEpisode(ep, 0)}
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" /> Play Offline
                      </button>
                      <button
                        onClick={() => handleToggleOffline(ep.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete offline file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 6: CROSS-DEVICE SYNCHRONIZATION */}
      {activeTab === 'sync' && (
        <div className="space-y-5">
          {/* Sync Header Box */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                  <h3 className="text-sm font-bold text-slate-100">Cross-Device Synchronizer</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronize listening positions, bookmarks, notes, and commentary across mobile and web
                </p>
              </div>

              <button
                id="sync-across-devices-btn"
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Syncing...' : 'Sync Across All Devices Now'}
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-slate-400">
                Last Cloud Synchronization: <strong className="text-slate-200">{formatLastSynced(syncState.lastSynced)}</strong>
              </span>
              <span className="text-emerald-400 font-mono text-[11px]">Device ID: {syncState.deviceId}</span>
            </div>
          </div>

          {/* Sync Code Box */}
          <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Your Cross-Device Pairing Code
              </span>
              <span className="text-[11px] text-slate-400">Enter in CGF Mobile App</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-lg font-bold text-slate-100 tracking-widest select-all">
                {syncState.syncCode}
              </span>
              <button
                id="copy-sync-code-btn"
                onClick={handleCopySyncCode}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedSyncCode ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                {copiedSyncCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSyncCode ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>

          {/* Connected Devices List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Active Linked Devices
            </h3>
            <div className="space-y-2">
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Laptop className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">{syncState.deviceName} (This Browser)</h4>
                    <p className="text-[10px] text-slate-400">Active Now • Full Studio Access</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Primary Node
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-sky-400" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-100">iPhone 16 Pro • CGF Companion App</h4>
                    <p className="text-[10px] text-slate-400">Synced 12 mins ago • Offline Mode Enabled</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium text-slate-400">
                  Synced
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
