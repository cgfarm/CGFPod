import React from 'react';
import {
  Sparkles,
  Compass,
  Play,
  Bookmark,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Check,
  Award,
  Zap,
  Tag
} from 'lucide-react';
import { Episode, ListeningStats } from '../types';
import { SyncService } from '../services/syncService';

interface RecommendedEpisodesViewProps {
  episodes: Episode[];
  stats: ListeningStats;
  savedIds: string[];
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenTranscriptModal: (episode: Episode) => void;
  onDataChanged: () => void;
}

interface RecommendationItem {
  episode: Episode;
  matchScore: number;
  reason: string;
  tag: string;
}

export const RecommendedEpisodesView: React.FC<RecommendedEpisodesViewProps> = ({
  episodes,
  stats,
  savedIds,
  onPlayEpisode,
  onOpenTranscriptModal,
  onDataChanged
}) => {
  // Derive recommendations based on listening pattern
  // If user likes Marketplace Strategy (Ep 48) and Spiritual Foundations (Ep 47), highlight relevant episodes
  const history = SyncService.getListeningHistory();

  const recommendations: RecommendationItem[] = [
    {
      episode: episodes.find(e => e.id === 'ep-46') || episodes[0],
      matchScore: 98,
      reason: "Direct sequel to Ep. 48 on marketplace influence and divine covenant strategy",
      tag: "Kingdom Enterprise"
    },
    {
      episode: episodes.find(e => e.id === 'ep-45') || episodes[1],
      matchScore: 95,
      reason: "Matches your deep interest in prophetic intelligence and AI technology disruption",
      tag: "Tech & Generations"
    },
    {
      episode: episodes.find(e => e.id === 'ep-44') || episodes[2],
      matchScore: 92,
      reason: "Recommended based on your daily 6:00 AM secret place prayer devotion habit",
      tag: "Spiritual Altar"
    },
    {
      episode: episodes.find(e => e.id === 'ep-43') || episodes[3],
      matchScore: 89,
      reason: "Trending #1 among Kingdom Entrepreneurs and CGF executive ambassadors",
      tag: "Strategic Leadership"
    }
  ].filter(item => Boolean(item.episode));

  const handleToggleSave = (epId: string) => {
    SyncService.toggleSavedEpisode(epId);
    onDataChanged();
  };

  return (
    <div id="recommended-episodes-view" className="space-y-6">
      {/* Personalized AI Curator Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 border border-amber-500/30 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-bold text-white font-display">
                Curated Recommendations For You
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
              Based on your <strong>{stats.currentStreakDays}-day streak</strong>, <strong>44% Marketplace Strategy</strong> study focus, and repeated engagement with Pastor David Olatunji's economic masterclasses.
            </p>
          </div>

          {/* Curated Pathway Pill */}
          <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1 self-start md:self-auto shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Recommended Study Pathway
            </span>
            <div className="text-xs font-semibold text-slate-200">
              The 3-Part Marketplace Transfer Series
            </div>
            <p className="text-[10px] text-slate-400">Ep. 48 ➔ Ep. 46 ➔ Ep. 43</p>
          </div>
        </div>
      </div>

      {/* Grid of Recommended Episodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map(({ episode: ep, matchScore, reason, tag }) => {
          const isSaved = savedIds.includes(ep.id);

          return (
            <div
              key={ep.id}
              id={`recommended-card-${ep.id}`}
              className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between group hover:shadow-xl"
            >
              <div className="space-y-3">
                {/* Recommendation Match Badge */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {matchScore}% Affinity Match
                  </span>

                  <span className="text-[11px] font-medium text-slate-400">
                    {tag}
                  </span>
                </div>

                {/* Cover & Main Info */}
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 group/img">
                    <img
                      src={ep.coverImage}
                      alt={ep.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                    />
                    <button
                      onClick={() => onPlayEpisode(ep, 0)}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover/img:opacity-100 transition-opacity cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                    </button>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="font-bold uppercase text-amber-400">Ep. {ep.episodeNumber}</span>
                      <span>•</span>
                      <span>{ep.series}</span>
                      <span>•</span>
                      <span className="font-mono">{ep.duration}</span>
                    </div>

                    <h4
                      onClick={() => onPlayEpisode(ep, 0)}
                      className="text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer"
                    >
                      {ep.title}
                    </h4>

                    <p className="text-xs text-slate-400 truncate">
                      Speaker: <strong className="text-slate-200">{ep.host}</strong>
                      {ep.guest && <span> ft. {ep.guest}</span>}
                    </p>
                  </div>
                </div>

                {/* Reason Explanation Box */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2">
                  <Compass className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{reason}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                <button
                  onClick={() => onOpenTranscriptModal(ep)}
                  className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Browse Transcript
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSave(ep.id)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                    }`}
                    title={isSaved ? 'Saved in Study Library' : 'Save Episode'}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onPlayEpisode(ep, 0)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Stream Now
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
