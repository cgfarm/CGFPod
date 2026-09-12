import React, { useState } from 'react';
import { X, Rss, ExternalLink, Check, Headphones, Radio, Share2 } from 'lucide-react';

interface PodcastNetworksModalProps {
  isOpen: boolean;
  onClose: () => void;
  rssFeedUrl?: string;
}

export const PodcastNetworksModal: React.FC<PodcastNetworksModalProps> = ({
  isOpen,
  onClose,
  rssFeedUrl = 'https://feeds.cgfkingdomgrowth.org/podcast.rss'
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const networks = [
    {
      name: 'Apple Podcasts',
      desc: 'Listen on iPhone, iPad, Apple Watch & Mac',
      url: 'https://podcasts.apple.com/us/podcast/cgf-kingdom-growth/id1689000001',
      badge: 'Popular',
      iconBg: 'bg-purple-600/20 border-purple-500/30 text-purple-400'
    },
    {
      name: 'Spotify',
      desc: 'Stream audio and video episodes with auto-downloads',
      url: 'https://open.spotify.com/show/4x7y8cgfkingdomgrowth',
      badge: 'Video & Audio',
      iconBg: 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
    },
    {
      name: 'YouTube Music',
      desc: 'Watch full vodcasts and studio broadcasts',
      url: 'https://music.youtube.com/channel/UC-cgfkingdomgrowth',
      badge: 'Full Vodcasts',
      iconBg: 'bg-red-600/20 border-red-500/30 text-red-400'
    },
    {
      name: 'Amazon Music',
      desc: 'Hands-free listening with Alexa on Echo devices',
      url: 'https://music.amazon.com/podcasts/cgf-kingdom-growth',
      badge: 'Alexa Ready',
      iconBg: 'bg-sky-600/20 border-sky-500/30 text-sky-400'
    },
    {
      name: 'Overcast',
      desc: 'Smart speed, voice boost, and clip sharing on iOS',
      url: 'https://overcast.fm/itunes1689000001',
      badge: 'Audio Enthusiast',
      iconBg: 'bg-orange-600/20 border-orange-500/30 text-orange-400'
    },
    {
      name: 'Pocket Casts',
      desc: 'Cross-platform sync, trim silence, and wearable apps',
      url: 'https://pca.st/cgfkingdomgrowth',
      badge: 'Cross-Platform',
      iconBg: 'bg-rose-600/20 border-rose-500/30 text-rose-400'
    }
  ];

  const handleCopyRss = () => {
    navigator.clipboard.writeText(rssFeedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div id="podcast-networks-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Subscribe & Connect to Networks</h2>
              <p className="text-xs text-slate-400">Stream seamlessly across your favorite podcast applications</p>
            </div>
          </div>
          <button
            id="close-networks-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RSS Direct Feed Copy Box */}
        <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Rss className="w-4 h-4 text-amber-400" />
              Direct RSS Feed URL
            </span>
            <span className="text-[11px] text-slate-400">Universal Podcast Link</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="rss-feed-input"
              type="text"
              readOnly
              value={rssFeedUrl}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-300 focus:outline-none select-all"
            />
            <button
              id="copy-rss-feed-btn"
              onClick={handleCopyRss}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                copied
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  Copy RSS
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            Paste this URL into any podcast player (Castro, Downcast, AntennaPod, Podbean) to instantly subscribe.
          </p>
        </div>

        {/* Networks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {networks.map(net => (
            <a
              key={net.name}
              href={net.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-slate-600 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-sm text-slate-100 group-hover:text-amber-400 transition-colors">
                    {net.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700">
                    {net.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{net.desc}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-amber-400/90 font-medium group-hover:text-amber-300">
                <span className="flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" /> Open in App
                </span>
                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
            </a>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
