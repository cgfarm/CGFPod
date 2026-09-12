import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  BookOpen,
  Sparkles,
  Share2,
  Bookmark,
  Download,
  Headphones,
  Video,
  Clock,
  ExternalLink,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Episode } from '../types';
import { TranscriptBrowser } from './TranscriptBrowser';
import { EpisodeComments } from './EpisodeComments';
import { SyncService } from '../services/syncService';

interface EpisodeDetailsModalProps {
  episode: Episode | null;
  isOpen: boolean;
  onClose: () => void;
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenShare: (episode: Episode, quoteText?: string, timestamp?: number) => void;
  onOpenNetworks: () => void;
  currentTime: number;
}

export const EpisodeDetailsModal: React.FC<EpisodeDetailsModalProps> = ({
  episode,
  isOpen,
  onClose,
  onPlayEpisode,
  onOpenShare,
  onOpenNetworks,
  currentTime
}) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'comments' | 'takeaways' | 'scriptures' | 'networks'>('transcript');
  const [isSaved, setIsSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);

  useEffect(() => {
    if (episode) {
      const saved = SyncService.getSavedEpisodeIds().includes(episode.id);
      setIsSaved(saved);
      const comments = SyncService.getEpisodeComments(episode.id);
      setCommentsCount(comments.length);
    }
  }, [episode, isOpen]);

  if (!isOpen || !episode) return null;

  const handleToggleSave = () => {
    const saved = SyncService.toggleSavedEpisode(episode.id);
    setIsSaved(saved);
  };

  const handleSeekAndPlay = (seconds: number) => {
    onPlayEpisode(episode, seconds);
  };

  return (
    <div id="episode-details-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-6 text-slate-100 max-h-[92vh] overflow-y-auto my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
              Ep. {episode.episodeNumber} • {episode.series}
            </span>
            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Duration: {episode.duration}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenShare(episode)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              id="close-episode-details-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Episode Header & Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-5 p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
          <img
            src={episode.coverImage}
            alt={episode.title}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-slate-700 shrink-0 shadow-lg"
          />
          <div className="flex-1 min-w-0 space-y-2">
            <h2 className="text-lg sm:text-xl font-bold text-white font-display leading-snug">
              {episode.title}
            </h2>
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {episode.description}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span>Host: <strong className="text-slate-200">{episode.host}</strong></span>
              {episode.guest && <span>• Guest: <strong className="text-amber-400">{episode.guest}</strong></span>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => onPlayEpisode(episode)}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Play Episode
            </button>
            <button
              onClick={handleToggleSave}
              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all ${
                isSaved ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
              title="Bookmark episode"
            >
              <Bookmark className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2 text-xs">
          <button
            id="tab-modal-transcript-btn"
            onClick={() => setActiveTab('transcript')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'transcript'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Transcript ({episode.transcript.length})
          </button>

          <button
            id="tab-modal-comments-btn"
            onClick={() => setActiveTab('comments')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'comments'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Community Discussion ({commentsCount})
          </button>

          <button
            id="tab-modal-takeaways-btn"
            onClick={() => setActiveTab('takeaways')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'takeaways'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Key Takeaways ({episode.keyTakeaways.length})
          </button>

          <button
            id="tab-modal-scriptures-btn"
            onClick={() => setActiveTab('scriptures')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'scriptures'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Scriptures ({episode.scriptureReferences.length})
          </button>

          <button
            id="tab-modal-networks-btn"
            onClick={() => setActiveTab('networks')}
            className={`px-3.5 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'networks'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            Networks
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'transcript' && (
          <div className="h-[480px]">
            <TranscriptBrowser
              transcript={episode.transcript}
              currentTime={currentTime}
              onSeek={handleSeekAndPlay}
              onShareQuote={quote => onOpenShare(episode, quote)}
              scriptureReferences={episode.scriptureReferences}
            />
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="max-h-[500px] overflow-y-auto pr-1">
            <EpisodeComments
              episode={episode}
              currentTime={currentTime}
              onSeek={handleSeekAndPlay}
              onOpenShareTimestamp={(seconds, quote) => onOpenShare(episode, quote, seconds)}
            />
          </div>
        )}


        {activeTab === 'takeaways' && (
          <div className="space-y-4 p-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Apostolic Principles & Core Insights
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {episode.keyTakeaways.map((point, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-mono">
                      {index + 1}
                    </span>
                    <span>Principle {index + 1}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'scriptures' && (
          <div className="space-y-4 p-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Scripture References Grounding this Episode
            </h3>
            <div className="space-y-3">
              {episode.scriptureReferences.map((ref, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 space-y-2"
                >
                  <span className="font-mono text-xs font-bold text-amber-400">
                    {ref.reference}
                  </span>
                  <blockquote className="text-xs italic text-slate-200 pl-3 border-l-2 border-amber-500">
                    "{ref.text}"
                  </blockquote>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'networks' && (
          <div className="space-y-4 p-2">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Listen to Ep. {episode.episodeNumber} on All Podcast Apps
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(episode.networkLinks).map(([network, url]) => (
                <a
                  key={network}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between text-xs text-slate-200 hover:text-amber-400 transition-all"
                >
                  <span className="capitalize font-semibold">{network.replace(/([A-Z])/g, ' $1')}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
