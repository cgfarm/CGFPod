import React, { useState } from 'react';
import {
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  Radio,
  Tag,
  User,
  X,
  RotateCcw,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Filter
} from 'lucide-react';
import { SearchFilterState } from '../types';

interface AdvancedSearchFilterProps {
  filterState: SearchFilterState;
  onChange: (newState: SearchFilterState) => void;
  onReset: () => void;
  availableSpeakers: string[];
  availableTopics: string[];
  availableNetworks: string[];
  totalResultsCount: number;
}

export const AdvancedSearchFilter: React.FC<AdvancedSearchFilterProps> = ({
  filterState,
  onChange,
  onReset,
  availableSpeakers,
  availableTopics,
  availableNetworks,
  totalResultsCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Active filters count
  const activeFiltersCount =
    (filterState.speaker ? 1 : 0) +
    (filterState.dateRange !== 'all' ? 1 : 0) +
    (filterState.lengthRange !== 'all' ? 1 : 0) +
    (filterState.topic ? 1 : 0) +
    (filterState.network ? 1 : 0) +
    (filterState.searchInTranscript ? 1 : 0);

  const handleUpdate = (partial: Partial<SearchFilterState>) => {
    onChange({ ...filterState, ...partial });
  };

  return (
    <div id="advanced-search-filter" className="space-y-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-xl">
      {/* Primary Search Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="advanced-search-input"
            type="text"
            value={filterState.query}
            onChange={e => handleUpdate({ query: e.target.value })}
            placeholder={
              filterState.searchInTranscript
                ? "Search titles, description, and full transcripts (e.g. 'covenant', 'Psalm 91', 'AI')..."
                : "Search episode titles, keywords, themes..."
            }
            className="w-full bg-slate-950 border border-slate-700/80 rounded-2xl pl-10 pr-10 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          {filterState.query && (
            <button
              onClick={() => handleUpdate({ query: '' })}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Transcript Toggle */}
        <button
          type="button"
          id="toggle-transcript-search-btn"
          onClick={() => handleUpdate({ searchInTranscript: !filterState.searchInTranscript })}
          className={`px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all shrink-0 ${
            filterState.searchInTranscript
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 font-bold shadow-md shadow-amber-500/10'
              : 'bg-slate-950 text-slate-400 hover:text-slate-200 border-slate-800'
          }`}
          title="Search through spoken words inside episode transcripts"
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
          <span>Search in Transcripts</span>
          {filterState.searchInTranscript && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        {/* Advanced Filters Expand Button */}
        <button
          type="button"
          id="toggle-advanced-filters-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border transition-all shrink-0 ${
            isExpanded || activeFiltersCount > 0
              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
              : 'bg-slate-950 text-slate-300 hover:text-white border-slate-800'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-slate-950 text-amber-400 text-[10px] font-bold flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Reset button if any filter active */}
        {(filterState.query || activeFiltersCount > 0) && (
          <button
            type="button"
            id="reset-all-filters-btn"
            onClick={onReset}
            className="px-3 py-2.5 rounded-2xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 border border-slate-800 flex items-center gap-1.5 transition-colors shrink-0"
            title="Reset all filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Expanded Multi-Dimensional Filter Panel */}
      {isExpanded && (
        <div className="pt-4 border-t border-slate-800 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* 1. Speaker Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Speaker / Host / Guest
              </label>
              <select
                id="filter-speaker-select"
                value={filterState.speaker}
                onChange={e => handleUpdate({ speaker: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Speakers & Teachers</option>
                {availableSpeakers.map(sp => (
                  <option key={sp} value={sp}>
                    {sp}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Topic / Series Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Kingdom Topic / Series
              </label>
              <select
                id="filter-topic-select"
                value={filterState.topic}
                onChange={e => handleUpdate({ topic: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Kingdom Topics</option>
                {availableTopics.map(t => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Episode Length Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Episode Length
              </label>
              <select
                id="filter-length-select"
                value={filterState.lengthRange}
                onChange={e => handleUpdate({ lengthRange: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">All Lengths</option>
                <option value="under35">Quick Study (&lt; 35 mins)</option>
                <option value="35to45">Standard Masterclass (35 - 45 mins)</option>
                <option value="over45">Deep Apostolic Dive (&gt; 45 mins)</option>
              </select>
            </div>

            {/* 4. Podcast Network Filter */}
            <div className="space-y-1.5">
              <label className="text-slate-400 font-medium flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                Podcast Network
              </label>
              <select
                id="filter-network-select"
                value={filterState.network}
                onChange={e => handleUpdate({ network: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="">All Networks & Feeds</option>
                {availableNetworks.map(net => (
                  <option key={net} value={net}>
                    {net}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Date Range Filter:
              </span>
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                {(['all', '30days', '90days', '2026', 'custom'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => handleUpdate({ dateRange: mode })}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      filterState.dateRange === mode
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                    }`}
                  >
                    {mode === 'all' && 'All Time'}
                    {mode === '30days' && 'Past 30 Days'}
                    {mode === '90days' && 'Past 90 Days'}
                    {mode === '2026' && 'Year 2026'}
                    {mode === 'custom' && 'Custom Date'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Inputs if 'custom' is active */}
            {filterState.dateRange === 'custom' && (
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">From:</span>
                  <input
                    type="date"
                    value={filterState.customStartDate || ''}
                    onChange={e => handleUpdate({ customStartDate: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">To:</span>
                  <input
                    type="date"
                    value={filterState.customEndDate || ''}
                    onChange={e => handleUpdate({ customEndDate: e.target.value })}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active Filter Chips Strip */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/60 text-xs">
          <span className="text-slate-400 font-medium text-[11px] mr-1">Active Filters:</span>

          {filterState.searchInTranscript && (
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 font-medium">
              <BookOpen className="w-3 h-3" /> Transcript Search
              <button
                onClick={() => handleUpdate({ searchInTranscript: false })}
                className="hover:text-white ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.speaker && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
              <User className="w-3 h-3 text-amber-400" /> {filterState.speaker}
              <button onClick={() => handleUpdate({ speaker: '' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.topic && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
              <Tag className="w-3 h-3 text-amber-400" /> {filterState.topic}
              <button onClick={() => handleUpdate({ topic: '' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.lengthRange !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
              <Clock className="w-3 h-3 text-amber-400" />
              {filterState.lengthRange === 'under35' && '< 35m'}
              {filterState.lengthRange === '35to45' && '35 - 45m'}
              {filterState.lengthRange === 'over45' && '> 45m'}
              <button onClick={() => handleUpdate({ lengthRange: 'all' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.dateRange !== 'all' && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
              <Calendar className="w-3 h-3 text-amber-400" />
              {filterState.dateRange === '30days' && 'Past 30 Days'}
              {filterState.dateRange === '90days' && 'Past 90 Days'}
              {filterState.dateRange === '2026' && 'Year 2026'}
              {filterState.dateRange === 'custom' && 'Custom Range'}
              <button onClick={() => handleUpdate({ dateRange: 'all' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filterState.network && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 flex items-center gap-1.5 font-medium">
              <Radio className="w-3 h-3 text-amber-400" /> {filterState.network}
              <button onClick={() => handleUpdate({ network: '' })} className="hover:text-white ml-0.5">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <button
            onClick={onReset}
            className="text-[11px] text-amber-400 hover:underline font-semibold ml-auto"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Results Count Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
        <span>
          Found <strong className="text-amber-400 font-bold">{totalResultsCount}</strong> {totalResultsCount === 1 ? 'episode' : 'episodes'} matching criteria
        </span>
        {filterState.searchInTranscript && filterState.query && (
          <span className="text-[11px] text-amber-400/90 italic">
            Scanning spoken sentences in audio/video transcripts
          </span>
        )}
      </div>
    </div>
  );
};
