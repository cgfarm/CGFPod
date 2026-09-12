import React, { useState } from 'react';
import {
  Bookmark,
  Edit3,
  Save,
  Trash2,
  Play,
  Download,
  Share2,
  FolderPlus,
  Tag,
  Search,
  Check,
  X,
  FileText,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Episode, SavedEpisodeItem } from '../types';
import { SyncService } from '../services/syncService';

interface SavedEpisodesManagerProps {
  episodes: Episode[];
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenShare: (episode: Episode) => void;
  onDataChanged: () => void;
}

const PRESET_CATEGORIES = [
  'All',
  'Marketplace Strategy',
  'Personal Devotion',
  'Leadership & Governance',
  'Prayer Altar',
  'Tech & Generational'
];

export const SavedEpisodesManager: React.FC<SavedEpisodesManagerProps> = ({
  episodes,
  onPlayEpisode,
  onOpenShare,
  onDataChanged
}) => {
  const [savedMeta, setSavedMeta] = useState<Record<string, SavedEpisodeItem>>(SyncService.getSavedEpisodesMeta());
  const [offlineIds, setOfflineIds] = useState<string[]>(SyncService.getOfflineEpisodeIds());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Note editing state: episodeId -> note text
  const [editingEpId, setEditingEpId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<string>('');
  const [categoryDraft, setCategoryDraft] = useState<string>('');

  const refreshLocal = () => {
    setSavedMeta(SyncService.getSavedEpisodesMeta());
    setOfflineIds(SyncService.getOfflineEpisodeIds());
    onDataChanged();
  };

  const handleStartEditing = (epId: string) => {
    const existing = savedMeta[epId];
    setEditingEpId(epId);
    setNoteDraft(existing?.notes || '');
    setCategoryDraft(existing?.category || 'General Study');
  };

  const handleSaveEdit = (epId: string) => {
    SyncService.saveEpisodeWithMeta(epId, categoryDraft, noteDraft);
    setEditingEpId(null);
    refreshLocal();
  };

  const handleCancelEdit = () => {
    setEditingEpId(null);
    setNoteDraft('');
    setCategoryDraft('');
  };

  const handleRemoveBookmark = (epId: string) => {
    SyncService.removeSavedEpisode(epId);
    refreshLocal();
  };

  const handleToggleOffline = (epId: string) => {
    SyncService.toggleOfflineEpisode(epId);
    refreshLocal();
  };

  // Filter episodes that are saved in savedMeta
  const savedEpisodeList = episodes
    .filter(ep => Boolean(savedMeta[ep.id]))
    .map(ep => ({
      episode: ep,
      meta: savedMeta[ep.id]
    }));

  // Categories list with counts
  const categoryCounts: Record<string, number> = {
    All: savedEpisodeList.length
  };
  savedEpisodeList.forEach(item => {
    const cat = item.meta.category || 'General Study';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  // Filter by category and search
  const filteredList = savedEpisodeList.filter(({ episode, meta }) => {
    const matchesCat = selectedCategory === 'All' || meta.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      episode.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meta.notes && meta.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (meta.category && meta.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesSearch;
  });

  return (
    <div id="saved-episodes-manager" className="space-y-6">
      {/* Header with Search and Category Badges */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-400" />
              Saved Episodes & Personalized Study Library
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Organize bookmarked masterclasses by ministry track and attach your personal revelation notes
            </p>
          </div>

          {/* Search Saved Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="saved-episodes-search"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter notes, title, category..."
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar pt-2 border-t border-slate-800/80">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3 text-amber-400" /> Track:
          </span>
          {Object.keys(categoryCounts).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat ? 'bg-slate-950/20 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {categoryCounts[cat]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* List of Saved Items */}
      {filteredList.length === 0 ? (
        <div className="p-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 text-slate-400 space-y-3">
          <Bookmark className="w-8 h-8 text-amber-500 mx-auto opacity-40" />
          <h4 className="text-sm font-semibold text-slate-200">No saved episodes found</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {savedEpisodeList.length === 0
              ? 'Bookmark any episode in the main catalog to build your spiritual notebook and study collection.'
              : 'No saved episodes matched the selected category or search term.'}
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs text-amber-400 underline font-semibold cursor-pointer"
            >
              View all {savedEpisodeList.length} saved episodes
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map(({ episode: ep, meta }) => {
            const isEditing = editingEpId === ep.id;
            const isOffline = offlineIds.includes(ep.id);

            return (
              <div
                key={ep.id}
                id={`saved-episode-${ep.id}`}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
              >
                {/* Top Row: Episode Metadata + Action Buttons */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="font-bold text-amber-400 uppercase tracking-wider">
                          Ep. {ep.episodeNumber}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 font-mono">{ep.duration}</span>
                        <span className="text-slate-600">•</span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold border border-amber-500/30">
                          {meta.category || 'General Study'}
                        </span>
                        {meta.savedAt && (
                          <span className="text-slate-400 text-[10px] flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                            Saved {new Date(meta.savedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                        {ep.title}
                      </h4>

                      <p className="text-xs text-slate-400 truncate">
                        Speaker: <strong className="text-slate-300">{ep.host}</strong>
                        {ep.guest && <span> ft. {ep.guest}</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Play, Offline, Share, Remove */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => onPlayEpisode(ep, 0)}
                      className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Stream
                    </button>

                    <button
                      onClick={() => handleToggleOffline(ep.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border ${
                        isOffline
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                      }`}
                      title={isOffline ? 'Downloaded for offline listening' : 'Download offline'}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">{isOffline ? 'Offline Ready' : 'Download'}</span>
                    </button>

                    <button
                      onClick={() => onOpenShare(ep)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                      title="Share Episode"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleRemoveBookmark(ep.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 transition-colors cursor-pointer"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Bottom Row: Personal Notes & Category Management */}
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-3">
                  {isEditing ? (
                    /* Edit Note & Category Mode */
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                          <Edit3 className="w-3.5 h-3.5" /> Edit Study Notes & Category
                        </span>
                        {/* Category Selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Category:</span>
                          <select
                            value={categoryDraft}
                            onChange={e => setCategoryDraft(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="Marketplace Strategy">Marketplace Strategy</option>
                            <option value="Personal Devotion">Personal Devotion</option>
                            <option value="Leadership & Governance">Leadership & Governance</option>
                            <option value="Prayer Altar">Prayer Altar</option>
                            <option value="Tech & Generational">Tech & Generational</option>
                            <option value="General Study">General Study</option>
                          </select>
                        </div>
                      </div>

                      <textarea
                        value={noteDraft}
                        onChange={e => setNoteDraft(e.target.value)}
                        placeholder="Write your personal revelation, scriptures, action items, or prayer points..."
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={handleCancelEdit}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(ep.id)}
                          className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-amber-500/20"
                        >
                          <Save className="w-3.5 h-3.5" /> Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Note Mode */
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-xs font-bold text-slate-300">
                            Personal Study Notes & Revelations:
                          </span>
                        </div>
                        {meta.notes ? (
                          <p className="text-xs text-slate-200 leading-relaxed italic pl-5 whitespace-pre-wrap">
                            "{meta.notes}"
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 italic pl-5">
                            No study notes added yet. Record your key thoughts and scripture citations.
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleStartEditing(ep.id)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 hover:text-amber-300 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        {meta.notes ? 'Edit Notes' : 'Add Notes'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
