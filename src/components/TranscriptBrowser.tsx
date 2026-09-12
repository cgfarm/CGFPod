import React, { useState } from 'react';
import { Search, Play, Copy, Check, Share2, BookOpen, Sparkles } from 'lucide-react';
import { TranscriptSegment, ScriptureReference } from '../types';

interface TranscriptBrowserProps {
  transcript: TranscriptSegment[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  onShareQuote?: (quoteText: string) => void;
  scriptureReferences?: ScriptureReference[];
}

export const TranscriptBrowser: React.FC<TranscriptBrowserProps> = ({
  transcript,
  currentTime,
  onSeek,
  onShareQuote,
  scriptureReferences = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeakerFilter, setActiveSpeakerFilter] = useState<string>('all');

  // Extract unique speakers
  const speakers = Array.from(new Set(transcript.map(t => t.speaker)));

  // Filter transcript
  const filteredTranscript = transcript.filter(segment => {
    const matchesSpeaker = activeSpeakerFilter === 'all' || segment.speaker === activeSpeakerFilter;
    const matchesSearch = segment.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      segment.speaker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (segment.scriptureRef && segment.scriptureRef.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSpeaker && matchesSearch;
  });

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(`"${text}"`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="transcript-browser-container" className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800/80 overflow-hidden">
      {/* Header & Controls */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-100">Interactive Transcript</h3>
          </div>
          <span className="text-[11px] text-slate-400">
            Click any timestamp to jump audio
          </span>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="transcript-search-input"
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search words, topics, or scriptures..."
            className="w-full bg-slate-950/80 border border-slate-700/70 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-[11px] text-slate-400 hover:text-slate-200 absolute right-3 top-1/2 -translate-y-1/2"
            >
              Clear
            </button>
          )}
        </div>

        {/* Speaker filter pills */}
        {speakers.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setActiveSpeakerFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                activeSpeakerFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Speakers
            </button>
            {speakers.map(speaker => (
              <button
                key={speaker}
                onClick={() => setActiveSpeakerFilter(speaker)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors shrink-0 ${
                  activeSpeakerFilter === speaker
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {speaker}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Transcript Segments List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-800/40">
        {filteredTranscript.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No matching transcript sections found for "{searchQuery}"
          </div>
        ) : (
          filteredTranscript.map((segment, index) => {
            const nextSegment = filteredTranscript[index + 1];
            const isActive = currentTime >= segment.timestamp && (!nextSegment || currentTime < nextSegment.timestamp);

            return (
              <div
                key={segment.id}
                id={`transcript-segment-${segment.id}`}
                className={`pt-3.5 first:pt-0 transition-all rounded-xl p-3 ${
                  isActive
                    ? 'bg-amber-500/10 border border-amber-500/30 shadow-sm'
                    : 'hover:bg-slate-800/30 border border-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSeek(segment.timestamp)}
                      className={`inline-flex items-center gap-1 text-[11px] font-mono font-semibold px-2 py-0.5 rounded transition-all ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-amber-400 hover:bg-amber-500/20'
                      }`}
                      title="Jump to this moment"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      {segment.timeFormatted}
                    </button>
                    <span className="text-xs font-semibold text-slate-200">
                      {segment.speaker}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 opacity-80 hover:opacity-100">
                    {segment.isKeyPoint && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                        <Sparkles className="w-2.5 h-2.5" /> Principle
                      </span>
                    )}
                    <button
                      onClick={() => handleCopy(segment.id, segment.text)}
                      className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                      title="Copy quote"
                    >
                      {copiedId === segment.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    {onShareQuote && (
                      <button
                        onClick={() => onShareQuote(segment.text)}
                        className="p-1 rounded text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                        title="Share this quote"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <p className={`text-xs leading-relaxed ${isActive ? 'text-slate-100 font-medium' : 'text-slate-300'}`}>
                  {segment.text}
                </p>

                {segment.scriptureRef && (
                  <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-[11px] text-indigo-300 font-medium">
                    <BookOpen className="w-3 h-3 text-indigo-400" />
                    Scripture Anchor: {segment.scriptureRef}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Scripture Reference quick-bar at bottom */}
      {scriptureReferences.length > 0 && (
        <div className="p-3 bg-slate-950/90 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span className="font-semibold text-slate-300">Scriptural Foundations in this Episode:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {scriptureReferences.map((ref, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700/80 text-[11px] text-amber-400 font-mono"
                title={ref.text}
              >
                {ref.reference}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
