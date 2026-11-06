import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  User,
  Wrench,
  Search,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../../types';

export const ComplaintsManagement: React.FC = () => {
  const { complaints, updateComplaintStatus, addComplaint, flats } = useSociety();

  const [statusFilter, setStatusFilter] = useState<'ALL' | ComplaintStatus>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'ALL' | ComplaintPriority>('ALL');

  // New complaint modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('Plumbing');
  const [priority, setPriority] = useState<ComplaintPriority>('Medium');
  const [flatNumber, setFlatNumber] = useState('A-101');
  const [desc, setDesc] = useState('');

  // Update status modal
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('In Progress');
  const [assignedStaff, setAssignedStaff] = useState('');
  const [adminResponse, setAdminResponse] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || c.priority === priorityFilter;
    return matchesStatus && matchesPriority;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const f = flats.find((x) => x.flatNumber === flatNumber);
    addComplaint({
      title,
      category,
      priority,
      description: desc,
      flatNumber,
      residentName: f?.currentOwnerName || 'Resident',
      residentPhone: f?.currentOwnerPhone || '+91 98000 00000',
    });
    setShowAddModal(false);
    setTitle('');
    setDesc('');
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaint) return;
    updateComplaintStatus(activeComplaint.id, newStatus, adminResponse, assignedStaff);
    setActiveComplaint(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-indigo-600" />
            Complaints & Service Requests
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track society maintenance tickets, technician assignment, priority escalation, and resident resolution feedback.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Log Complaint Ticket
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {(['ALL', 'Pending', 'In Progress', 'Resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Priority:</span>
          {(['ALL', 'Emergency', 'High', 'Medium', 'Low'] as const).map((pr) => (
            <button
              key={pr}
              onClick={() => setPriorityFilter(pr)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold ${
                priorityFilter === pr ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {pr}
            </button>
          ))}
        </div>
      </div>

      {/* Complaints List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredComplaints.map((c) => (
          <div
            key={c.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                  {c.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.priority === 'Emergency' || c.priority === 'High'
                        ? 'bg-rose-100 text-rose-700'
                        : c.priority === 'Medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {c.priority}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-700'
                        : c.status === 'In Progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 mt-2.5">{c.title}</h4>
              <p className="text-xs text-slate-500 mt-1 line-clamp-3">{c.description}</p>

              <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-600 space-y-1">
                <p>
                  <strong>Flat:</strong> {c.flatNumber} • {c.residentName} ({c.residentPhone})
                </p>
                <p>
                  <strong>Logged:</strong> {c.createdAt}
                </p>
                {c.assignedStaff && (
                  <p>
                    <strong>Assigned:</strong> {c.assignedStaff}
                  </p>
                )}
              </div>

              {c.adminResponse && (
                <div className="mt-3 rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-[11px] text-emerald-800">
                  <strong>Resolution Notes:</strong> {c.adminResponse}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => {
                  setActiveComplaint(c);
                  setNewStatus(c.status);
                  setAssignedStaff(c.assignedStaff || '');
                  setAdminResponse(c.adminResponse || '');
                }}
                className="w-full rounded-xl bg-indigo-50 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                Update Ticket & Staff Assignment
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">
              Update Ticket #{activeComplaint.id}: {activeComplaint.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Flat: {activeComplaint.flatNumber} ({activeComplaint.residentName})
            </p>

            <form onSubmit={handleUpdateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Assigned Technician / Staff</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="e.g. Ramesh (Society Plumber)"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Resolution Update / Admin Comments</label>
                <textarea
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                  placeholder="Explain actions taken to resolve..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Create Complaint Ticket</h3>
            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="e.g. Lift malfunction"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                  >
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="Carpentry">Carpentry</option>
                    <option value="Security">Security</option>
                    <option value="Cleanliness">Cleanliness</option>
                    <option value="Elevator">Elevator</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Flat</label>
                <select
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {flats.map((f) => (
                    <option key={f.id} value={f.flatNumber}>
                      {f.flatNumber} ({f.currentOwnerName || 'Resident'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  required
                  rows={3}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
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
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
