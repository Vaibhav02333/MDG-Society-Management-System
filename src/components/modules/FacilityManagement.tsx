import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  CalendarDays,
  Plus,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Building,
} from 'lucide-react';
import { Facility, FacilityBooking } from '../../types';

export const FacilityManagement: React.FC = () => {
  const { facilities, facilityBookings, residents, bookFacility } = useSociety();

  const [showBookModal, setShowBookModal] = useState(false);
  const [facilityId, setFacilityId] = useState<number>(facilities[0]?.id || 1);
  const [residentId, setResidentId] = useState<number>(residents[0]?.id || 1);
  const [bookDate, setBookDate] = useState('2025-05-01');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('20:00');
  const [purpose, setPurpose] = useState('Community Gathering');
  const [bookingStatusMessage, setBookingStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = bookFacility({
      facilityId,
      residentId,
      bookingDate: bookDate,
      startTime,
      endTime,
      purpose,
    });

    if (res.success) {
      setBookingStatusMessage({ text: res.message, isError: false });
      setTimeout(() => {
        setShowBookModal(false);
        setBookingStatusMessage(null);
      }, 1500);
    } else {
      setBookingStatusMessage({ text: res.message, isError: true });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-indigo-600" />
            Facility & Amenities Booking Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Clubhouse, open amphitheatre, swimming pool, and sports courts with real-time overlap collision prevention.
          </p>
        </div>

        <button
          onClick={() => {
            setBookingStatusMessage(null);
            setShowBookModal(true);
          }}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
        >
          <Plus className="h-4 w-4" /> Book Facility
        </button>
      </div>

      {/* Facilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {facilities.map((f) => (
          <div
            key={f.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                  ₹{f.hourlyRate} / hour
                </span>
                <span className="text-[11px] font-medium text-slate-400">Cap: {f.capacity}</span>
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 mt-3">{f.name}</h3>
              <p className="text-xs text-slate-500 mt-1">{f.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 space-y-0.5">
              <p>Timings: {f.timings}</p>
              <p className="line-clamp-1 italic text-slate-500">{f.rules}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bookings Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-600" />
              Confirmed & Scheduled Bookings ({facilityBookings.length})
            </h3>
            <p className="text-xs text-slate-400">All bookings are enforced against schedule overlapping</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Facility</th>
                <th className="py-3 px-4">Booked By</th>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Time Slot</th>
                <th className="py-3 px-4">Fee Paid</th>
                <th className="py-3 px-4">Purpose</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {facilityBookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{b.facilityName}</td>
                  <td className="py-3.5 px-4 font-medium text-slate-800">{b.residentName}</td>
                  <td className="py-3.5 px-4 font-bold text-indigo-700">{b.flatNumber}</td>
                  <td className="py-3.5 px-4 text-slate-700">{b.bookingDate}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {b.startTime} - {b.endTime}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    ₹ {b.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{b.purpose}</td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      <CheckCircle2 className="h-3 w-3" />
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Facility Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Book Facility Slot</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select facility, resident, date and time. Overlap detection will prevent double bookings.
            </p>

            {bookingStatusMessage && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
                  bookingStatusMessage.isError
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {bookingStatusMessage.text}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Select Facility</label>
                <select
                  value={facilityId}
                  onChange={(e) => setFacilityId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (₹{f.hourlyRate}/hr)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Select Resident</label>
                <select
                  value={residentId}
                  onChange={(e) => setResidentId(Number(e.target.value))}
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
                <label className="text-xs font-semibold text-slate-700">Booking Date</label>
                <input
                  type="date"
                  value={bookDate}
                  onChange={(e) => setBookDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Purpose / Event Details</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  placeholder="e.g. Anniversary dinner"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Verify & Book Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
