import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Pin,
  Flame,
  Lightbulb,
  Shield,
  ShieldAlert,
  Clock,
  Send,
  Flag,
  Trash2,
  EyeOff,
  Eye,
  CheckCircle2,
  Heart,
  CornerDownRight,
  Filter
} from 'lucide-react';
import { Episode, EpisodeComment } from '../types';
import { SyncService } from '../services/syncService';

interface EpisodeCommentsProps {
  episode: Episode;
  currentTime: number;
  onSeek: (seconds: number) => void;
  onOpenShareTimestamp?: (seconds: number, quote?: string) => void;
}

export const EpisodeComments: React.FC<EpisodeCommentsProps> = ({
  episode,
  currentTime,
  onSeek,
  onOpenShareTimestamp
}) => {
  const [comments, setComments] = useState<EpisodeComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [attachTimestamp, setAttachTimestamp] = useState(false);
  const [isPrayerRequest, setIsPrayerRequest] = useState(false);
  const [filterMode, setFilterMode] = useState<'all' | 'pinned' | 'prayers' | 'timestamps' | 'reported'>('all');
  const [isModeratorMode, setIsModeratorMode] = useState(false);
  const [userRole, setUserRole] = useState<'Disciple' | 'Marketplace Leader' | 'Pastor' | 'Moderator'>('Disciple');

  useEffect(() => {
    loadComments();
  }, [episode.id]);

  const loadComments = () => {
    const data = SyncService.getEpisodeComments(episode.id);
    setComments(data);
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const roundedCurrentTime = Math.floor(currentTime);
    const newComment: EpisodeComment = {
      id: 'comm-' + Date.now(),
      episodeId: episode.id,
      author: userRole === 'Moderator' ? 'Elder Caleb (Moderator)' : 'You (Kingdom Disciple)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: userRole,
      content: newCommentText.trim(),
      timestampFormatted: 'Just now',
      createdAt: Date.now(),
      mediaTimestampSeconds: attachTimestamp ? roundedCurrentTime : undefined,
      mediaTimestampFormatted: attachTimestamp ? formatSeconds(roundedCurrentTime) : undefined,
      isPrayerRequest,
      isPinned: false,
      isReported: false,
      isHidden: false,
      reactions: {
        amen: 1,
        insight: 0,
        fire: 0,
        userReacted: ['amen']
      }
    };

    SyncService.addEpisodeComment(newComment);
    setNewCommentText('');
    setAttachTimestamp(false);
    setIsPrayerRequest(false);
    loadComments();
  };

  const handleReaction = (commentId: string, reactionType: 'amen' | 'insight' | 'fire') => {
    const current = comments.find(c => c.id === commentId);
    if (!current) return;

    const reactedList = current.reactions.userReacted || [];
    const alreadyReacted = reactedList.includes(reactionType);

    const updatedReactions = {
      ...current.reactions,
      [reactionType]: alreadyReacted
        ? Math.max(0, current.reactions[reactionType] - 1)
        : current.reactions[reactionType] + 1,
      userReacted: alreadyReacted
        ? reactedList.filter(r => r !== reactionType)
        : [...reactedList, reactionType]
    };

    SyncService.updateEpisodeComment(episode.id, commentId, { reactions: updatedReactions });
    loadComments();
  };

  const handleTogglePin = (commentId: string) => {
    const current = comments.find(c => c.id === commentId);
    if (!current) return;
    SyncService.updateEpisodeComment(episode.id, commentId, { isPinned: !current.isPinned });
    loadComments();
  };

  const handleToggleHide = (commentId: string) => {
    const current = comments.find(c => c.id === commentId);
    if (!current) return;
    SyncService.updateEpisodeComment(episode.id, commentId, { isHidden: !current.isHidden });
    loadComments();
  };

  const handleReportComment = (commentId: string) => {
    const current = comments.find(c => c.id === commentId);
    if (!current) return;
    SyncService.updateEpisodeComment(episode.id, commentId, { isReported: true });
    loadComments();
  };

  const handleDeleteComment = (commentId: string) => {
    SyncService.deleteEpisodeComment(episode.id, commentId);
    loadComments();
  };

  // Filter comments
  const filteredComments = comments.filter(c => {
    if (!isModeratorMode && c.isHidden) return false;
    if (filterMode === 'pinned') return c.isPinned;
    if (filterMode === 'prayers') return c.isPrayerRequest;
    if (filterMode === 'timestamps') return c.mediaTimestampSeconds !== undefined;
    if (filterMode === 'reported') return c.isReported;
    return true;
  });

  return (
    <div id="episode-comments-container" className="space-y-6">
      {/* Moderation Controls Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              Kingdom Disciple Community Forum
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-400 font-normal">
                {comments.length} contributions
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Share revelations, submit prayer requests, or ask practical marketplace questions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Moderator Role Switcher */}
          <button
            id="toggle-moderator-mode-btn"
            onClick={() => setIsModeratorMode(!isModeratorMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              isModeratorMode
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            {isModeratorMode ? 'Moderator Mode Active' : 'Enable Mod Tools'}
          </button>
        </div>
      </div>

      {/* Moderation Alert Banner when in Mod Mode */}
      {isModeratorMode && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Moderation Tools Enabled: You can pin key reflections, approve or hide reported messages, and ensure honoring conversation.
            </span>
          </div>
          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-[10px] font-mono font-bold text-amber-300 uppercase">
            Admin View
          </span>
        </div>
      )}

      {/* Comment Input Box */}
      <form onSubmit={handlePostComment} className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium text-slate-300">Join the Episode Conversation:</span>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-slate-400">Posting as:</label>
            <select
              value={userRole}
              onChange={e => setUserRole(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="Disciple">Kingdom Disciple</option>
              <option value="Marketplace Leader">Marketplace Leader</option>
              <option value="Pastor">Pastor / Teacher</option>
              {isModeratorMode && <option value="Moderator">Certified Moderator</option>}
            </select>
          </div>
        </div>

        <textarea
          id="episode-comment-input"
          value={newCommentText}
          onChange={e => setNewCommentText(e.target.value)}
          placeholder={`Share your takeaway, reflection, or prayer request for "${episode.title}"...`}
          rows={3}
          className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Attach Timestamp Tag */}
            <button
              type="button"
              id="attach-timestamp-btn"
              onClick={() => setAttachTimestamp(!attachTimestamp)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                attachTimestamp
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Clock className="w-3 h-3" />
              Tag Current Playback ({formatSeconds(currentTime)})
            </button>

            {/* Mark as Prayer Request */}
            <button
              type="button"
              id="mark-prayer-btn"
              onClick={() => setIsPrayerRequest(!isPrayerRequest)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isPrayerRequest
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Heart className="w-3 h-3" />
              Prayer Request
            </button>
          </div>

          <button
            type="submit"
            disabled={!newCommentText.trim()}
            id="submit-comment-btn"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            Post Comment
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3 text-xs">
        <span className="text-slate-400 flex items-center gap-1 text-[11px] font-medium mr-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        <button
          onClick={() => setFilterMode('all')}
          className={`px-3 py-1 rounded-lg transition-all ${
            filterMode === 'all' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          All ({comments.length})
        </button>
        <button
          onClick={() => setFilterMode('pinned')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
            filterMode === 'pinned' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Pin className="w-3 h-3" /> Pinned Reflections ({comments.filter(c => c.isPinned).length})
        </button>
        <button
          onClick={() => setFilterMode('prayers')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
            filterMode === 'prayers' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Heart className="w-3 h-3" /> Prayer Requests ({comments.filter(c => c.isPrayerRequest).length})
        </button>
        <button
          onClick={() => setFilterMode('timestamps')}
          className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
            filterMode === 'timestamps' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Clock className="w-3 h-3" /> Time-Tagged ({comments.filter(c => c.mediaTimestampSeconds !== undefined).length})
        </button>
        {isModeratorMode && (
          <button
            onClick={() => setFilterMode('reported')}
            className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${
              filterMode === 'reported' ? 'bg-rose-500 text-white font-bold' : 'text-rose-400 hover:text-rose-300 bg-slate-900'
            }`}
          >
            <ShieldAlert className="w-3 h-3" /> Reported ({comments.filter(c => c.isReported).length})
          </button>
        )}
      </div>

      {/* Comments List */}
      <div className="space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="p-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-400 text-xs">
            No comments in this filter view. Be the first to share your reflection on this masterclass!
          </div>
        ) : (
          filteredComments.map(comment => {
            const hasReactedAmen = comment.reactions.userReacted?.includes('amen');
            const hasReactedInsight = comment.reactions.userReacted?.includes('insight');
            const hasReactedFire = comment.reactions.userReacted?.includes('fire');

            return (
              <div
                key={comment.id}
                id={`comment-${comment.id}`}
                className={`p-4 rounded-2xl border transition-all ${
                  comment.isPinned
                    ? 'bg-slate-900/90 border-amber-500/50 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20'
                    : comment.isReported
                    ? 'bg-rose-950/20 border-rose-800/60'
                    : comment.isHidden
                    ? 'bg-slate-950/90 border-slate-800 opacity-60'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="w-9 h-9 rounded-full object-cover border border-slate-700"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-slate-100">{comment.author}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-amber-400 font-semibold border border-slate-700">
                          {comment.role}
                        </span>
                        {comment.isPinned && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                            <Pin className="w-2.5 h-2.5" /> Pinned by Leader
                          </span>
                        )}
                        {comment.isPrayerRequest && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[10px] font-bold flex items-center gap-1">
                            <Heart className="w-2.5 h-2.5" /> Prayer Request
                          </span>
                        )}
                        {comment.isReported && isModeratorMode && (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[10px] font-bold flex items-center gap-1">
                            <Flag className="w-2.5 h-2.5" /> Reported
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-0.5 block">
                        {comment.timestampFormatted}
                      </span>
                    </div>
                  </div>

                  {/* Timestamp Jump Chip */}
                  {comment.mediaTimestampSeconds !== undefined && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => onSeek(comment.mediaTimestampSeconds!)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold flex items-center gap-1 transition-all"
                        title="Jump to this time in episode"
                      >
                        <Clock className="w-3 h-3" />
                        {comment.mediaTimestampFormatted}
                      </button>
                      {onOpenShareTimestamp && (
                        <button
                          onClick={() => onOpenShareTimestamp(comment.mediaTimestampSeconds!, comment.content)}
                          className="text-slate-400 hover:text-amber-400 p-1 text-[11px]"
                          title="Share timestamp clip"
                        >
                          Share
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Comment Body */}
                <div className="mt-2.5 pl-12">
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>

                {/* Footer Reactions & Mod Actions */}
                <div className="mt-3.5 pl-12 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/60 pt-2.5">
                  {/* Reactions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleReaction(comment.id, 'amen')}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                        hasReactedAmen
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <span>🙏</span>
                      <span>Amen ({comment.reactions.amen})</span>
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, 'insight')}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                        hasReactedInsight
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <Lightbulb className="w-3 h-3 text-sky-400" />
                      <span>Insight ({comment.reactions.insight})</span>
                    </button>

                    <button
                      onClick={() => handleReaction(comment.id, 'fire')}
                      className={`px-2.5 py-1 rounded-lg text-xs flex items-center gap-1.5 border transition-all ${
                        hasReactedFire
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 font-bold'
                          : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border-slate-800'
                      }`}
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>Fire ({comment.reactions.fire})</span>
                    </button>
                  </div>

                  {/* Standard or Moderator Actions */}
                  <div className="flex items-center gap-1 text-xs">
                    {isModeratorMode ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleTogglePin(comment.id)}
                          className={`p-1.5 rounded-lg border text-xs transition-colors ${
                            comment.isPinned
                              ? 'bg-amber-500 text-slate-950 border-amber-400'
                              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
                          }`}
                          title={comment.isPinned ? 'Unpin comment' : 'Pin to top'}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleToggleHide(comment.id)}
                          className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
                          title={comment.isHidden ? 'Show comment' : 'Hide comment from public'}
                        >
                          {comment.isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1.5 rounded-lg bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleReportComment(comment.id)}
                        className="text-slate-500 hover:text-rose-400 flex items-center gap-1 text-[11px] transition-colors p-1"
                        title="Report inappropriate content"
                      >
                        <Flag className="w-3 h-3" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
