import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Shield,
  QrCode,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Plus,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const {
    visitors,
    updateVisitorStatus,
    verifyVisitorPass,
    registerVisitor,
    parcels,
    registerParcel,
    collectParcel,
  } = useSociety();

  const [verifyCode, setVerifyCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Walk-in visitor modal
  const [showWalkinModal, setShowWalkinModal] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinPhone, setWalkinPhone] = useState('');
  const [walkinFlat, setWalkinFlat] = useState('A-101');
  const [walkinPurpose, setWalkinPurpose] = useState('Personal Visit');
  const [walkinVehicle, setWalkinVehicle] = useState('');

  // Parcel registration
  const [showParcelModal, setShowParcelModal] = useState(false);
  const [parcelRecipient, setParcelRecipient] = useState('');
  const [parcelFlat, setParcelFlat] = useState('A-101');
  const [parcelCourier, setParcelCourier] = useState('Amazon');
  const [parcelTracking, setParcelTracking] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const result = verifyVisitorPass(verifyCode);
    setVerificationResult(result);
    setHasSearched(true);
  };

  const handleCheckIn = (visitorId: number) => {
    updateVisitorStatus(visitorId, 'Checked-In');
    if (verificationResult && verificationResult.id === visitorId) {
      setVerificationResult({ ...verificationResult, status: 'Checked-In' });
    }
  };

  const handleCheckOut = (visitorId: number) => {
    updateVisitorStatus(visitorId, 'Checked-Out');
    if (verificationResult && verificationResult.id === visitorId) {
      setVerificationResult({ ...verificationResult, status: 'Checked-Out' });
    }
  };

  const handleWalkinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newV = registerVisitor({
      visitorName: walkinName,
      phone: walkinPhone,
      hostFlatNumber: walkinFlat,
      purpose: walkinPurpose,
      vehicleNumber: walkinVehicle || undefined,
    });
    updateVisitorStatus(newV.id, 'Checked-In');
    setShowWalkinModal(false);
    setWalkinName('');
    setWalkinPhone('');
  };

  const handleParcelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    registerParcel({
      recipientName: parcelRecipient,
      flatNumber: parcelFlat,
      courierCompany: parcelCourier,
      trackingNumber: parcelTracking || undefined,
    });
    setShowParcelModal(false);
    setParcelRecipient('');
    setParcelTracking('');
  };

  return (
    <div className="space-y-6">
      {/* Security Gate Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
              <Shield className="h-3.5 w-3.5" />
              <span>Main Security Gate 1 & Visitor Command Center</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              Gate Operations & Real-Time QR Pass Verifier
            </h1>
            <p className="mt-1 text-sm text-slate-300">
              Verify incoming visitor passes, log walk-in guests, and manage parcel drop-offs.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowWalkinModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 shadow hover:bg-emerald-400 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Log Walk-in Visitor</span>
            </button>
            <button
              onClick={() => setShowParcelModal(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
            >
              <Package className="h-4 w-4" />
              <span>Log Received Parcel</span>
            </button>
          </div>
        </div>
      </div>

      {/* QR Pass Verification Tool */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-emerald-600" />
              Verifiable QR Pass Scanner / Checker
            </h3>
            <p className="text-xs text-slate-400">
              Enter or select a visitor QR pass code to verify against the security database
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Quick test codes:</span>
            {visitors.slice(0, 2).map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setVerifyCode(v.qrPassCode);
                  const res = verifyVisitorPass(v.qrPassCode);
                  setVerificationResult(res);
                  setHasSearched(true);
                }}
                className="rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-indigo-600 hover:bg-indigo-50"
              >
                {v.qrPassCode}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleVerify} className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value)}
            placeholder="Scan or enter QR Pass Code (e.g. MDG-PASS-A101-7891)..."
            required
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
          >
            Verify Pass
          </button>
        </form>

        {/* Verification Result Output */}
        {hasSearched && (
          <div className="mt-4">
            {verificationResult ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                          VERIFIED AUTHENTIC PASS
                        </span>
                        <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                          Status: {verificationResult.status}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                        {verificationResult.visitorName} ({verificationResult.phone})
                      </h4>
                      <p className="text-xs text-slate-600">
                        Visiting Flat: <strong>{verificationResult.hostFlatNumber}</strong> • Host:{' '}
                        <strong>{verificationResult.hostResidentName}</strong>
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Purpose: {verificationResult.purpose}{' '}
                        {verificationResult.vehicleNumber && `• Vehicle: ${verificationResult.vehicleNumber}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {verificationResult.status !== 'Checked-In' && (
                      <button
                        onClick={() => handleCheckIn(verificationResult.id)}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-500"
                      >
                        Grant Entry (Check-In)
                      </button>
                    )}
                    {verificationResult.status === 'Checked-In' && (
                      <button
                        onClick={() => handleCheckOut(verificationResult.id)}
                        className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white shadow hover:bg-slate-700"
                      >
                        Mark Exit (Check-Out)
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 flex items-center gap-3 text-rose-800">
                <XCircle className="h-8 w-8 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">INVALID OR UNRECOGNIZED PASS CODE</h4>
                  <p className="text-xs text-rose-600 mt-0.5">
                    No matching visitor authorization found for code "{verifyCode}". Deny gate entry or register walk-in.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2 Columns: Gate Visitor Activity & Gate Parcels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visitors Log (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              Today's Visitor Entry & Exit Register
            </h3>
            <span className="text-xs font-bold text-slate-400">{visitors.length} entries</span>
          </div>

          <div className="mt-4 space-y-3">
            {visitors.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{v.visitorName}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        v.status === 'Checked-In'
                          ? 'bg-emerald-100 text-emerald-700'
                          : v.status === 'Checked-Out'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Flat {v.hostFlatNumber} ({v.hostResidentName}) • {v.purpose}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Pass: {v.qrPassCode}</p>
                </div>

                <div className="flex items-center gap-2">
                  {v.status === 'Expected' && (
                    <button
                      onClick={() => handleCheckIn(v.id)}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500"
                    >
                      Check-In
                    </button>
                  )}
                  {v.status === 'Checked-In' && (
                    <button
                      onClick={() => handleCheckOut(v.id)}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Check-Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Parcels (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Gate Parcels & Delivery Log
            </h3>
            <span className="text-xs font-bold text-slate-400">{parcels.length} total</span>
          </div>

          <div className="mt-4 space-y-3">
            {parcels.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{p.courierCompany}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Collected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    For {p.recipientName} (Flat {p.flatNumber})
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Received: {p.receivedAt}</p>
                </div>

                {p.status !== 'Collected' && (
                  <button
                    onClick={() => collectParcel(p.id, `${p.recipientName} (Collected)`)}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-indigo-500"
                  >
                    Hand Over
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Walk-in Modal */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Log Walk-In Visitor at Gate</h3>
            <form onSubmit={handleWalkinSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Visitor Full Name</label>
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={walkinPhone}
                  onChange={(e) => setWalkinPhone(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Visiting Flat</label>
                  <input
                    type="text"
                    value={walkinFlat}
                    onChange={(e) => setWalkinFlat(e.target.value)}
                    required
                    placeholder="e.g. A-101"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Vehicle No</label>
                  <input
                    type="text"
                    value={walkinVehicle}
                    onChange={(e) => setWalkinVehicle(e.target.value)}
                    placeholder="e.g. KA-01-1234"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Purpose</label>
                <input
                  type="text"
                  value={walkinPurpose}
                  onChange={(e) => setWalkinPurpose(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
                >
                  Confirm & Check-In
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Parcel Modal */}
      {showParcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Log Inbound Parcel</h3>
            <form onSubmit={handleParcelSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Recipient Resident Name</label>
                <input
                  type="text"
                  value={parcelRecipient}
                  onChange={(e) => setParcelRecipient(e.target.value)}
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Flat Number</label>
                <input
                  type="text"
                  value={parcelFlat}
                  onChange={(e) => setParcelFlat(e.target.value)}
                  required
                  placeholder="e.g. A-101"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Courier / Delivery Company</label>
                <input
                  type="text"
                  value={parcelCourier}
                  onChange={(e) => setParcelCourier(e.target.value)}
                  required
                  placeholder="e.g. Amazon, BlueDart, DTDC"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Tracking Code (Optional)</label>
                <input
                  type="text"
                  value={parcelTracking}
                  onChange={(e) => setParcelTracking(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowParcelModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Log Parcel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
