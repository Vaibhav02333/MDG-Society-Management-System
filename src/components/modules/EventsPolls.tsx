import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Vote,
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Clock,
  Sparkles,
} from 'lucide-react';
import { SocietyEvent, Poll } from '../../types';

export const EventsPolls: React.FC = () => {
  const { events, addEvent, polls, votePoll, currentUser } = useSociety();

  const [pollMessage, setPollMessage] = useState<string | null>(null);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('2025-05-18');
  const [eventTime, setEventTime] = useState('06:00 PM');
  const [eventLocation, setEventLocation] = useState('Community Hall');
  const [eventCategory, setEventCategory] = useState<SocietyEvent['category']>('Cultural');

  const handleVote = (pollId: number, optionId: number) => {
    const res = votePoll(pollId, optionId);
    setPollMessage(res.message);
    setTimeout(() => setPollMessage(null), 3000);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    addEvent({
      title: eventTitle,
      description: eventDesc,
      eventDate,
      eventTime,
      location: eventLocation,
      category: eventCategory,
    });
    setShowAddEventModal(false);
    setEventTitle('');
    setEventDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Vote className="h-5 w-5 text-indigo-600" />
            Society Events & Resident Decision Polls
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Democratic resident voting with single-vote enforcement and community event calendar.
          </p>
        </div>

        <button
          onClick={() => setShowAddEventModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Create Society Event
        </button>
      </div>

      {/* Poll Feedback Alert */}
      {pollMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            pollMessage.includes('already')
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{pollMessage}</span>
        </div>
      )}

      {/* Grid: Events & Polls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Polls (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Vote className="h-4 w-4 text-indigo-600" />
            Active Community Polls
          </h3>

          {polls.map((poll) => {
            const hasVoted = poll.votedUserIds.includes(currentUser?.id || 1);

            return (
              <div
                key={poll.id}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase rounded-full bg-indigo-50 px-2.5 py-0.5 text-indigo-700">
                      Closes {poll.endDate}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {poll.totalVotes} Total Votes
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-2">{poll.question}</h4>
                  <p className="text-xs text-slate-500 mt-1">{poll.description}</p>
                </div>

                {/* Options with percentages */}
                <div className="space-y-2.5 pt-1">
                  {poll.options.map((opt) => {
                    const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;

                    return (
                      <div
                        key={opt.id}
                        onClick={() => !hasVoted && handleVote(poll.id, opt.id)}
                        className={`group relative overflow-hidden rounded-2xl border p-3.5 transition ${
                          hasVoted
                            ? 'cursor-default border-slate-100 bg-slate-50/50'
                            : 'cursor-pointer border-slate-200 bg-white hover:border-indigo-400 hover:shadow-sm'
                        }`}
                      >
                        {/* Progress Fill bar */}
                        <div
                          style={{ width: `${pct}%` }}
                          className="absolute inset-y-0 left-0 bg-indigo-50 transition-all duration-500"
                        ></div>

                        <div className="relative z-10 flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-800">{opt.text}</span>
                          <span className="font-black text-indigo-700">
                            {pct}% <span className="font-normal text-slate-400 text-[10px]">({opt.votes})</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
                  <span>{hasVoted ? '✓ You have submitted your vote' : 'Click any option to vote'}</span>
                  <span className="font-mono text-[10px] text-slate-400">Strictly 1 vote per flat</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Society Events (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            Upcoming Society Events
          </h3>

          <div className="space-y-3">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex items-start gap-4"
              >
                <div className="flex flex-col items-center justify-center rounded-2xl bg-indigo-600 text-white h-14 w-14 shrink-0 font-bold shadow-md shadow-indigo-600/20">
                  <span className="text-base leading-none">{evt.eventDate.split('-')[2]}</span>
                  <span className="text-[10px] uppercase tracking-wider font-normal">
                    {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                  </span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                      {evt.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="h-3 w-3" /> {evt.eventTime}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 mt-1">{evt.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">{evt.description}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-indigo-700">
                    <MapPin className="h-3 w-3" /> {evt.location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Create Society Event</h3>
            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  required
                  placeholder="e.g. Independence Day Flag Hoisting"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={eventCategory}
                  onChange={(e) => setEventCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Cultural">Cultural</option>
                  <option value="Festival">Festival</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Health">Health</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Date</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Time</label>
                  <input
                    type="text"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                    placeholder="e.g. 05:00 PM"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Location</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  required
                  placeholder="e.g. Community Hall"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddEventModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
