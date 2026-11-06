import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Dumbbell,
  Plus,
  RefreshCw,
  CheckCircle2,
  Calendar,
  User,
  Clock,
  Sparkles,
} from 'lucide-react';
import { GymPlan, GymMembership } from '../../types';

export const GymManagement: React.FC = () => {
  const { gymPlans, gymMemberships, residents, addGymMembership, renewGymMembership } = useSociety();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedResidentId, setSelectedResidentId] = useState<number>(residents[0]?.id || 1);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(gymPlans[0]?.id || 1);

  const [showRenewModal, setShowRenewModal] = useState<GymMembership | null>(null);
  const [renewPlanId, setRenewPlanId] = useState<number>(gymPlans[0]?.id || 1);

  const handleRegisterMember = (e: React.FormEvent) => {
    e.preventDefault();
    addGymMembership(selectedResidentId, selectedPlanId);
    setShowAddModal(false);
  };

  const handleRenewMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRenewModal) return;
    renewGymMembership(showRenewModal.id, renewPlanId);
    setShowRenewModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-indigo-600" />
            Gym & Fitness Center Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Society fitness club plans, active memberships, expiry tracking, and renewal management.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Register New Member
        </button>
      </div>

      {/* Gym Plans Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gymPlans.map((plan) => (
          <div
            key={plan.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
                  {plan.durationMonths} {plan.durationMonths === 1 ? 'Month' : 'Months'}
                </span>
                <span className="text-lg font-black text-slate-900">
                  ₹ {plan.fee.toLocaleString('en-IN')}
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-800 mt-3">{plan.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{plan.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Cardio & Weights Included</span>
              <span className="font-semibold text-emerald-600">Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <User className="h-4 w-4 text-indigo-600" />
              Active Gym Members Roster ({gymMemberships.length})
            </h3>
            <p className="text-xs text-slate-400">Track valid memberships and renewal status</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Resident Name</th>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Membership Plan</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Fee Paid</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {gymMemberships.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{m.residentName}</td>
                  <td className="py-3.5 px-4 font-semibold text-indigo-700">{m.flatNumber}</td>
                  <td className="py-3.5 px-4 text-slate-700">{m.planName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{m.startDate}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{m.expiryDate}</td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">₹ {m.feePaid.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        m.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setShowRenewModal(m);
                        setRenewPlanId(m.planId);
                      }}
                      className="inline-flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
                    >
                      <RefreshCw className="h-3 w-3" /> Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Register Gym Member</h3>
            <form onSubmit={handleRegisterMember} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Resident</label>
                <select
                  value={selectedResidentId}
                  onChange={(e) => setSelectedResidentId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.fullName} (Flat {r.flatNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Membership Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {gymPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.fee} ({p.durationMonths} mo)
                    </option>
                  ))}
                </select>
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
                  Confirm & Activate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Renew Member Modal */}
      {showRenewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Renew Gym Membership</h3>
            <p className="text-xs text-slate-500 mt-1">
              Member: <strong>{showRenewModal.residentName}</strong> (Flat {showRenewModal.flatNumber})
            </p>
            <form onSubmit={handleRenewMember} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Renewal Plan</label>
                <select
                  value={renewPlanId}
                  onChange={(e) => setRenewPlanId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {gymPlans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.fee} ({p.durationMonths} mo)
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRenewModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Confirm Renewal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
