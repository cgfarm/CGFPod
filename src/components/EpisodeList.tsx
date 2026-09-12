import React, { useState, useMemo } from 'react';
import {
  Play,
  Video,
  Headphones,
  Search,
  Bookmark,
  Share2,
  Download,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Radio,
  Clock,
  ExternalLink,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpDown,
  Quote,
  User
} from 'lucide-react';
import { Episode, SearchFilterState } from '../types';
import { SyncService } from '../services/syncService';
import { AdvancedSearchFilter } from './AdvancedSearchFilter';

interface EpisodeListProps {
  episodes: Episode[];
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenTranscriptModal: (episode: Episode) => void;
  onOpenShare: (episode: Episode, quoteText?: string, timestamp?: number) => void;
  onOpenNetworks: () => void;
  currentPlayingId?: string;
  isOfflineMode: boolean;
}

export const EpisodeList: React.FC<EpisodeListProps> = ({
  episodes,
  onPlayEpisode,
  onOpenTranscriptModal,
  onOpenShare,
  onOpenNetworks,
  currentPlayingId,
  isOfflineMode
}) => {
  const [filterState, setFilterState] = useState<SearchFilterState>({
    query: '',
    searchInTranscript: false,
    speaker: '',
    dateRange: 'all',
    lengthRange: 'all',
    topic: '',
    network: ''
  });

  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [mediaFilter, setMediaFilter] = useState<'all' | 'video' | 'audio'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'longest' | 'shortest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [savedIds, setSavedIds] = useState<string[]>(SyncService.getSavedEpisodeIds());
  const [offlineIds, setOfflineIds] = useState<string[]>(SyncService.getOfflineEpisodeIds());

  // Extract all unique tags, speakers, topics, and networks
  const allTags = useMemo(() => ['All', ...Array.from(new Set(episodes.flatMap(e => e.tags)))], [episodes]);

  const availableSpeakers = useMemo(() => {
    const speakers = new Set<string>();
    episodes.forEach(e => {
      if (e.host) speakers.add(e.host);
      if (e.guest) {
        e.guest.split('&').forEach(g => speakers.add(g.trim()));
      }
    });
    return Array.from(speakers);
  }, [episodes]);

  const availableTopics = useMemo(() => {
    return Array.from(new Set(episodes.map(e => e.series)));
  }, [episodes]);

  const availableNetworks = useMemo(() => {
    const nets = new Set<string>();
    const networkNameMap: Record<string, string> = {
      applePodcasts: 'Apple Podcasts',
      spotify: 'Spotify',
      youtubeMusic: 'YouTube Music',
      amazonMusic: 'Amazon Music',
      overcast: 'Overcast',
      pocketCasts: 'Pocket Casts',
      rssFeed: 'RSS Feed'
    };
    episodes.forEach(e => {
      if (e.networkLinks && typeof e.networkLinks === 'object') {
        Object.entries(e.networkLinks).forEach(([key, url]) => {
          if (url) {
            const displayName = networkNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim();
            nets.add(displayName);
          }
        });
      }
    });
    return Array.from(nets);
  }, [episodes]);

  // Filtering Logic
  const filteredAndSortedEpisodes = useMemo(() => {
    const queryLower = filterState.query.trim().toLowerCase();
    const networkNameMap: Record<string, string> = {
      applePodcasts: 'Apple Podcasts',
      spotify: 'Spotify',
      youtubeMusic: 'YouTube Music',
      amazonMusic: 'Amazon Music',
      overcast: 'Overcast',
      pocketCasts: 'Pocket Casts',
      rssFeed: 'RSS Feed'
    };

    const filtered = episodes.filter(ep => {
      // 1. Tag & Media & Offline
      const matchesTag = selectedTag === 'All' || ep.tags.includes(selectedTag);
      const matchesMedia = mediaFilter === 'all' || ep.type === mediaFilter;
      const matchesOffline = !isOfflineMode || offlineIds.includes(ep.id);
      if (!matchesTag || !matchesMedia || !matchesOffline) return false;

      // 2. Speaker Filter
      if (filterState.speaker) {
        const matchesSpeaker =
          ep.host.toLowerCase().includes(filterState.speaker.toLowerCase()) ||
          (ep.guest && ep.guest.toLowerCase().includes(filterState.speaker.toLowerCase()));
        if (!matchesSpeaker) return false;
      }

      // 3. Topic Filter
      if (filterState.topic && ep.series !== filterState.topic) {
        return false;
      }

      // 4. Length Filter
      if (filterState.lengthRange === 'under35' && ep.durationSeconds >= 35 * 60) return false;
      if (
        filterState.lengthRange === '35to45' &&
        (ep.durationSeconds < 35 * 60 || ep.durationSeconds > 45 * 60)
      )
        return false;
      if (filterState.lengthRange === 'over45' && ep.durationSeconds <= 45 * 60) return false;

      // 5. Network Filter
      if (filterState.network) {
        if (!ep.networkLinks || typeof ep.networkLinks !== 'object') return false;
        const target = filterState.network.toLowerCase();
        const hasNetwork = Object.entries(ep.networkLinks).some(([key, url]) => {
          if (!url) return false;
          const displayName = (networkNameMap[key] || key.replace(/([A-Z])/g, ' $1').trim()).toLowerCase();
          return displayName === target || key.toLowerCase() === target;
        });
        if (!hasNetwork) return false;
      }

      // 6. Date Range Filter
      const epDate = new Date(ep.releaseDate);
      const now = new Date();
      if (filterState.dateRange === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 1000 * 60);
        if (epDate < thirtyDaysAgo) return false;
      } else if (filterState.dateRange === '90days') {
        const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 1000 * 60);
        if (epDate < ninetyDaysAgo) return false;
      } else if (filterState.dateRange === '2026') {
        if (!ep.releaseDate.startsWith('2026')) return false;
      } else if (filterState.dateRange === 'custom') {
        if (filterState.customStartDate && ep.releaseDate < filterState.customStartDate) return false;
        if (filterState.customEndDate && ep.releaseDate > filterState.customEndDate) return false;
      }

      // 7. Search Query (Title, Host, Guest, Description, or Transcript)
      if (queryLower) {
        const matchesBase =
          ep.title.toLowerCase().includes(queryLower) ||
          ep.description.toLowerCase().includes(queryLower) ||
          ep.host.toLowerCase().includes(queryLower) ||
          (ep.guest && ep.guest.toLowerCase().includes(queryLower)) ||
          ep.tags.some(t => t.toLowerCase().includes(queryLower));

        if (matchesBase) return true;

        if (filterState.searchInTranscript) {
          const matchesTranscript = ep.transcript.some(seg =>
            seg.text.toLowerCase().includes(queryLower)
          );
          if (matchesTranscript) return true;
        }

        return false;
      }

      return true;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      if (sortBy === 'oldest') return new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime();
      if (sortBy === 'longest') return b.durationSeconds - a.durationSeconds;
      if (sortBy === 'shortest') return a.durationSeconds - b.durationSeconds;
      return 0;
    });
  }, [episodes, filterState, selectedTag, mediaFilter, isOfflineMode, offlineIds, sortBy]);

  const featuredEpisode = episodes.find(e => e.featured) || episodes[0];

  const handleToggleSave = (epId: string) => {
    SyncService.toggleSavedEpisode(epId);
    setSavedIds(SyncService.getSavedEpisodeIds());
  };

  const handleToggleOffline = (epId: string) => {
    SyncService.toggleOfflineEpisode(epId);
    setOfflineIds(SyncService.getOfflineEpisodeIds());
  };

  const handleResetFilters = () => {
    setFilterState({
      query: '',
      searchInTranscript: false,
      speaker: '',
      dateRange: 'all',
      lengthRange: 'all',
      topic: '',
      network: ''
    });
    setSelectedTag('All');
    setMediaFilter('all');
  };

  const getMatchingTranscriptSnippet = (ep: Episode, query: string) => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    return ep.transcript.find(seg => seg.text.toLowerCase().includes(q)) || null;
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="episode-list-container" className="space-y-8 max-w-7xl mx-auto">
      {/* FEATURED HERO BANNER */}
      {featuredEpisode && !isOfflineMode && (
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800/90 shadow-2xl">
          <div className="absolute inset-0">
            <img
              src={featuredEpisode.coverImage}
              alt={featuredEpisode.title}
              className="w-full h-full object-cover opacity-20 filter blur-sm scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
          </div>

          <div className="relative z-10 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-extrabold text-[11px] uppercase tracking-wider">
                  Featured Masterclass
                </span>
                <span className="text-xs text-amber-400 font-mono font-semibold">
                  Episode {featuredEpisode.episodeNumber} • {featuredEpisode.duration}
                </span>
                {featuredEpisode.type === 'video' && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <Video className="w-3 h-3" /> Full Vodcast
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-white font-display leading-tight">
                {featuredEpisode.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {featuredEpisode.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button
                  id="hero-play-btn"
                  onClick={() => onPlayEpisode(featuredEpisode)}
                  className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 active:scale-95 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Stream Episode
                </button>

                <button
                  id="hero-transcript-btn"
                  onClick={() => onOpenTranscriptModal(featuredEpisode)}
                  className="px-4 py-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  Browse Transcript
                </button>

                <button
                  onClick={() => onOpenShare(featuredEpisode)}
                  className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-colors"
                  title="Share episode"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Artwork thumbnail */}
            <div className="hidden md:block relative shrink-0">
              <img
                src={featuredEpisode.coverImage}
                alt={featuredEpisode.title}
                className="w-56 h-56 rounded-2xl object-cover shadow-2xl border-2 border-amber-500/30"
              />
              <div className="absolute -bottom-3 -right-3 bg-slate-950/90 backdrop-blur px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300 font-mono">
                {featuredEpisode.series}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADVANCED SEARCH AND FILTER CONTROLS */}
      <AdvancedSearchFilter
        filterState={filterState}
        onChange={setFilterState}
        onReset={handleResetFilters}
        availableSpeakers={availableSpeakers}
        availableTopics={availableTopics}
        availableNetworks={availableNetworks}
        totalResultsCount={filteredAndSortedEpisodes.length}
      />

      {/* SECONDARY TOOLBAR: Format Selector, View Mode, Sort, and Tags */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Media Format Filter (All, Video, Audio) */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl text-xs">
            <button
              onClick={() => setMediaFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                mediaFilter === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Formats
            </button>
            <button
              onClick={() => setMediaFilter('video')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                mediaFilter === 'video' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Video className="w-3.5 h-3.5" /> Video
            </button>
            <button
              onClick={() => setMediaFilter('audio')}
              className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all ${
                mediaFilter === 'audio' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" /> Audio
            </button>
          </div>

          {/* Sort & View Mode Toggles */}
          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-2xl text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 text-[11px]">Sort:</span>
              <select
                id="sort-episodes-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer font-medium"
              >
                <option value="newest" className="bg-slate-900">Newest Releases</option>
                <option value="oldest" className="bg-slate-900">Oldest Releases</option>
                <option value="longest" className="bg-slate-900">Longest Duration</option>
                <option value="shortest" className="bg-slate-900">Shortest Duration</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs List) */}
            <div className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
              <button
                id="view-mode-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'grid' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                id="view-mode-list-btn"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === 'list' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                }`}
                title="Detailed List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tags Scroll Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* EPISODE RESULTS DISPLAY */}
      {filteredAndSortedEpisodes.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 space-y-4">
          <Sparkles className="w-9 h-9 text-amber-500 mx-auto opacity-50" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-200">No episodes matched your search criteria</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Try adjusting your speaker selection, keywords, date range, or toggle transcript search.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedEpisodes.map(ep => {
            const isPlayingThis = currentPlayingId === ep.id;
            const isSaved = savedIds.includes(ep.id);
            const isOffline = offlineIds.includes(ep.id);
            const transcriptSnippet = filterState.query
              ? getMatchingTranscriptSnippet(ep, filterState.query)
              : null;

            return (
              <div
                key={ep.id}
                id={`episode-card-${ep.id}`}
                className={`flex flex-col justify-between rounded-3xl bg-slate-900/80 border transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 overflow-hidden ${
                  isPlayingThis
                    ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-amber-500/10'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Cover Header with Play overlay */}
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-950 group">
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => onPlayEpisode(ep)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-full bg-amber-500 group-hover:scale-110 text-slate-950 flex items-center justify-center transition-transform shadow-xl">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </button>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-950/90 text-amber-400 border border-slate-700 backdrop-blur">
                        Ep. {ep.episodeNumber}
                      </span>
                      {ep.type === 'video' && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-600/90 text-white backdrop-blur flex items-center gap-1">
                          <Video className="w-2.5 h-2.5" /> Video
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950/90 text-slate-200 border border-slate-800 backdrop-blur flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      {ep.duration}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-amber-400/90 truncate">
                        {ep.series}
                      </span>
                      <span className="font-mono text-slate-500 shrink-0">
                        {new Date(ep.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-400 transition-colors">
                        {ep.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" />
                        <span>{ep.host}</span>
                        {ep.guest && <span className="text-slate-500">ft. {ep.guest}</span>}
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {ep.description}
                    </p>

                    {/* Matched Transcript Snippet Banner */}
                    {transcriptSnippet && (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5 animate-fadeIn">
                        <div className="flex items-center justify-between text-[10px] font-bold text-amber-400">
                          <span className="flex items-center gap-1">
                            <Quote className="w-2.5 h-2.5" /> Spoken Match ({transcriptSnippet.speaker})
                          </span>
                          <button
                            onClick={() => onPlayEpisode(ep, transcriptSnippet.timestamp)}
                            className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 flex items-center gap-1 cursor-pointer"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            Jump to {formatSeconds(transcriptSnippet.timestamp)}
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-200 italic line-clamp-2">
                          "{transcriptSnippet.text}"
                        </p>
                      </div>
                    )}

                    {/* Key Takeaway Highlight (if no transcript snippet) */}
                    {!transcriptSnippet && ep.keyTakeaways?.[0] && (
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2 italic">{ep.keyTakeaways[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="p-5 pt-0 border-t border-slate-800/60 mt-2 space-y-3">
                  <div className="flex items-center justify-between pt-3">
                    <button
                      onClick={() => onOpenTranscriptModal(ep)}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" /> Transcript & Notes
                    </button>

                    <div className="flex items-center gap-1.5">
                      {/* Bookmark Save Button */}
                      <button
                        onClick={() => handleToggleSave(ep.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isSaved
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isSaved ? 'Bookmarked' : 'Save Episode'}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                      </button>

                      {/* Download Offline Button */}
                      <button
                        onClick={() => handleToggleOffline(ep.id)}
                        className={`p-2 rounded-xl transition-all cursor-pointer ${
                          isOffline
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white'
                        }`}
                        title={isOffline ? 'Offline Ready' : 'Download for Offline Mode'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {/* Share Button */}
                      <button
                        onClick={() => onOpenShare(ep)}
                        className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        title="Share Episode"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* DETAILED LIST VIEW */
        <div className="space-y-4">
          {filteredAndSortedEpisodes.map(ep => {
            const isPlayingThis = currentPlayingId === ep.id;
            const isSaved = savedIds.includes(ep.id);
            const isOffline = offlineIds.includes(ep.id);
            const transcriptSnippet = filterState.query
              ? getMatchingTranscriptSnippet(ep, filterState.query)
              : null;

            return (
              <div
                key={ep.id}
                id={`episode-list-item-${ep.id}`}
                className={`p-5 rounded-3xl bg-slate-900/80 border transition-all ${
                  isPlayingThis
                    ? 'border-amber-500/80 ring-2 ring-amber-500/20 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail & Play */}
                    <div className="relative w-28 h-28 rounded-2xl overflow-hidden shrink-0 group">
                      <img
                        src={ep.coverImage}
                        alt={ep.title}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => onPlayEpisode(ep)}
                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </button>
                    </div>

                    {/* Metadata & Title */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="font-bold text-amber-400 uppercase tracking-wider">
                          Ep. {ep.episodeNumber}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300 font-medium">{ep.series}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 font-mono">{ep.duration}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">
                          {new Date(ep.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      <h3
                        onClick={() => onPlayEpisode(ep)}
                        className="text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer transition-colors"
                      >
                        {ep.title}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Speaker: <strong className="text-slate-200">{ep.host}</strong>
                        {ep.guest && <span> ft. {ep.guest}</span>}
                      </p>

                      <p className="text-xs text-slate-300 line-clamp-2 max-w-3xl leading-relaxed">
                        {ep.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions Right Side */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => onPlayEpisode(ep)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Play
                    </button>

                    <button
                      onClick={() => onOpenTranscriptModal(ep)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1 border border-slate-700 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                      Details
                    </button>

                    <button
                      onClick={() => handleToggleSave(ep.id)}
                      className={`p-2 rounded-xl transition-all cursor-pointer ${
                        isSaved ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                      title={isSaved ? 'Saved' : 'Save'}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onOpenShare(ep)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Spoken Transcript Match in List View */}
                {transcriptSnippet && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Quote className="w-4 h-4 text-amber-400 shrink-0" />
                      <p className="text-xs text-slate-200 italic truncate">
                        "{transcriptSnippet.text}"
                      </p>
                    </div>
                    <button
                      onClick={() => onPlayEpisode(ep, transcriptSnippet.timestamp)}
                      className="px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Play from {formatSeconds(transcriptSnippet.timestamp)}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
