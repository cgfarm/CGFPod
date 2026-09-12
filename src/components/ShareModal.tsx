import React, { useState } from 'react';
import { X, Copy, Check, Share2, Code, Download, Sparkles, MessageCircle, Clock } from 'lucide-react';
import { Episode } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  episode: Episode | null;
  selectedQuote?: string;
  initialTimestamp?: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  episode,
  selectedQuote,
  initialTimestamp
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [activeTab, setActiveTab] = useState<'social' | 'quote' | 'embed'>('social');
  const [includeTimestamp, setIncludeTimestamp] = useState<boolean>(initialTimestamp !== undefined);
  const [timestampSeconds, setTimestampSeconds] = useState<number>(initialTimestamp || 0);

  const [cardQuote, setCardQuote] = useState<string>(
    selectedQuote ||
    (episode?.keyTakeaways?.[0] ?? 'Multiplication requires internal character calibration before external capital expansion.')
  );

  if (!isOpen) return null;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://cgfkingdomgrowth.org';
  const episodeParam = episode ? `ep=${episode.id}` : '';
  const timestampParam = includeTimestamp && timestampSeconds > 0 ? `&t=${Math.floor(timestampSeconds)}` : '';
  
  const queryParams = [episodeParam, timestampParam.replace('&', '')].filter(Boolean).join('&');
  const currentUrl = queryParams ? `${baseUrl}/?${queryParams}` : baseUrl;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const shareTitle = episode ? `${episode.title} - CGF Kingdom Growth Podcast` : 'CGF Kingdom Growth Podcasts';
  const timeNote = includeTimestamp && timestampSeconds > 0 ? ` at timestamp [${formatTime(timestampSeconds)}]` : '';
  const shareText = `Listening to "${shareTitle}"${timeNote}. Transforming nations through kingdom purpose and enterprise!`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const embedCode = `<iframe src="${currentUrl}" width="100%" height="220" frameborder="0" allow="autoplay; encrypted-media" title="${shareTitle}"></iframe>`;

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2000);
  };

  const shareLinks = [
    {
      name: 'WhatsApp',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} ${currentUrl}`)}`,
      color: 'hover:bg-emerald-600 hover:border-emerald-500',
      icon: MessageCircle
    },
    {
      name: 'X (Twitter)',
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-sky-600 hover:border-sky-500',
      icon: Share2
    },
    {
      name: 'LinkedIn',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-blue-600 hover:border-blue-500',
      icon: Share2
    },
    {
      name: 'Facebook',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
      color: 'hover:bg-indigo-600 hover:border-indigo-500',
      icon: Share2
    }
  ];

  return (
    <div id="share-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Share Kingdom Content</h2>
              <p className="text-xs text-slate-400">Amplify divine wisdom across your community & networks</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
          <button
            id="tab-social-btn"
            onClick={() => setActiveTab('social')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'social' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Social Networks
          </button>
          <button
            id="tab-quote-btn"
            onClick={() => setActiveTab('quote')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'quote' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quote Card
          </button>
          <button
            id="tab-embed-btn"
            onClick={() => setActiveTab('embed')}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'embed' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Embed Player
          </button>
        </div>

        {activeTab === 'social' && (
          <div className="space-y-4">
            {/* Episode Preview snippet */}
            {episode && (
              <div className="flex gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <img
                  src={episode.coverImage}
                  alt={episode.title}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                />
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                    Ep. {episode.episodeNumber} • {episode.series}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-100 truncate mt-0.5">{episode.title}</h4>
                  <p className="text-[11px] text-slate-400 truncate mt-1">Host: {episode.host}</p>
                </div>
              </div>
            )}

            {/* Quick Share Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              {shareLinks.map(s => (
                <a
                  key={s.name}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2.5 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-medium text-slate-200 transition-all ${s.color}`}
                >
                  <s.icon className="w-4 h-4 text-amber-400" />
                  <span>Share on {s.name}</span>
                </a>
              ))}
            </div>

            {/* Timestamp Sharing Control */}
            {episode && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-semibold text-slate-200">Share Specific Timestamp</span>
                  </div>
                  <button
                    id="toggle-timestamp-share-btn"
                    onClick={() => setIncludeTimestamp(!includeTimestamp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      includeTimestamp
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {includeTimestamp ? 'Timestamp Active' : 'Off'}
                  </button>
                </div>

                {includeTimestamp && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Jump time: <strong className="text-amber-400 font-mono">{formatTime(timestampSeconds)}</strong></span>
                      <span className="text-slate-500 font-mono text-[11px]">Total: {episode.duration}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={episode.durationSeconds}
                      value={timestampSeconds}
                      onChange={e => setTimestampSeconds(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <p className="text-[11px] text-slate-400">
                      Recipients who open this link will jump straight to minute {formatTime(timestampSeconds)} in the player!
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Copy Link Input */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-slate-400">Episode Direct URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                />
                <button
                  id="copy-direct-link-btn"
                  onClick={handleCopyLink}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 ${
                    copiedLink ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'quote' && (
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Customize Inspirational Quote</label>
              <textarea
                value={cardQuote}
                onChange={e => setCardQuote(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Visual Quote Card Preview */}
            <div
              id="quote-card-preview"
              className="relative p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border-2 border-amber-500/40 shadow-xl overflow-hidden space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 font-display">
                    CGF Kingdom Growth
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">Episode {episode?.episodeNumber || 48}</span>
              </div>

              <blockquote className="text-sm font-medium italic text-slate-100 leading-relaxed pl-3 border-l-2 border-amber-400">
                "{cardQuote}"
              </blockquote>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span>{episode?.host || 'Dr. Caleb Freeman'}</span>
                <span className="text-amber-400/80">#KingdomGrowth</span>
              </div>
            </div>

            <button
              id="download-quote-card-btn"
              onClick={() => {
                navigator.clipboard.writeText(`"${cardQuote}" — ${episode?.host || 'CGF Kingdom Growth'}`);
                setCopiedLink(true);
                setTimeout(() => setCopiedLink(false), 2000);
              }}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              Copy Quote Snippet for Social Media
            </button>
          </div>
        )}

        {activeTab === 'embed' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Embed the CGF Kingdom Growth player on your ministry blog, church website, or publication.
            </p>
            <div className="relative">
              <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {embedCode}
              </pre>
            </div>
            <button
              id="copy-embed-code-btn"
              onClick={handleCopyEmbed}
              className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                copiedEmbed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copiedEmbed ? <Check className="w-3.5 h-3.5" /> : <Code className="w-3.5 h-3.5" />}
              {copiedEmbed ? 'Embed Code Copied!' : 'Copy Embed Code'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
