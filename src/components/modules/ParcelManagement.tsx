import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Package,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Truck,
} from 'lucide-react';

export const ParcelManagement: React.FC = () => {
  const { parcels, registerParcel, collectParcel, flats } = useSociety();

  const [showAddModal, setShowAddModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [flatNumber, setFlatNumber] = useState('A-101');
  const [courier, setCourier] = useState('Amazon');
  const [tracking, setTracking] = useState('');

  const [search, setSearch] = useState('');

  const filteredParcels = parcels.filter(
    (p) =>
      search === '' ||
      p.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      p.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.courierCompany.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    registerParcel({
      recipientName: recipient,
      flatNumber,
      courierCompany: courier,
      trackingNumber: tracking || undefined,
    });
    setShowAddModal(false);
    setRecipient('');
    setTracking('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            Parcel & Courier Delivery Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Gate intake logs, resident delivery notifications, and contactless parcel collection handovers.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Log Inbound Delivery
        </button>
      </div>

      {/* Parcel Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Truck className="h-4 w-4 text-amber-500" />
              Delivery Intake & Collection History ({parcels.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search recipient or flat..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Recipient Name</th>
                <th className="py-3 px-4">Courier Service</th>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Received At</th>
                <th className="py-3 px-4">Logged By Guard</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParcels.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      {p.flatNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{p.recipientName}</td>
                  <td className="py-3.5 px-4 text-slate-700 font-medium">{p.courierCompany}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {p.trackingNumber || 'N/A'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{p.receivedAt}</td>
                  <td className="py-3.5 px-4 text-slate-500">{p.securityStaffName}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        p.status === 'Collected' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {p.status !== 'Collected' ? (
                      <button
                        onClick={() => collectParcel(p.id, `${p.recipientName} (Self)`)}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                      >
                        Hand Over
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400">Handed Over</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Parcel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Log Inbound Delivery</h3>
            <form onSubmit={handleRegister} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Recipient Resident Name</label>
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Flat Number</label>
                <select
                  value={flatNumber}
                  onChange={(e) => setFlatNumber(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {flats.map((f) => (
                    <option key={f.id} value={f.flatNumber}>
                      Flat {f.flatNumber} ({f.currentOwnerName || 'Owner'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Courier Company</label>
                <input
                  type="text"
                  value={courier}
                  onChange={(e) => setCourier(e.target.value)}
                  required
                  placeholder="e.g. Amazon, BlueDart, DTDC"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tracking Code (Optional)</label>
                <input
                  type="text"
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder="e.g. AMZ-98124"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
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
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
