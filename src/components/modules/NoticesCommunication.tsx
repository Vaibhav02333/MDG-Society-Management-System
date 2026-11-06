import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Megaphone,
  Pin,
  Plus,
  Calendar,
  User,
  AlertTriangle,
  BellRing,
} from 'lucide-react';
import { Notice } from '../../types';

export const NoticesCommunication: React.FC = () => {
  const { notices, addNotice } = useSociety();

  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<Notice['category']>('General');
  const [isPinned, setIsPinned] = useState(false);

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    addNotice({
      title,
      content,
      category,
      publishedBy: 'Management Committee',
      isPinned,
    });
    setShowAddModal(false);
    setTitle('');
    setContent('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-indigo-600" />
            Society Notices & Official Communication
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Broadcast emergency alerts, maintenance schedules, water tank cleaning, and committee circulars.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Publish New Notice
        </button>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {notices.map((n) => (
          <div
            key={n.id}
            className={`rounded-3xl border p-6 transition shadow-sm ${
              n.isPinned
                ? 'border-indigo-200 bg-gradient-to-r from-indigo-50/40 via-white to-white'
                : 'border-slate-100 bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {n.isPinned && (
                  <span className="flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                    <Pin className="h-3 w-3" /> Pinned Notice
                  </span>
                )}
                <span
                  className={`rounded-md px-2.5 py-0.5 text-[10px] font-bold ${
                    n.category === 'Urgent'
                      ? 'bg-rose-100 text-rose-700'
                      : n.category === 'Maintenance'
                      ? 'bg-amber-100 text-amber-700'
                      : n.category === 'Security'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {n.category}
                </span>
              </div>
              <span className="text-xs text-slate-400">{n.publishedDate}</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900 mt-3">{n.title}</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed whitespace-pre-line">{n.content}</p>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Published by {n.publishedBy}</span>
              <span>All Residents & Owners</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Publish Society Notice</h3>
            <form onSubmit={handleCreateNotice} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Notice Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Water supply outage timing"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="General">General</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Security">Security</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Notice Details / Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={4}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pin" className="text-xs font-semibold text-slate-700">
                  Pin this notice to top of resident dashboard
                </label>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
