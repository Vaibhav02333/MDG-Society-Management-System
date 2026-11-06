import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Car,
  Plus,
  CheckCircle2,
  AlertCircle,
  Zap,
  Trash2,
  Search,
} from 'lucide-react';
import { ParkingSlot } from '../../types';

export const ParkingManagement: React.FC = () => {
  const { parkingSlots, allocateParkingSlot, releaseParkingSlot, flats } = useSociety();

  const [selectedWing, setSelectedWing] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [showAllocateModal, setShowAllocateModal] = useState<ParkingSlot | null>(null);
  const [flatNumber, setFlatNumber] = useState('A-101');
  const [residentName, setResidentName] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<ParkingSlot['vehicleType']>('4-Wheeler');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredSlots = parkingSlots.filter((s) => {
    return selectedWing === 'ALL' || s.wing === selectedWing;
  });

  const totalSlots = parkingSlots.length;
  const allocatedSlots = parkingSlots.filter((s) => s.isAllocated).length;
  const availableSlots = totalSlots - allocatedSlots;

  const handleAllocateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAllocateModal) return;

    const res = allocateParkingSlot(
      showAllocateModal.id,
      flatNumber,
      residentName || 'Resident',
      vehicleNumber,
      vehicleType
    );

    if (res.success) {
      setShowAllocateModal(null);
      setErrorMessage(null);
      setVehicleNumber('');
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Car className="h-5 w-5 text-indigo-600" />
            Parking & Vehicle Allocation Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Basement 1 & Basement 2 parking grid. Prevents double-allocation of slots to active vehicles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700">
            Total {totalSlots} Slots
          </span>
          <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
            {availableSlots} Available
          </span>
          <span className="rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700">
            {allocatedSlots} Occupied
          </span>
        </div>
      </div>

      {/* Wing Selector */}
      <div className="flex items-center gap-2">
        {(['ALL', 'A', 'B', 'C'] as const).map((wing) => (
          <button
            key={wing}
            onClick={() => setSelectedWing(wing)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              selectedWing === wing
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {wing === 'ALL' ? 'All Wings' : `Wing ${wing} Slots`}
          </button>
        ))}
      </div>

      {/* Parking Slots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredSlots.map((slot) => (
          <div
            key={slot.id}
            className={`rounded-2xl border p-3.5 transition flex flex-col justify-between ${
              slot.isAllocated
                ? 'border-indigo-100 bg-indigo-50/40 text-slate-800'
                : 'border-slate-200 bg-white hover:border-emerald-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold">{slot.slotNumber}</span>
                {slot.vehicleType === 'EV 4-Wheeler' && (
                  <span title="EV Charging Point">
                    <Zap className="h-3 w-3 text-amber-500" />
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{slot.floorLevel}</p>

              {slot.isAllocated ? (
                <div className="mt-2 text-xs">
                  <div className="font-bold text-indigo-700">{slot.allocatedFlatNumber}</div>
                  <div className="text-[11px] font-mono text-slate-700">{slot.vehicleNumber}</div>
                  <div className="text-[10px] text-slate-500">{slot.vehicleType}</div>
                </div>
              ) : (
                <div className="mt-3 text-[11px] font-semibold text-emerald-600">Vacant & Ready</div>
              )}
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100/60">
              {slot.isAllocated ? (
                <button
                  onClick={() => releaseParkingSlot(slot.id)}
                  className="w-full rounded-lg bg-rose-50 py-1 text-[10px] font-bold text-rose-700 hover:bg-rose-100 transition"
                >
                  Release Slot
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowAllocateModal(slot);
                    setErrorMessage(null);
                  }}
                  className="w-full rounded-lg bg-indigo-600 py-1 text-[10px] font-bold text-white shadow hover:bg-indigo-500 transition"
                >
                  Allocate
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Allocate Modal */}
      {showAllocateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">
              Allocate Slot {showAllocateModal.slotNumber}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Wing {showAllocateModal.wing} • {showAllocateModal.floorLevel}
            </p>

            {errorMessage && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleAllocateSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Flat</label>
                <select
                  value={flatNumber}
                  onChange={(e) => {
                    setFlatNumber(e.target.value);
                    const f = flats.find((x) => x.flatNumber === e.target.value);
                    if (f && f.currentOwnerName) setResidentName(f.currentOwnerName);
                  }}
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
                <label className="text-xs font-semibold text-slate-700">Vehicle Number</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                  placeholder="e.g. KA-03-MD-7711"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="4-Wheeler">4-Wheeler Car</option>
                  <option value="EV 4-Wheeler">Electric Vehicle (EV 4-Wheeler)</option>
                  <option value="2-Wheeler">2-Wheeler Motorcycle / Scooter</option>
                </select>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAllocateModal(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Confirm Allocation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
