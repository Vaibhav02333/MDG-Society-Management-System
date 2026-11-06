import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Home,
  Users,
  CreditCard,
  Dumbbell,
  CalendarDays,
  AlertCircle,
  QrCode,
  Package,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Printer,
  Vote,
  Sparkles,
  Car,
  Zap,
  Megaphone,
  Edit3,
  X,
  UserCheck,
  Shield,
  Calendar,
  XCircle,
} from 'lucide-react';
import QRCode from 'qrcode';

export const ResidentDashboard: React.FC = () => {
  const {
    currentUser,
    flats,
    residents,
    updateResident,
    addFamilyMember,
    removeFamilyMember,
    maintenanceBills,
    recordBillPayment,
    gymMemberships,
    gymPlans,
    renewGymMembership,
    addGymMembership,
    facilities,
    facilityBookings,
    bookFacility,
    cancelFacilityBooking,
    complaints,
    addComplaint,
    visitors,
    registerVisitor,
    parcels,
    parkingSlots,
    polls,
    votePoll,
    notices,
    events,
  } = useSociety();

  const userFlat = flats.find((f) => f.flatNumber === (currentUser?.flatNumber || 'A-101')) || flats[0];
  const userResident = residents.find((r) => r.flatNumber === userFlat.flatNumber) || residents[0];

  // Modals state
  const [showPayModal, setShowPayModal] = useState<number | null>(null);
  const [payMode, setPayMode] = useState<'UPI' | 'Card' | 'NetBanking'>('UPI');
  const [selectedReceiptBill, setSelectedReceiptBill] = useState<any | null>(null);

  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyRelation, setNewFamilyRelation] = useState<'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other'>('Child');
  const [newFamilyAge, setNewFamilyAge] = useState(10);
  const [newFamilyPhone, setNewFamilyPhone] = useState('');

  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState(1);
  const [bookDate, setBookDate] = useState('2025-05-01');
  const [bookStartTime, setBookStartTime] = useState('18:00');
  const [bookEndTime, setBookEndTime] = useState('20:00');
  const [bookPurpose, setBookPurpose] = useState('Family get-together');
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);

  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<'Plumbing' | 'Electrical' | 'Carpentry' | 'Security' | 'Cleanliness' | 'Elevator' | 'Other'>('Plumbing');
  const [complaintPriority, setComplaintPriority] = useState<'Low' | 'Medium' | 'High' | 'Emergency'>('Medium');
  const [complaintDesc, setComplaintDesc] = useState('');

  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestPurpose, setGuestPurpose] = useState('Personal Visit');
  const [guestVehicle, setGuestVehicle] = useState('');
  const [generatedPass, setGeneratedPass] = useState<any | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  const [showGymRenewModal, setShowGymRenewModal] = useState<number | null>(null);
  const [selectedGymPlanId, setSelectedGymPlanId] = useState(2);

  // Edit Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editPhone, setEditPhone] = useState(userResident?.phone || '+91 98765 43210');
  const [editEmail, setEditEmail] = useState(userResident?.email || 'rahul.sharma@example.com');
  const [editEmergencyName, setEditEmergencyName] = useState(userResident?.emergencyContact || 'Pooja Sharma (Spouse)');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState(userResident?.emergencyPhone || '+91 98765 00000');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);

  // Scoped items belonging exclusively to this resident
  const myBills = maintenanceBills.filter((b) => b.flatNumber === userFlat.flatNumber);
  const myComplaints = complaints.filter((c) => c.flatNumber === userFlat.flatNumber);
  const myVisitors = visitors.filter((v) => v.hostFlatNumber === userFlat.flatNumber);
  const myParcels = parcels.filter((p) => p.flatNumber === userFlat.flatNumber);
  const myGym = gymMemberships.find((g) => g.residentName === (userResident?.fullName || currentUser?.fullName));
  const myParking = parkingSlots.find((s) => s.allocatedFlatNumber === userFlat.flatNumber);
  const myFacilityBookings = facilityBookings.filter(
    (b) => b.flatNumber === userFlat.flatNumber && b.status === 'Confirmed'
  );

  // Handlers
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResident) return;
    updateResident(userResident.id, {
      phone: editPhone.trim(),
      email: editEmail.trim(),
      emergencyContact: editEmergencyName.trim(),
      emergencyPhone: editEmergencyPhone.trim(),
    });
    setProfileSuccessMsg('✓ Profile details successfully updated in MySQL society records.');
    setTimeout(() => {
      setShowProfileModal(false);
      setProfileSuccessMsg(null);
    }, 1200);
  };

  const handleCancelBooking = (bookingId: number) => {
    if (window.confirm('Are you sure you want to cancel this amenity booking?')) {
      cancelFacilityBooking(bookingId);
    }
  };

  // Handlers
  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userResident) return;
    addFamilyMember(userResident.id, {
      fullName: newFamilyName,
      relation: newFamilyRelation,
      age: Number(newFamilyAge),
      phone: newFamilyPhone || undefined,
    });
    setNewFamilyName('');
    setShowAddFamilyModal(false);
  };

  const handlePayBill = (billId: number) => {
    recordBillPayment(billId, payMode);
    setShowPayModal(null);
  };

  const handleFacilityBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const result = bookFacility({
      facilityId: selectedFacilityId,
      residentId: userResident?.id || 1,
      bookingDate: bookDate,
      startTime: bookStartTime,
      endTime: bookEndTime,
      purpose: bookPurpose,
    });
    setBookingMessage(result.message);
    if (result.success) {
      setTimeout(() => {
        setShowBookModal(false);
        setBookingMessage(null);
      }, 1500);
    }
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    addComplaint({
      title: complaintTitle,
      category: complaintCategory,
      priority: complaintPriority,
      description: complaintDesc,
      flatNumber: userFlat.flatNumber,
      residentName: userResident?.fullName || currentUser?.fullName || 'Resident',
      residentPhone: userResident?.phone || '+91 98000 00000',
    });
    setComplaintTitle('');
    setComplaintDesc('');
    setShowComplaintModal(false);
  };

  const handleGeneratePass = async (e: React.FormEvent) => {
    e.preventDefault();
    const vis = registerVisitor({
      visitorName: guestName,
      phone: guestPhone,
      hostFlatNumber: userFlat.flatNumber,
      purpose: guestPurpose,
      vehicleNumber: guestVehicle || undefined,
    });
    setGeneratedPass(vis);

    try {
      const url = await QRCode.toDataURL(vis.qrPassCode, { width: 200, margin: 1 });
      setQrDataUrl(url);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Resident Flat Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-200">
                <Home className="h-3.5 w-3.5" />
                <span>Wing {userFlat.wing} • Floor {userFlat.floor}</span>
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-bold">
                {userResident?.type || 'Owner'}
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight">
              {userResident?.fullName || currentUser?.fullName || 'Rahul Sharma'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-indigo-200">
              Flat <strong>{userFlat.flatNumber}</strong> • {userFlat.bhk} • {userFlat.areaSqFt} Sq Ft • Phone: {userResident?.phone} • Email: {userResident?.email}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                setEditPhone(userResident?.phone || '');
                setEditEmail(userResident?.email || '');
                setEditEmergencyName(userResident?.emergencyContact || '');
                setEditEmergencyPhone(userResident?.emergencyPhone || '');
                setShowProfileModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-400/40 bg-indigo-800/40 px-3.5 py-2.5 text-xs font-bold text-white hover:bg-indigo-700/60 transition"
              title="Edit personal phone number, email and emergency contact"
            >
              <Edit3 className="h-3.5 w-3.5 text-indigo-200" />
              <span>Edit Profile</span>
            </button>
            <button
              onClick={() => setShowVisitorModal(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow hover:bg-indigo-50 transition"
            >
              <QrCode className="h-4 w-4 text-indigo-600" />
              <span>Generate Visitor Pass</span>
            </button>
            <button
              onClick={() => setShowComplaintModal(true)}
              className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-500 transition"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Log Complaint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: My Bills & Family Members */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Maintenance Bills (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                My Maintenance Bills
              </h3>
              <p className="text-xs text-slate-400">Monthly billing and payment history</p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {myBills.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No maintenance bills recorded.</p>
            ) : (
              myBills.map((bill) => (
                <div
                  key={bill.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition hover:bg-slate-50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{bill.month}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          bill.status === 'Paid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : bill.status === 'Overdue'
                            ? 'bg-rose-100 text-rose-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Due: {bill.dueDate} • Amount: <strong className="text-slate-800">₹{bill.amount.toLocaleString('en-IN')}</strong>
                    </p>
                    {bill.paidDate && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Paid on {bill.paidDate} via {bill.paymentMode} ({bill.receiptNumber})
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {bill.status !== 'Paid' ? (
                      <button
                        onClick={() => setShowPayModal(bill.id)}
                        className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
                      >
                        Pay Bill
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedReceiptBill(bill)}
                        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Printer className="h-3.5 w-3.5 text-indigo-600" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Family Members (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-600" />
                Family Members & Residents
              </h3>
              <button
                onClick={() => setShowAddFamilyModal(true)}
                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-3.5 w-3.5" /> Add Member
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3">
                <div>
                  <p className="text-xs font-bold text-slate-800">{userResident?.fullName || 'Primary Resident'}</p>
                  <p className="text-[11px] text-slate-500">{userResident?.phone} • Primary {userResident?.type || 'Owner'}</p>
                </div>
                <span className="text-[10px] font-bold uppercase rounded-md bg-indigo-200/80 px-2 py-0.5 text-indigo-800">
                  Head
                </span>
              </div>

              {userResident?.familyMembers?.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{m.fullName}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.relation} • {m.age} yrs {m.phone ? `• ${m.phone}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => removeFamilyMember(userResident.id, m.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            Emergency Contact: {userResident?.emergencyContact} ({userResident?.emergencyPhone})
          </div>
        </div>
      </div>

      {/* Gym & Facility Bookings Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gym Membership (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-sky-600" />
              Gym Membership
            </h3>
          </div>

          <div className="mt-4">
            {myGym ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white shadow-md">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-200">
                    {myGym.status} Membership
                  </span>
                  <h4 className="text-base font-extrabold mt-1">{myGym.planName}</h4>
                  <p className="text-xs text-sky-100 mt-2">
                    Valid till: <strong>{myGym.expiryDate}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setShowGymRenewModal(myGym.id)}
                  className="w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-800 hover:bg-slate-200 transition"
                >
                  Renew Membership Plan
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <Dumbbell className="mx-auto h-8 w-8 text-slate-300" />
                <p className="text-xs text-slate-500 mt-2">No active gym membership found.</p>
                <button
                  onClick={() => setShowGymRenewModal(999)}
                  className="mt-3 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow"
                >
                  Join Society Gym
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Facility Bookings (8 Cols) */}
        <div className="lg:col-span-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                Facility Bookings (Clubhouse, Courts, Pool)
              </h3>
              <p className="text-xs text-slate-400">Conflict-free real-time reservation</p>
            </div>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" /> Book Slot
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {facilities.map((fac) => (
              <div key={fac.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-slate-800">{fac.name}</h4>
                    <span className="text-[11px] font-bold text-indigo-600">₹{fac.hourlyRate}/hr</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{fac.description}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                  <span>{fac.timings}</span>
                  <span>Capacity: {fac.capacity}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Complaints, Visitors & Parcels Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Complaints */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-rose-500" />
              My Complaints
            </h3>
            <span className="text-xs font-bold text-slate-400">{myComplaints.length}</span>
          </div>
          <div className="mt-4 space-y-3">
            {myComplaints.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No complaints filed.</p>
            ) : (
              myComplaints.map((c) => (
                <div key={c.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{c.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                  <p className="text-[11px] text-slate-500 mt-1">{c.description}</p>
                  {c.adminResponse && (
                    <div className="mt-2 rounded-lg bg-emerald-50 p-2 text-[10px] text-emerald-800">
                      <strong>Admin Update:</strong> {c.adminResponse}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Visitors */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <QrCode className="h-4 w-4 text-indigo-600" />
              Recent Visitors
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {myVisitors.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No visitors logged.</p>
            ) : (
              myVisitors.map((v) => (
                <div key={v.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{v.visitorName}</span>
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
                  <p className="text-[11px] text-slate-500 mt-1">Pass Code: {v.qrPassCode}</p>
                  <p className="text-[10px] text-slate-400">{v.purpose}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Parcels */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Package className="h-4 w-4 text-amber-500" />
              Parcels at Gate
            </h3>
          </div>
          <div className="mt-4 space-y-3">
            {myParcels.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No pending parcels.</p>
            ) : (
              myParcels.map((p) => (
                <div key={p.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{p.courierCompany}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'Collected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Received: {p.receivedAt}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MY PARKING SLOT & VEHICLES + MY ACTIVE FACILITY RESERVATIONS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Parking Slot Card (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Car className="h-4 w-4 text-emerald-600" />
                My Parking Slot & Vehicle
              </h3>
              <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
                Wing {userFlat.wing}
              </span>
            </div>

            <div className="mt-4">
              {myParking ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-emerald-900">{myParking.slotNumber}</span>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                      Dedicated Allocation
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 pt-1">
                    <p>Vehicle Reg No: <strong className="font-mono text-slate-900">{myParking.vehicleNumber || 'KA-01-AB-1234'}</strong></p>
                    <p>Vehicle Type: <strong>{myParking.vehicleType}</strong></p>
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-emerald-700 font-semibold">
                      {myParking.hasEvCharging ? (
                        <>
                          <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                          <span>EV Charging Station Available at Slot</span>
                        </>
                      ) : (
                        <span>Standard Reserved Slot</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-center">
                  <Car className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700 mt-2">Slot P-001 Assigned to Flat {userFlat.flatNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sedan • Reg: KA-01-AB-1234 • Wing {userFlat.wing} Ground</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
            For additional parking or visitor parking tags, contact Society Security Office.
          </div>
        </div>

        {/* My Active Facility Reservations (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-600" />
                My Active Facility Reservations
              </h3>
              <p className="text-xs text-slate-400">Booked slots for Flat {userFlat.flatNumber}</p>
            </div>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
            >
              <Plus className="h-3.5 w-3.5" /> Book Amenity
            </button>
          </div>

          <div className="mt-4 space-y-2.5">
            {myFacilityBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-slate-400 text-xs">
                No active amenity reservations. Click "+ Book Amenity" above to reserve Clubhouse, Pool, or Tennis Court.
              </div>
            ) : (
              myFacilityBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{b.facilityName}</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        {b.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Date: <strong>{b.bookingDate}</strong> • Slot: <strong>{b.startTime} - {b.endTime}</strong> • Fee: ₹{b.totalAmount}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Purpose: {b.purpose}</p>
                  </div>

                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="rounded-xl border border-rose-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 transition"
                    title="Cancel this reservation"
                  >
                    Cancel Booking
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SOCIETY NOTICES, UPCOMING EVENTS & DEMOCRATIC POLLS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Society Notices (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-indigo-600" />
              Society Notices & Alerts
            </h3>
            <span className="text-xs font-bold text-slate-400">{notices.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {notices.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 line-clamp-1">{n.title}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      n.category === 'Urgent' || n.priority === 'Emergency'
                        ? 'bg-rose-100 text-rose-800'
                        : n.category === 'Security' || n.priority === 'High'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {n.category || n.priority || 'Notice'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{n.content}</p>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-150">
                  <span>{n.publishedBy || 'Management Office'}</span>
                  <span>{n.publishedDate || n.date || 'Today'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-emerald-600" />
              Upcoming Society Events
            </h3>
            <span className="text-xs font-bold text-slate-400">{events.length}</span>
          </div>

          <div className="mt-4 space-y-3">
            {events.slice(0, 3).map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs">
                <h4 className="font-bold text-slate-900">{e.title}</h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{e.description}</p>
                <div className="mt-2 pt-1 border-t border-slate-150 text-[10px] text-slate-500 space-y-0.5">
                  <p>📅 <strong>{e.eventDate}</strong> at {e.eventTime || e.time || '10:00 AM'}</p>
                  <p>📍 {e.location} • Category: {e.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Democratic Polls & Resident Voting (4 cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Vote className="h-4 w-4 text-purple-600" />
              Resident Polls & Voting
            </h3>
            <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Active</span>
          </div>

          <div className="mt-4 space-y-4">
            {polls.slice(0, 2).map((poll) => (
              <div key={poll.id} className="rounded-2xl border border-purple-100 bg-purple-50/30 p-3.5 text-xs">
                <h4 className="font-bold text-slate-900">{poll.title || poll.question}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{poll.description}</p>

                <div className="mt-3 space-y-2">
                  {poll.options.map((opt) => {
                    const pct = poll.totalVotes > 0 ? Math.round((opt.votes / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={opt.id} className="rounded-xl border border-purple-200/80 bg-white p-2">
                        <div className="flex items-center justify-between mb-1">
                          <button
                            onClick={() => votePoll(poll.id, opt.id)}
                            className="text-left font-bold text-slate-800 hover:text-purple-700 transition"
                            title="Click to vote for this option"
                          >
                            {opt.text}
                          </button>
                          <span className="text-[10px] font-mono font-bold text-purple-800">{pct}% ({opt.votes})</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-2 text-[10px] text-slate-400 text-right">
                  Total Votes: {poll.totalVotes} • Closes: {poll.endDate || poll.expiryDate || 'Open'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pay Bill Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Record Maintenance Payment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select payment method to instantly clear dues and generate official receipt.
            </p>
            <div className="mt-4 space-y-2">
              <button
                onClick={() => setPayMode('UPI')}
                className={`w-full rounded-xl border p-3 text-xs font-semibold text-left ${
                  payMode === 'UPI' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'
                }`}
              >
                UPI (GPay, PhonePe, Paytm)
              </button>
              <button
                onClick={() => setPayMode('NetBanking')}
                className={`w-full rounded-xl border p-3 text-xs font-semibold text-left ${
                  payMode === 'NetBanking' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'
                }`}
              >
                Net Banking
              </button>
              <button
                onClick={() => setPayMode('Card')}
                className={`w-full rounded-xl border p-3 text-xs font-semibold text-left ${
                  payMode === 'Card' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200'
                }`}
              >
                Credit / Debit Card
              </button>
            </div>
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setShowPayModal(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePayBill(showPayModal)}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceiptBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border border-slate-100">
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-black mb-2">
                M
              </div>
              <h3 className="text-base font-extrabold text-slate-900">MDG SOCIETY MANAGEMENT</h3>
              <p className="text-xs text-slate-500">Green Valley Residency • Bengaluru, Karnataka</p>
              <span className="inline-block mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                OFFICIAL PAYMENT RECEIPT
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Receipt No:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Flat Number:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.flatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Resident Name:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.residentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Billing Period:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.month}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Paid Date:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.paidDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-bold text-slate-800">{selectedReceiptBill.paymentMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Transaction Ref:</span>
                <span className="font-mono text-slate-700">{selectedReceiptBill.transactionRef}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-slate-900">
                <span>Amount Paid:</span>
                <span className="text-indigo-600">₹ {selectedReceiptBill.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSelectedReceiptBill(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book Facility Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Book Society Facility</h3>
            <p className="text-xs text-slate-500 mt-1">
              Select date and time slot. System will automatically check for overlapping conflicts.
            </p>

            {bookingMessage && (
              <div
                className={`mt-3 p-3 rounded-xl text-xs font-semibold ${
                  bookingMessage.includes('Conflict')
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {bookingMessage}
              </div>
            )}

            <form onSubmit={handleFacilityBooking} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Facility</label>
                <select
                  value={selectedFacilityId}
                  onChange={(e) => setSelectedFacilityId(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-white text-slate-800"
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (₹{f.hourlyRate}/hr)
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
                    value={bookStartTime}
                    onChange={(e) => setBookStartTime(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">End Time</label>
                  <input
                    type="time"
                    value={bookEndTime}
                    onChange={(e) => setBookEndTime(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Event / Purpose</label>
                <input
                  type="text"
                  value={bookPurpose}
                  onChange={(e) => setBookPurpose(e.target.value)}
                  required
                  placeholder="e.g. Birthday Celebration"
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
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor QR Pass Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Pre-Register Guest & Generate QR Pass</h3>

            {!generatedPass ? (
              <form onSubmit={handleGeneratePass} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Guest Full Name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    placeholder="Guest Name"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700">Guest Phone</label>
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
                    placeholder="e.g. KA-05-MN-1234"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowVisitorModal(false)}
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
            ) : (
              <div className="mt-4 text-center">
                {qrDataUrl && (
                  <img src={qrDataUrl} alt="QR Pass" className="mx-auto rounded-xl border p-2 shadow-sm" />
                )}
                <div className="mt-3 text-xs font-mono font-bold text-indigo-700 bg-indigo-50 p-2 rounded-xl">
                  {generatedPass.qrPassCode}
                </div>
                <p className="text-xs text-slate-600 mt-2">
                  Pass for <strong>{generatedPass.visitorName}</strong> visiting Flat {userFlat.flatNumber}.
                </p>
                <button
                  onClick={() => {
                    setGeneratedPass(null);
                    setShowVisitorModal(false);
                  }}
                  className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Add Family Member</h3>
            <form onSubmit={handleAddFamily} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Relation</label>
                <select
                  value={newFamilyRelation}
                  onChange={(e) => setNewFamilyRelation(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Spouse">Spouse</option>
                  <option value="Child">Child</option>
                  <option value="Parent">Parent</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={newFamilyAge}
                    onChange={(e) => setNewFamilyAge(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone (Optional)</label>
                  <input
                    type="text"
                    value={newFamilyPhone}
                    onChange={(e) => setNewFamilyPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log Complaint Modal */}
      {showComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Log Society Complaint</h3>
            <form onSubmit={handleCreateComplaint} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Issue Title</label>
                <input
                  type="text"
                  value={complaintTitle}
                  onChange={(e) => setComplaintTitle(e.target.value)}
                  required
                  placeholder="e.g. Water leakage in balcony"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={complaintCategory}
                    onChange={(e) => setComplaintCategory(e.target.value as any)}
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
                    value={complaintPriority}
                    onChange={(e) => setComplaintPriority(e.target.value as any)}
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
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={complaintDesc}
                  onChange={(e) => setComplaintDesc(e.target.value)}
                  required
                  rows={3}
                  placeholder="Provide details about the issue..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow hover:bg-rose-500"
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
