import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  QrCode,
  UserCheck,
  Plus,
  Clock,
  Car,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  Shield,
} from 'lucide-react';
import QRCode from 'qrcode';
import { Visitor } from '../../types';

export const VisitorsManagement: React.FC = () => {
  const { visitors, registerVisitor, updateVisitorStatus, verifyVisitorPass, flats } = useSociety();

  const [search, setSearch] = useState('');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestFlat, setGuestFlat] = useState('A-101');
  const [guestPurpose, setGuestPurpose] = useState('Guest Visit');
  const [guestVehicle, setGuestVehicle] = useState('');

  // QR Pass modal view
  const [activeQrModalVisitor, setActiveQrModalVisitor] = useState<Visitor | null>(null);
  const [activeQrUrl, setActiveQrUrl] = useState<string>('');

  // Verifier tool inside module
  const [checkCode, setCheckCode] = useState('');
  const [checkedVisitor, setCheckedVisitor] = useState<Visitor | null>(null);
  const [hasVerified, setHasVerified] = useState(false);

  const filteredVisitors = visitors.filter((v) => {
    return (
      search === '' ||
      v.visitorName.toLowerCase().includes(search.toLowerCase()) ||
      v.hostFlatNumber.toLowerCase().includes(search.toLowerCase()) ||
      v.qrPassCode.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newV = registerVisitor({
      visitorName: guestName,
      phone: guestPhone,
      hostFlatNumber: guestFlat,
      purpose: guestPurpose,
      vehicleNumber: guestVehicle || undefined,
    });
    setShowRegisterModal(false);
    viewQrPass(newV);
  };

  const viewQrPass = async (v: Visitor) => {
    setActiveQrModalVisitor(v);
    try {
      const url = await QRCode.toDataURL(v.qrPassCode, { width: 220, margin: 1 });
      setActiveQrUrl(url);
    } catch (e) {
      console.error(e);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const res = verifyVisitorPass(checkCode);
    setCheckedVisitor(res);
    setHasVerified(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600" />
            Visitor & Security Gate Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Generate verifiable QR visitor passes, track entry/exit logs, and verify guest identity at security gates.
          </p>
        </div>

        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> New Visitor Pass
        </button>
      </div>

      {/* Embedded Live QR Verifier */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald-600" />
          Real-Time Pass Authentication Tool
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Verify any visitor QR code. Matches directly against security gate records.
        </p>

        <form onSubmit={handleVerify} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={checkCode}
            onChange={(e) => setCheckCode(e.target.value)}
            placeholder="Enter pass code (e.g. MDG-PASS-A101-7891)..."
            required
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs text-slate-800"
          />
          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Authenticate Code
          </button>
        </form>

        {hasVerified && (
          <div className="mt-4">
            {checkedVisitor ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-200 px-2 py-0.5 rounded-full">
                    Pass Verified & Valid
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1">
                    {checkedVisitor.visitorName} ({checkedVisitor.phone})
                  </h4>
                  <p className="text-xs text-slate-600">
                    Host: Flat {checkedVisitor.hostFlatNumber} ({checkedVisitor.hostResidentName}) • Status:{' '}
                    <strong>{checkedVisitor.status}</strong>
                  </p>
                </div>
                {checkedVisitor.status !== 'Checked-In' ? (
                  <button
                    onClick={() => {
                      updateVisitorStatus(checkedVisitor.id, 'Checked-In');
                      setCheckedVisitor({ ...checkedVisitor, status: 'Checked-In' });
                    }}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow"
                  >
                    Mark Check-In
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      updateVisitorStatus(checkedVisitor.id, 'Checked-Out');
                      setCheckedVisitor({ ...checkedVisitor, status: 'Checked-Out' });
                    }}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow"
                  >
                    Mark Check-Out
                  </button>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-700">
                Invalid pass code "{checkCode}". No authorized visitor record found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Visitors Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              Visitor Entry Log & Pass Repository ({visitors.length})
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search visitor, flat, pass..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800"
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Visitor Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Host Flat</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Entry / Exit Time</th>
                <th className="py-3 px-4">Pass Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-800">{v.visitorName}</td>
                  <td className="py-3.5 px-4 text-slate-500">{v.phone}</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">
                    Flat {v.hostFlatNumber} ({v.hostResidentName})
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {v.purpose} {v.vehicleNumber && `(${v.vehicleNumber})`}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {v.entryTime ? v.entryTime : <span className="italic text-slate-400">Not checked in</span>}
                    {v.exitTime && <div className="text-[10px] text-slate-400">Exit: {v.exitTime}</div>}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-slate-700">
                    {v.qrPassCode}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        v.status === 'Checked-In'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Checked-Out'
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => viewQrPass(v)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100"
                      title="View QR Pass"
                    >
                      <QrCode className="h-3.5 w-3.5 text-indigo-600" />
                    </button>
                    {v.status === 'Expected' && (
                      <button
                        onClick={() => updateVisitorStatus(v.id, 'Checked-In')}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-emerald-500"
                      >
                        Check-In
                      </button>
                    )}
                    {v.status === 'Checked-In' && (
                      <button
                        onClick={() => updateVisitorStatus(v.id, 'Checked-Out')}
                        className="rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-white shadow hover:bg-slate-700"
                      >
                        Check-Out
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Pass Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Create Visitor Pass</h3>
            <form onSubmit={handleRegisterSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Visitor Full Name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  required
                  placeholder="+91 98..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Host Flat</label>
                <select
                  value={guestFlat}
                  onChange={(e) => setGuestFlat(e.target.value)}
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
                <label className="text-xs font-semibold text-slate-700">Purpose</label>
                <input
                  type="text"
                  value={guestPurpose}
                  onChange={(e) => setGuestPurpose(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Vehicle Number (Optional)</label>
                <input
                  type="text"
                  value={guestVehicle}
                  onChange={(e) => setGuestVehicle(e.target.value)}
                  placeholder="e.g. KA-02-AB-9876"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Generate Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Pass Display Modal */}
      {activeQrModalVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800 text-center">
            <h3 className="text-base font-extrabold text-slate-900">Official MDG Visitor Pass</h3>
            <p className="text-xs text-slate-400 mt-0.5">Green Valley Residency • Main Security Gate</p>

            <div className="my-4">
              {activeQrUrl && (
                <img src={activeQrUrl} alt="QR Pass" className="mx-auto rounded-2xl border p-3 shadow-md" />
              )}
            </div>

            <div className="rounded-xl bg-slate-50 p-3 text-xs space-y-1 text-left">
              <p>
                <strong>Guest:</strong> {activeQrModalVisitor.visitorName}
              </p>
              <p>
                <strong>Host:</strong> Flat {activeQrModalVisitor.hostFlatNumber} ({activeQrModalVisitor.hostResidentName})
              </p>
              <p>
                <strong>Pass Token:</strong>{' '}
                <span className="font-mono text-indigo-700 font-bold">{activeQrModalVisitor.qrPassCode}</span>
              </p>
              <p>
                <strong>Status:</strong> {activeQrModalVisitor.status}
              </p>
            </div>

            <button
              onClick={() => setActiveQrModalVisitor(null)}
              className="mt-4 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white shadow"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
