import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Activity,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  User,
  Shield,
} from 'lucide-react';
import { ActivityLog } from '../../types';

export const ActivityLogsView: React.FC = () => {
  const { activityLogs } = useSociety();
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const filteredLogs = activityLogs.filter((log) => {
    const matchesCat = filterCat === 'ALL' || log.category === filterCat;
    const matchesSearch =
      search === '' ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600" />
            System Activity & Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Immutable system audit logs recording logins, ownership deeds, maintenance payments, and complaints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            {activityLogs.length} Total Audit Entries
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {['ALL', 'Ownership', 'Payment', 'Visitor', 'Complaint', 'Gym', 'Facility', 'System'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterCat === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Performed By</th>
                <th className="py-3 px-4">Role Clearance</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{log.action}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 max-w-md truncate">{log.details}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{log.performedBy}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {log.role}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right text-slate-400 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
