import { Episode, EpisodeComment, ListeningHistoryItem, ListeningStats, SavedEpisodeItem, SyncState, WebcastRecording } from '../types';

const SYNC_STATE_KEY = 'cgf_podcast_sync_state';
const HISTORY_KEY = 'cgf_podcast_history';
const SAVED_EPISODES_KEY = 'cgf_podcast_saved_ids';
const SAVED_META_KEY = 'cgf_podcast_saved_meta';
const OFFLINE_EPISODES_KEY = 'cgf_podcast_offline_ids';
const RECORDINGS_KEY = 'cgf_podcast_recordings';
const COMMENTS_KEY = 'cgf_podcast_comments';

export class SyncService {
  private static generateDeviceId(): string {
    return 'CGF-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  }

  private static generateSyncCode(): string {
    return 'SYNC-' + Math.floor(100000 + Math.random() * 900000);
  }

  public static getSyncState(): SyncState {
    const raw = localStorage.getItem(SYNC_STATE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const defaultState: SyncState = {
      lastSynced: Date.now() - 1000 * 60 * 3, // 3 mins ago
      syncCode: this.generateSyncCode(),
      deviceId: this.generateDeviceId(),
      deviceName: navigator.userAgent.includes('Mac') ? 'Mac Studio (Web)' : 'Studio Desktop (Web)',
      isSyncing: false,
      offlineEpisodesCount: 1,
      storageUsedMB: 48.5
    };
    localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(defaultState));
    return defaultState;
  }

  public static saveSyncState(state: SyncState) {
    localStorage.setItem(SYNC_STATE_KEY, JSON.stringify(state));
  }

  public static getListeningHistory(): Record<string, ListeningHistoryItem> {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    // Default initial mock history
    const initial: Record<string, ListeningHistoryItem> = {
      'ep-48': {
        episodeId: 'ep-48',
        lastPosition: 1450, // 24 mins in
        completed: false,
        updatedAt: Date.now() - 1000 * 60 * 18
      },
      'ep-47': {
        episodeId: 'ep-47',
        lastPosition: 2292, // finished
        completed: true,
        updatedAt: Date.now() - 1000 * 60 * 60 * 24
      },
      'ep-46': {
        episodeId: 'ep-46',
        lastPosition: 1800, // 30 mins in
        completed: false,
        updatedAt: Date.now() - 1000 * 60 * 60 * 48
      },
      'ep-44': {
        episodeId: 'ep-44',
        lastPosition: 2465, // finished
        completed: true,
        updatedAt: Date.now() - 1000 * 60 * 60 * 72
      }
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(initial));
    return initial;
  }

  public static updateListeningPosition(episodeId: string, positionSeconds: number, durationSeconds: number) {
    const history = this.getListeningHistory();
    const completed = positionSeconds >= (durationSeconds - 10);
    history[episodeId] = {
      episodeId,
      lastPosition: positionSeconds,
      completed,
      updatedAt: Date.now()
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }

  // SAVED EPISODES & NOTES
  public static getSavedEpisodesMeta(): Record<string, SavedEpisodeItem> {
    const raw = localStorage.getItem(SAVED_META_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const initialMeta: Record<string, SavedEpisodeItem> = {
      'ep-48': {
        episodeId: 'ep-48',
        category: 'Marketplace Strategy',
        notes: 'Covenant power to get wealth (Deut 8:18). Apply the 3 indicators in our Q4 team alignment: holy discontent, unusual divine problem-solving intelligence, and uncompromising integrity.',
        savedAt: Date.now() - 1000 * 60 * 60 * 36
      },
      'ep-47': {
        episodeId: 'ep-47',
        category: 'Personal Devotion',
        notes: 'Notice the word "dwells" in Psalm 91:1. Must protect the 6:00 AM sacred prayer altar before touching executive email notifications.',
        savedAt: Date.now() - 1000 * 60 * 60 * 72
      }
    };
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(initialMeta));
    return initialMeta;
  }

  public static getSavedEpisodeIds(): string[] {
    const meta = this.getSavedEpisodesMeta();
    return Object.keys(meta);
  }

  public static saveEpisodeWithMeta(episodeId: string, category: string, notes: string) {
    const meta = this.getSavedEpisodesMeta();
    meta[episodeId] = {
      episodeId,
      category: category || 'General Study',
      notes: notes || '',
      savedAt: Date.now()
    };
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(meta));
    localStorage.setItem(SAVED_EPISODES_KEY, JSON.stringify(Object.keys(meta)));
  }

  public static updateSavedEpisodeNote(episodeId: string, notes: string, category?: string) {
    const meta = this.getSavedEpisodesMeta();
    if (!meta[episodeId]) {
      meta[episodeId] = {
        episodeId,
        category: category || 'General Study',
        notes,
        savedAt: Date.now()
      };
    } else {
      meta[episodeId].notes = notes;
      if (category) meta[episodeId].category = category;
    }
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(meta));
    localStorage.setItem(SAVED_EPISODES_KEY, JSON.stringify(Object.keys(meta)));
  }

