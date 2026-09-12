import React, { useState, useEffect } from 'react';
import {
  Radio,
  Users,
  Eye,
  Globe2,
  TrendingUp,
  Heart,
  Send,
  Sparkles,
  Flame,
  X,
  Volume2,
  VolumeX,
  Share2
} from 'lucide-react';
import { INITIAL_LIVE_STATS, INITIAL_LIVE_COMMENTS } from '../data/episodesData';
import { LiveComment } from '../types';

interface LiveBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare: () => void;
}

export const LiveBroadcastModal: React.FC<LiveBroadcastModalProps> = ({
  isOpen,
  onClose,
  onOpenShare
}) => {
  const [stats, setStats] = useState(INITIAL_LIVE_STATS);
  const [comments, setComments] = useState<LiveComment[]>(INITIAL_LIVE_COMMENTS);
  const [inputMessage, setInputMessage] = useState('');
  const [isPrayerRequest, setIsPrayerRequest] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [reactions, setReactions] = useState<{ id: number; icon: string; x: number }[]>([]);

  // Organic viewer fluctuations
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setStats(prev => {
        const delta = Math.floor(Math.random() * 11) - 4; // -4 to +6
        const nextViewers = Math.max(2800, prev.currentViewers + delta);
        return {
          ...prev,
          currentViewers: nextViewers,
          peakViewers: Math.max(prev.peakViewers, nextViewers)
        };
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newComment: LiveComment = {
      id: 'c-' + Date.now(),
      author: 'You (Kingdom Partner)',
      location: 'Live Stream',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80',
      message: inputMessage.trim(),
      timestamp: 'Just now',
      isPrayerRequest,
      reactionCount: 1
    };

    setComments(prev => [newComment, ...prev]);
    setInputMessage('');
    setIsPrayerRequest(false);
  };

  const triggerReaction = (icon: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      icon,
      x: 30 + Math.random() * 60
    };
    setReactions(prev => [...prev.slice(-10), newReaction]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id));
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div id="live-broadcast-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-5xl w-full p-4 sm:p-6 shadow-2xl space-y-5 text-slate-100 my-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Radio className="w-5 h-5 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold text-[10px] tracking-wider uppercase animate-pulse">
                  ON AIR LIVE
                </span>
                <h2 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {stats.streamTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-400">Hosted by {stats.streamHost} • Started {stats.startedAt}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShare}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs"
            >
              <Share2 className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Invite</span>
            </button>
            <button
              id="close-live-broadcast-btn"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Broadcast Statistics Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold text-slate-100 font-mono">
                  {stats.currentViewers.toLocaleString()}
                </span>
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              </div>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Current Live Viewers</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 font-mono">
                {stats.peakViewers.toLocaleString()}
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Peak Viewers</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
              <Globe2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 font-mono">
                {stats.countriesCount} Nations
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Global Reach</p>
            </div>
          </div>

          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-100 font-mono">
                {stats.engagementRate}
              </span>
              <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Engagement Rate</p>
            </div>
          </div>
        </div>

        {/* Video Stage & Chat Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Live Stream Stage */}
          <div className="lg:col-span-8 space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-slate-700 shadow-2xl group">
              {/* Simulated Live Broadcast Video Feed */}
              <video
                src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
                autoPlay
                loop
                playsInline
                muted={isMuted}
                className="w-full h-full object-cover"
              />

              {/* Floating animated reactions */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {reactions.map(r => (
                  <div
                    key={r.id}
                    style={{ left: `${r.x}%` }}
                    className="absolute bottom-6 text-2xl animate-bounce duration-1000 opacity-90 select-none"
                  >
                    {r.icon}
                  </div>
                ))}
              </div>

              {/* Live Tag overlay */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="bg-rose-600/95 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  LIVE BROADCAST
                </span>
                <span className="bg-slate-900/80 backdrop-blur text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                  {stats.currentViewers.toLocaleString()} watching
                </span>
              </div>

              {/* Mute Control */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur border border-slate-700 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Praise Reaction Bar */}
            <div className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-2xl">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Live Praise Reactions:
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerReaction('🙏')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-all active:scale-95 flex items-center gap-1"
                >
                  🙏 Amen
                </button>
                <button
                  onClick={() => triggerReaction('🔥')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-all active:scale-95 flex items-center gap-1 text-amber-400"
                >
                  🔥 Fire
                </button>
                <button
                  onClick={() => triggerReaction('❤️')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-all active:scale-95 flex items-center gap-1 text-rose-400"
                >
                  ❤️ Love
                </button>
                <button
                  onClick={() => triggerReaction('👑')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium transition-all active:scale-95 flex items-center gap-1 text-yellow-400"
                >
                  👑 Kingdom
                </button>
              </div>
            </div>

            {/* Global Regions Breakdown */}
            <div className="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5 text-sky-400" />
                  Top Viewer Regions in Real-Time
                </span>
                <span className="text-slate-400 font-mono">Live Analytics</span>
              </div>
              <div className="space-y-2">
                {stats.topRegions.map(reg => {
                  const pct = Math.round((reg.viewers / stats.currentViewers) * 100);
                  return (
                    <div key={reg.region} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <span>{reg.flag}</span>
                          <span>{reg.region}</span>
                        </span>
                        <span className="font-mono text-slate-400">
                          {reg.viewers.toLocaleString()} viewers ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-sky-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Live Chat & Prayer Requests */}
          <div className="lg:col-span-4 flex flex-col h-[520px] bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-3.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-amber-400" />
                Live Community & Prayers
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Connected
              </span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3 divide-y divide-slate-800/40">
              {comments.map(c => (
                <div key={c.id} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-200">{c.author}</span>
                    <span className="text-slate-500">{c.timestamp}</span>
                  </div>
                  {c.isPrayerRequest && (
                    <span className="inline-block text-[9px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-1.5 py-0.5 rounded mb-0.5">
                      🙏 Prayer Request
                    </span>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed">{c.message}</p>
                </div>
              ))}
            </div>

            {/* Input box */}
            <form onSubmit={handleSendMessage} className="p-3 bg-slate-900/90 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPrayerRequest}
                    onChange={e => setIsPrayerRequest(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-800 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Tag as Prayer Request</span>
                </label>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  placeholder={isPrayerRequest ? 'Post a prayer request...' : 'Share a reflection or amen...'}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
