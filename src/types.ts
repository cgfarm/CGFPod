export interface TranscriptSegment {
  id: string;
  timestamp: number; // in seconds
  timeFormatted: string;
  speaker: string;
  text: string;
  isKeyPoint?: boolean;
  scriptureRef?: string;
}

export interface ScriptureReference {
  reference: string;
  text: string;
}

export interface Episode {
  id: string;
  title: string;
  series: string;
  episodeNumber: number;
  publishDate: string;
  duration: string;
  durationSeconds: number;
  description: string;
  host: string;
  guest?: string;
  type: 'audio' | 'video';
  audioUrl: string;
  videoUrl?: string;
  coverImage: string;
  tags: string[];
  featured?: boolean;
  isNew?: boolean;
  transcript: TranscriptSegment[];
  keyTakeaways: string[];
  scriptureReferences: ScriptureReference[];
  networkLinks: {
    applePodcasts?: string;
    spotify?: string;
    youtubeMusic?: string;
    amazonMusic?: string;
    overcast?: string;
    pocketCasts?: string;
    rssFeed?: string;
  };
}

export type EQMode = 'balanced' | 'vocal' | 'bass' | 'studio';

export interface PlayerState {
  currentEpisode: Episode | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  eqMode: EQMode;
  isExpanded: boolean;
  mediaType: 'audio' | 'video';
  isPiP: boolean;
}

export interface ListeningHistoryItem {
  episodeId: string;
  lastPosition: number; // seconds
  completed: boolean;
  updatedAt: number;
}

export interface WebcastRecording {
  id: string;
  title: string;
  episodeTitle?: string;
  episodeId?: string;
  timestamp: number;
  durationSeconds: number;
  mediaUrl: string;
  fileSize: string;
  backupStatus: 'queued' | 'uploading' | 'backed_up' | 'failed';
  backupProgress: number;
  cloudStorageUrl?: string;
  virtualBackgroundUsed: string;
}

export interface VirtualBackgroundOption {
  id: string;
  name: string;
  type: 'preset' | 'blur' | 'custom';
  previewUrl: string;
  imageUrl?: string;
  description?: string;
}

export interface LiveViewerStats {
  isLive: boolean;
  currentViewers: number;
  peakViewers: number;
  streamTitle: string;
  streamHost: string;
  startedAt: string;
  countriesCount: number;
  topRegions: { region: string; viewers: number; flag: string }[];
  engagementRate: string;
}

export interface LiveComment {
  id: string;
  author: string;
  location: string;
  avatar: string;
  message: string;
  timestamp: string;
  isPrayerRequest?: boolean;
  reactionCount?: number;
}

export interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'new_episode' | 'live_webcast' | 'cloud_backup' | 'system';
  read: boolean;
  linkEpisodeId?: string;
}

export interface SyncState {
  lastSynced: number;
  syncCode: string;
  deviceId: string;
  deviceName: string;
  isSyncing: boolean;
  offlineEpisodesCount: number;
  storageUsedMB: number;
}

export interface AudioVideoDeviceConfig {
  audioInputId: string;
  audioOutputId: string;
  videoInputId: string;
}

export interface SavedEpisodeItem {
  episodeId: string;
  category: string;
  notes: string;
  savedAt: number;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  author: string;
  avatar: string;
  role: string;
  content: string;
  timestampFormatted: string;
  createdAt: number;
  mediaTimestampSeconds?: number;
  mediaTimestampFormatted?: string;
  isPrayerRequest?: boolean;
  isPinned?: boolean;
  isReported?: boolean;
  isHidden?: boolean;
  reactions: {
    amen: number;
    insight: number;
    fire: number;
    userReacted?: string[];
  };
}

export interface ListeningTrendDay {
  day: string;
  minutes: number;
  dateStr: string;
}

export interface ListeningStats {
  totalListeningSeconds: number;
  completedEpisodesCount: number;
  inProgressEpisodesCount: number;
  currentStreakDays: number;
  topCategories: { category: string; percentage: number; minutes: number }[];
  weeklyTrend: ListeningTrendDay[];
  mostPlayed: { episodeId: string; title: string; playCount: number; durationSeconds: number }[];
}

export interface SearchFilterState {
  query: string;
  searchInTranscript: boolean;
  speaker: string;
  dateRange: 'all' | '30days' | '90days' | '2026' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
  lengthRange: 'all' | 'under35' | '35to45' | 'over45';
  topic: string;
  network: string;
}