  public static toggleSavedEpisode(episodeId: string): boolean {
    const meta = this.getSavedEpisodesMeta();
    let isSaved = false;
    if (meta[episodeId]) {
      delete meta[episodeId];
      isSaved = false;
    } else {
      meta[episodeId] = {
        episodeId,
        category: 'General Study',
        notes: '',
        savedAt: Date.now()
      };
      isSaved = true;
    }
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(meta));
    localStorage.setItem(SAVED_EPISODES_KEY, JSON.stringify(Object.keys(meta)));
    return isSaved;
  }

  public static removeSavedEpisode(episodeId: string) {
    const meta = this.getSavedEpisodesMeta();
    delete meta[episodeId];
    localStorage.setItem(SAVED_META_KEY, JSON.stringify(meta));
    localStorage.setItem(SAVED_EPISODES_KEY, JSON.stringify(Object.keys(meta)));
  }

  public static getOfflineEpisodeIds(): string[] {
    const raw = localStorage.getItem(OFFLINE_EPISODES_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const initial = ['ep-48'];
    localStorage.setItem(OFFLINE_EPISODES_KEY, JSON.stringify(initial));
    return initial;
  }

  public static toggleOfflineEpisode(episodeId: string): boolean {
    const offline = this.getOfflineEpisodeIds();
    const index = offline.indexOf(episodeId);
    let isOffline = false;
    if (index >= 0) {
      offline.splice(index, 1);
      isOffline = false;
    } else {
      offline.unshift(episodeId);
      isOffline = true;
    }
    localStorage.setItem(OFFLINE_EPISODES_KEY, JSON.stringify(offline));
    
    // Update storage size
    const state = this.getSyncState();
    state.offlineEpisodesCount = offline.length;
    state.storageUsedMB = Math.round(offline.length * 48.5 * 10) / 10;
    this.saveSyncState(state);

    return isOffline;
  }

  // EPISODE COMMENTS & COMMUNITY FORUM
  public static getEpisodeComments(episodeId: string): EpisodeComment[] {
    const raw = localStorage.getItem(COMMENTS_KEY);
    let allComments: Record<string, EpisodeComment[]> = {};
    if (raw) {
      try {
        allComments = JSON.parse(raw);
      } catch {
        // fallback
      }
    }

    if (!allComments[episodeId]) {
      // Seed default authentic kingdom comments
      if (episodeId === 'ep-48') {
        allComments[episodeId] = [
          {
            id: 'comm-1',
            episodeId: 'ep-48',
            author: 'Elder Marcus Vance',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            role: 'Marketplace Elder',
            content: 'Deuteronomy 8:18 in real kingdom practice means structuring corporate capital allocation toward territorial transformation. We opened our community health clinic using this exact principle.',
            timestampFormatted: '2 hours ago',
            createdAt: Date.now() - 1000 * 60 * 120,
            mediaTimestampSeconds: 88,
            mediaTimestampFormatted: '01:28',
            isPinned: true,
            reactions: { amen: 42, insight: 29, fire: 18 }
          },
          {
            id: 'comm-2',
            episodeId: 'ep-48',
            author: 'Sis. Rachel Koroma',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            role: 'Disciple & Founder',
            content: 'At 02:10, Dr. Elijah said "Commercial hustle operates in anxiety, scarcity, and self-glorification. Kingdom empowerment operates from Sonship and divine rest." That statement completely delivered me from anxiety over our venture pitch.',
            timestampFormatted: '4 hours ago',
            createdAt: Date.now() - 1000 * 60 * 240,
            mediaTimestampSeconds: 130,
            mediaTimestampFormatted: '02:10',
            reactions: { amen: 35, insight: 22, fire: 19 }
          },
          {
            id: 'comm-3',
            episodeId: 'ep-48',
            author: 'Dr. Timothy S.',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
            role: 'Kingdom Ambassador',
            content: 'Brothers and sisters, please stand in agreement with our team in prayer. We have an ethical venture capital closing next Thursday for affordable water infrastructure.',
            timestampFormatted: '1 day ago',
            createdAt: Date.now() - 1000 * 60 * 60 * 24,
            isPrayerRequest: true,
            reactions: { amen: 68, insight: 12, fire: 25 }
          }
        ];
      } else if (episodeId === 'ep-47') {
        allComments[episodeId] = [
          {
            id: 'comm-4',
            episodeId: 'ep-47',
            author: 'Pastor Sarah O.',
            avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
            role: 'Pastor & Intercessor',
            content: 'Notice the word "dwells" in Psalm 91:1. It is not an occasional visit when trouble strikes; it is our habitual spiritual dwelling place. If our intake does not match our output, our exhaustion becomes false theology.',
            timestampFormatted: '3 hours ago',
            createdAt: Date.now() - 1000 * 60 * 180,
            mediaTimestampSeconds: 34,
            mediaTimestampFormatted: '00:34',
            isPinned: true,
            reactions: { amen: 51, insight: 38, fire: 24 }
          }
        ];
      } else {
        allComments[episodeId] = [
          {
            id: `comm-init-${episodeId}`,
            episodeId,
            author: 'Minister Caleb Joshua',
            avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
            role: 'Kingdom Disciple',
            content: 'This teaching anchored my faith this week. Glory to God for this apostolic release!',
            timestampFormatted: '1 day ago',
            createdAt: Date.now() - 1000 * 60 * 60 * 24,
            reactions: { amen: 18, insight: 9, fire: 7 }
          }
        ];
      }
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
    }

    return allComments[episodeId] || [];
  }

  public static addEpisodeComment(comment: EpisodeComment) {
    const raw = localStorage.getItem(COMMENTS_KEY);
    const allComments: Record<string, EpisodeComment[]> = raw ? JSON.parse(raw) : {};
    if (!allComments[comment.episodeId]) {
      allComments[comment.episodeId] = [];
    }
    allComments[comment.episodeId].unshift(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  }

  public static updateEpisodeComment(episodeId: string, commentId: string, updates: Partial<EpisodeComment>) {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return;
    const allComments: Record<string, EpisodeComment[]> = JSON.parse(raw);
    if (!allComments[episodeId]) return;
    
    allComments[episodeId] = allComments[episodeId].map(c => {
      if (c.id === commentId) {
        return { ...c, ...updates };
      }
      return c;
    });
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  }

  public static deleteEpisodeComment(episodeId: string, commentId: string) {
    const raw = localStorage.getItem(COMMENTS_KEY);
    if (!raw) return;
    const allComments: Record<string, EpisodeComment[]> = JSON.parse(raw);
    if (!allComments[episodeId]) return;
    allComments[episodeId] = allComments[episodeId].filter(c => c.id !== commentId);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(allComments));
  }

  // LISTENING STATISTICS CALCULATION
  public static getListeningStats(episodes: Episode[]): ListeningStats {
    const history = this.getListeningHistory();
    let totalSeconds = 0;
    let completedCount = 0;
    let inProgressCount = 0;

    const mostPlayedMap: Record<string, { playCount: number; duration: number }> = {
      'ep-48': { playCount: 4, duration: 2658 },
      'ep-47': { playCount: 3, duration: 2292 },
      'ep-46': { playCount: 2, duration: 2970 },
      'ep-44': { playCount: 2, duration: 2465 }
    };

    Object.values(history).forEach(item => {
      totalSeconds += item.lastPosition;
      if (item.completed) {
        completedCount++;
      } else if (item.lastPosition > 60) {
        inProgressCount++;
      }
    });

    // Base mock buffer for a realistic active account
    const totalListeningSeconds = Math.max(totalSeconds + 3600 * 21.5, 3600 * 24.8);

    // Top categories distribution
    const topCategories = [
      { category: 'Kingdom Enterprise & Marketplace', percentage: 44, minutes: Math.round((totalListeningSeconds / 60) * 0.44) },
      { category: 'Spiritual Foundations & Secret Place', percentage: 32, minutes: Math.round((totalListeningSeconds / 60) * 0.32) },
      { category: 'Generational Legacy & Tech', percentage: 16, minutes: Math.round((totalListeningSeconds / 60) * 0.16) },
      { category: 'City Revival & Intercession', percentage: 8, minutes: Math.round((totalListeningSeconds / 60) * 0.08) }
    ];

    // 7-day weekly trend activity (Monday through Sunday)
    const weeklyTrend = [
      { day: 'Mon', minutes: 45, dateStr: 'Sep 5' },
      { day: 'Tue', minutes: 62, dateStr: 'Sep 6' },
      { day: 'Wed', minutes: 38, dateStr: 'Sep 7' },
      { day: 'Thu', minutes: 54, dateStr: 'Sep 8' },
      { day: 'Fri', minutes: 48, dateStr: 'Sep 9' },
      { day: 'Sat', minutes: 82, dateStr: 'Sep 10' },
      { day: 'Sun', minutes: 95, dateStr: 'Sep 11' }
    ];

    const mostPlayed = Object.entries(mostPlayedMap).map(([epId, data]) => {
      const ep = episodes.find(e => e.id === epId);
      return {
        episodeId: epId,
        title: ep ? ep.title : `Episode ${epId}`,
        playCount: data.playCount,
        durationSeconds: data.duration
      };
    });

    return {
      totalListeningSeconds,
      completedEpisodesCount: Math.max(completedCount, 3),
      inProgressEpisodesCount: Math.max(inProgressCount, 2),
      currentStreakDays: 7,
      topCategories,
      weeklyTrend,
      mostPlayed
    };
  }

  public static getRecordings(): WebcastRecording[] {
    const raw = localStorage.getItem(RECORDINGS_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    const initial: WebcastRecording[] = [
      {
        id: 'rec-sample-1',
        title: 'Commentary on Marketplace Multiplication: Five Key Reflections',
        episodeTitle: 'The Anointing for Marketplace Multiplication & Spiritual Governance',
        episodeId: 'ep-48',
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
        durationSeconds: 195,
        mediaUrl: '',
        fileSize: '34.2 MB',
        backupStatus: 'backed_up',
        backupProgress: 100,
        cloudStorageUrl: 'https://storage.googleapis.com/cgf-podcasts-commentary/rec-sample-1.webm',
        virtualBackgroundUsed: 'CGF Kingdom Studio'
      }
    ];
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(initial));
    return initial;
  }

  public static saveRecording(recording: WebcastRecording) {
    const recordings = this.getRecordings();
    recordings.unshift(recording);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
  }

  public static updateRecordingBackup(id: string, updates: Partial<WebcastRecording>) {
    const recordings = this.getRecordings();
    const index = recordings.findIndex(r => r.id === id);
    if (index >= 0) {
      recordings[index] = { ...recordings[index], ...updates };
      localStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    }
  }

  public static exportSyncBundle(): string {
    const bundle = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      syncState: this.getSyncState(),
      history: this.getListeningHistory(),
      savedEpisodesMeta: this.getSavedEpisodesMeta(),
      offlineEpisodes: this.getOfflineEpisodeIds(),
      recordings: this.getRecordings()
    };
    return JSON.stringify(bundle, null, 2);
  }

  public static importSyncBundle(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.history) localStorage.setItem(HISTORY_KEY, JSON.stringify(data.history));
      if (data.savedEpisodesMeta) localStorage.setItem(SAVED_META_KEY, JSON.stringify(data.savedEpisodesMeta));
      if (data.offlineEpisodes) localStorage.setItem(OFFLINE_EPISODES_KEY, JSON.stringify(data.offlineEpisodes));
      if (data.recordings) localStorage.setItem(RECORDINGS_KEY, JSON.stringify(data.recordings));
      const current = this.getSyncState();
      current.lastSynced = Date.now();
      this.saveSyncState(current);
      return true;
    } catch {
      return false;
    }
  }
}
