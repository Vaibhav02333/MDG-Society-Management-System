import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Search,
  Bell,
  ChevronDown,
  User,
  Shield,
  Home,
  LogOut,
  Code,
  CheckCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
    searchQuery,
    setSearchQuery,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsCodeModalOpen,
  } = useSociety();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all">
      {/* Search Bar */}
      <div className="flex flex-1 items-center max-w-xl">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search anything... (residents, flats, complaints, visitors...)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* 1-Click ZIP Download Button */}
        <button
          onClick={async () => {
            const { downloadFullProjectZip } = await import('../../utils/downloadZip');
            downloadFullProjectZip();
          }}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:from-emerald-700 hover:to-teal-700 transition"
          title="Download complete project (app.py, schema.sql, requirements.txt, .env.example, README.md) as a ZIP"
        >
          <Code className="h-3.5 w-3.5" />
          <span>Download Project (.ZIP)</span>
        </button>

        {/* Python Flask & MySQL College Project Files Export button */}
        <button
          onClick={() => setIsCodeModalOpen(true)}
          className="hidden sm:flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:from-violet-700 hover:to-indigo-700 transition"
          title="View and download complete Python Flask, MySQL schema.sql, and Windows VS Code guide"
        >
          <span>Setup Guide</span>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
        </button>

        {/* Quick Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
          >
            <span className="text-slate-400">Role:</span>
            <span className="font-semibold text-indigo-600">{currentUser?.role || 'Guest'}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Role (Simulation)
              </div>
              <button
                onClick={() => {
                  switchRole('ADMIN');
                  setShowRoleMenu(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  currentUser?.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-indigo-600" />
                <span>Admin (Management)</span>
              </button>
              <button
                onClick={() => {
                  switchRole('RESIDENT');
                  setShowRoleMenu(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  currentUser?.role === 'RESIDENT' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Home className="h-3.5 w-3.5 text-indigo-600" />
                <span>Resident (Flat A-101)</span>
              </button>
              <button
                onClick={() => {
                  switchRole('SECURITY');
                  setShowRoleMenu(false);
                }}
                className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                  currentUser?.role === 'SECURITY' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Shield className="h-3.5 w-3.5 text-emerald-600" />
                <span>Security Staff (Gate 1)</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-100 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.slice(0, 6).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markNotificationAsRead(n.id)}
                      className={`flex cursor-pointer items-start gap-3 p-3 text-left transition hover:bg-slate-50 ${
                        !n.isRead ? 'bg-indigo-50/30' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <Sparkles className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                        <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-400">
                          <Clock className="h-2.5 w-2.5" /> {n.timestamp}
                        </p>
                      </div>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-rose-500"></span>}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
          <img
            src={
              currentUser?.avatarUrl ||
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
            }
            alt="User avatar"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-100"
          />
          <div className="hidden text-left md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.fullName || 'Guest User'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 capitalize">
              {currentUser?.role === 'ADMIN'
                ? 'Administrator'
                : currentUser?.role === 'SECURITY'
                ? 'Security Staff'
                : `Resident (${currentUser?.flatNumber || 'Flat'})`}
            </span>
          </div>

          <button
            onClick={logout}
            className="ml-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
            title="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
