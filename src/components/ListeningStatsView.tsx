import React from 'react';
import {
  Clock,
  TrendingUp,
  Flame,
  CheckCircle2,
  Play,
  Award,
  Sparkles,
  BarChart3,
  Calendar,
  Compass,
  ArrowUpRight,
  Headphones
} from 'lucide-react';
import { Episode, ListeningStats } from '../types';

interface ListeningStatsViewProps {
  stats: ListeningStats;
  episodes: Episode[];
  onPlayEpisode: (episode: Episode, startAtSeconds?: number) => void;
  onOpenShare: (episode: Episode) => void;
}

export const ListeningStatsView: React.FC<ListeningStatsViewProps> = ({
  stats,
  episodes,
  onPlayEpisode,
  onOpenShare
}) => {
  const totalHours = (stats.totalListeningSeconds / 3600).toFixed(1);
  const totalMinutes = Math.round(stats.totalListeningSeconds / 60);

  // Maximum minutes for bar chart scaling
  const maxWeeklyMinutes = Math.max(...stats.weeklyListeningTrend.map(d => d.minutes), 100);

  return (
    <div id="listening-stats-view" className="space-y-6">
      {/* 4 Top KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Listening Time */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-amber-400">
            <Clock className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Lifetime
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {totalHours} <span className="text-sm font-sans font-medium text-slate-400">hrs</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {totalMinutes.toLocaleString()} minutes of kingdom wisdom
            </p>
          </div>
        </div>

        {/* Listening Streak */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-rose-400">
            <Flame className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              Daily Habit
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.currentStreakDays} <span className="text-sm font-sans font-medium text-slate-400">days</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Consistent daily devotional intake
            </p>
          </div>
        </div>

        {/* Completed Episodes */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Finished
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.completedEpisodesCount} <span className="text-sm font-sans font-medium text-slate-400">episodes</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Fully completed masterclasses
            </p>
          </div>
        </div>

        {/* In-Progress Studies */}
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-sky-400">
            <Headphones className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20">
              In Progress
            </span>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {stats.inProgressEpisodesCount} <span className="text-sm font-sans font-medium text-slate-400">active</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Ready to resume with saved timestamps
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Weekly Listening Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Trend Chart (7 cols) */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Listening Trends (Past 7 Days)
              </h3>
              <p className="text-xs text-slate-400">
                Daily audio and video devotional listening engagement in minutes
              </p>
            </div>
            <span className="text-xs font-mono text-amber-400 font-semibold px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30">
              Avg: 60m / day
            </span>
          </div>

          {/* Bar Visualization */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 sm:gap-4 px-2">
              {stats.weeklyListeningTrend.map(trend => {
                const heightPct = Math.round((trend.minutes / maxWeeklyMinutes) * 100);
                const isPeak = trend.minutes === Math.max(...stats.weeklyListeningTrend.map(d => d.minutes));

                return (
                  <div key={trend.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[11px] font-mono text-slate-400 group-hover:text-amber-400 font-semibold transition-colors">
                      {trend.minutes}m
                    </div>
                    <div className="w-full max-w-[38px] bg-slate-800 rounded-t-xl overflow-hidden flex items-end h-full">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isPeak
                            ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-lg shadow-amber-500/30'
                            : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-amber-600 group-hover:to-amber-400'
                        }`}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <div className="text-center">
                      <span className={`text-xs font-bold block ${isPeak ? 'text-amber-400' : 'text-slate-300'}`}>
                        {trend.day}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {trend.dateStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Peak Sabbath Study: Sunday (95 mins)
            </span>
            <span className="text-slate-400 font-medium">Weekly Goal: 420 mins (101% Met)</span>
          </div>
        </div>

        {/* Categories Distribution (5 cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-amber-400" />
              Kingdom Topic Distribution
            </h3>
            <p className="text-xs text-slate-400">
              Breakdown of spiritual wisdom categories explored
            </p>
          </div>

          <div className="space-y-3.5 my-auto">
            {stats.topCategories.map(cat => (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium truncate max-w-[220px]">
                    {cat.category}
                  </span>
                  <span className="font-mono text-amber-400 font-semibold">
                    {cat.percentage}% ({cat.minutes}m)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Your focus is predominantly in <strong>Marketplace Strategy</strong>. Suggested follow-up: Generational Legacy series.
            </span>
          </div>
        </div>
      </div>

      {/* Most Played Episodes Leaderboard */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Most Played & Re-studied Episodes
            </h3>
            <p className="text-xs text-slate-400">
              Episodes you have revisited most frequently for deeper apostolic meditation
            </p>
          </div>
          <span className="text-xs text-slate-400">
            Updated in real-time with playback engine
          </span>
        </div>

        <div className="space-y-3">
          {stats.mostPlayedEpisodes.map((item, idx) => {
            const ep = episodes.find(e => e.id === item.episodeId);
            if (!ep) return null;

            return (
              <div
                key={item.episodeId}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank Badge */}
                  <div className="w-7 h-7 rounded-xl bg-slate-800 text-amber-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    #{idx + 1}
                  </div>

                  <img
                    src={ep.coverImage}
                    alt={ep.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-amber-400">
                        Ep. {ep.episodeNumber}
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{ep.series}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 font-mono">{ep.duration}</span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                      {ep.title}
                    </h4>

                    <p className="text-xs text-slate-400 truncate">
                      Speaker: {ep.host} {ep.guest && `ft. ${ep.guest}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 font-mono font-bold text-xs border border-amber-500/30">
                      {item.playCount}x Streamed
                    </span>
                  </div>

                  <button
                    onClick={() => onPlayEpisode(ep, 0)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Replay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
