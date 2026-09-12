import React, { useState } from 'react';
import {
  Radio,
  Bell,
  Headphones,
  Video,
  Settings,
  User,
  Wifi,
  WifiOff,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Share2
} from 'lucide-react';
import { NotificationAlert } from '../types';

interface HeaderProps {
  activeView: 'episodes' | 'dashboard' | 'webcast';
  setActiveView: (view: 'episodes' | 'dashboard' | 'webcast') => void;
  onOpenLiveModal: () => void;
  onOpenNetworksModal: () => void;
  onOpenDeviceSettings: () => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  notifications: NotificationAlert[];
  onMarkNotificationRead: (id: string) => void;
  onSelectEpisodeById: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  setActiveView,
  onOpenLiveModal,
  onOpenNetworksModal,
  onOpenDeviceSettings,
  isOfflineMode,
  setIsOfflineMode,
  notifications,
  onMarkNotificationRead,
  onSelectEpisodeById
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => setActiveView('episodes')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <span className="font-display font-extrabold text-lg tracking-tighter">CGF</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm sm:text-base text-white tracking-wide">
                  KINGDOM GROWTH
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                  PODCASTS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block">Apostolic Wisdom & Marketplace Governance</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 border border-slate-800 p-1 rounded-xl">
            <button
              id="nav-episodes-btn"
              onClick={() => setActiveView('episodes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'episodes'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              Episodes & Transcripts
            </button>
            <button
              id="nav-webcast-btn"
              onClick={() => setActiveView('webcast')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'webcast'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              Webcast Studio
            </button>
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveView('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeView === 'dashboard'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              My Dashboard
            </button>
          </nav>
        </div>

        {/* Right: Live Button, Subscribe, Notifications, Hardware */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* THE LIVE BUTTON */}
          <button
            id="header-live-button"
            onClick={onOpenLiveModal}
            className="relative px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-600/30 transition-all active:scale-95 group cursor-pointer"
            title="Track real-time broadcasts and viewer statistics"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="font-bold tracking-wider uppercase text-[11px]">LIVE</span>
            <span className="hidden sm:inline text-[10px] opacity-90 font-mono bg-rose-900/60 px-1.5 py-0.5 rounded">
              3.4k
            </span>
          </button>

          {/* Connect to Existing Podcast Networks button */}
          <button
            id="connect-networks-btn"
            onClick={onOpenNetworksModal}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>Connect Networks</span>
          </button>

          {/* Offline indicator badge */}
          <button
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`p-2 rounded-xl border transition-all text-xs flex items-center gap-1 ${
              isOfflineMode
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title={isOfflineMode ? 'Offline Mode Active' : 'Online Mode'}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4 text-amber-400" /> : <Wifi className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Real-time Notification Alerts with Dropdown */}
          <div className="relative">
            <button
              id="notifications-bell-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Real-time episode release and webcast alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-md">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover Menu */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl p-4 shadow-2xl z-50 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Real-Time Release Alerts
                    </h3>
                  </div>
                  <span className="text-[10px] text-amber-400 font-medium">
                    {unreadCount} New
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 divide-y divide-slate-800/50">
                  {notifications.map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        onMarkNotificationRead(notif.id);
                        if (notif.linkEpisodeId) {
                          onSelectEpisodeById(notif.linkEpisodeId);
                          setShowNotifications(false);
                        }
                      }}
                      className={`pt-2.5 first:pt-0 p-2 rounded-xl cursor-pointer transition-colors ${
                        notif.read ? 'opacity-70 hover:bg-slate-800/40' : 'bg-amber-500/10 border border-amber-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="font-bold text-amber-400">{notif.title}</span>
                        <span className="text-slate-400">{notif.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">{notif.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Audio & Video Hardware Gear */}
          <button
            id="device-settings-gear-btn"
            onClick={onOpenDeviceSettings}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Audio & Video Input/Output Setup"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile navigation tab strip */}
      <div className="flex md:hidden items-center justify-around gap-1 mt-2.5 pt-2.5 border-t border-slate-800/80">
        <button
          onClick={() => setActiveView('episodes')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
            activeView === 'episodes' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Episodes
        </button>
        <button
          onClick={() => setActiveView('webcast')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
            activeView === 'webcast' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Webcast
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
            activeView === 'dashboard' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
      </div>
    </header>
  );
};
