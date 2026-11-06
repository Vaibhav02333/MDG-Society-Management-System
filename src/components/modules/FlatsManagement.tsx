import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  User,
  Phone,
  Mail,
  CheckCircle2,
  Home,
  Tag,
  Eye,
  X,
  AlertTriangle,
  History,
  FileCheck,
  Printer,
  FileText,
  ShieldCheck,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Flat, OccupancyStatus } from '../../types';
import { MDGLogo } from '../common/MDGLogo';

export interface PurchaseReceiptData {
  receiptNo: string;
  flatNumber: string;
  wing: string;
  floor: number;
  bhk: string;
  areaSqFt: number;
  buyerName: string;
  phone: string;
  email: string;
  emergencyContact: string;
  address: string;
  purchaseAmount: number;
  purchaseDate: string;
  paymentMode: string;
  paymentStatus: string;
  agreementNumber: string;
  remarks: string;
  previousOwner: string;
  timestamp: string;
}

export const FlatsManagement: React.FC = () => {
  const {
    flats,
    updateFlat,
    addFlat,
    deleteFlat,
    purchaseFlat,
    ownershipRecords,
    residents,
    setActiveTab,
  } = useSociety();

  const [selectedWing, setSelectedWing] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [selectedFloor, setSelectedFloor] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Purchase / Ownership transfer modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [targetFlat, setTargetFlat] = useState<Flat | null>(null);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerEmergencyContact, setBuyerEmergencyContact] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [purchaseAmount, setPurchaseAmount] = useState<number>(8500000);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'Bank Transfer / NEFT' | 'UPI' | 'Cheque' | 'Demand Draft'>('Bank Transfer / NEFT');
  const [paymentStatus, setPaymentStatus] = useState('Full Payment Received');
  const [agreementNumber, setAgreementNumber] = useState('');
  const [ownershipStatusChoice, setOwnershipStatusChoice] = useState<'Owner-Occupied' | 'Under Process'>('Owner-Occupied');
  const [purchaseRemarks, setPurchaseRemarks] = useState('');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Purchase Receipt / Allotment Certificate modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastPurchaseReceipt, setLastPurchaseReceipt] = useState<PurchaseReceiptData | null>(null);

  // View Flat Details modal state
  const [viewingFlat, setViewingFlat] = useState<Flat | null>(null);

  // Edit Flat modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editBhk, setEditBhk] = useState<'1BHK' | '2BHK' | '3BHK'>('2BHK');
  const [editArea, setEditArea] = useState(1150);
  const [editMaintenance, setEditMaintenance] = useState(4200);
  const [editStatus, setEditStatus] = useState<OccupancyStatus>('Owner-Occupied');

  // Add Flat modal state
  const [showAddFlatModal, setShowAddFlatModal] = useState(false);
  const [newFlatNumber, setNewFlatNumber] = useState('');
  const [newWing, setNewWing] = useState<'A' | 'B' | 'C'>('A');
  const [newFloor, setNewFloor] = useState(1);
  const [newBhk, setNewBhk] = useState<'1BHK' | '2BHK' | '3BHK'>('2BHK');
  const [newArea, setNewArea] = useState(1150);
  const [newMaintenance, setNewMaintenance] = useState(4200);

  const filteredFlats = flats.filter((f) => {
    const matchesWing = selectedWing === 'ALL' || f.wing === selectedWing;
    const matchesFloor = selectedFloor === 'ALL' || f.floor.toString() === selectedFloor;
    const matchesStatus = selectedStatus === 'ALL' || f.occupancyStatus === selectedStatus;
    const matchesSearch =
      search === '' ||
      f.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      (f.currentOwnerName && f.currentOwnerName.toLowerCase().includes(search.toLowerCase()));
    return matchesWing && matchesFloor && matchesStatus && matchesSearch;
  });

  // Open purchase modal for a specific flat
  const openPurchaseModal = (flat?: Flat) => {
    const available = flat || flats.find((f) => f.occupancyStatus === 'Vacant') || flats[0];
    setTargetFlat(available);
    // CLEAN BLANK FORM FOR LIVE COLLEGE EVALUATION DEMONSTRATION
    setBuyerName('');
    setBuyerPhone('');
    setBuyerEmail('');
    setBuyerEmergencyContact('');
    setBuyerAddress(`Green Valley Residency, Flat ${available.flatNumber}, Bengaluru, Karnataka`);
    setPurchaseAmount(available.purchaseAmount || available.areaSqFt * 6800);
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setPaymentMode('Bank Transfer / NEFT');
    setPaymentStatus('Full Payment Received');
    setAgreementNumber(`AGR-GVR-2025-${available.flatNumber}`);
    setOwnershipStatusChoice('Owner-Occupied');
    setPurchaseRemarks('Official sale deed and society share certificate transfer');
    setPurchaseError(null);
    setShowPurchaseModal(true);
  };

  // When user selects a different flat from dropdown inside purchase modal
  const handleSelectFlatChange = (flatIdStr: string) => {
    const flatId = Number(flatIdStr);
    const selected = flats.find((f) => f.id === flatId);
    if (selected) {
      setTargetFlat(selected);
      setPurchaseAmount(selected.purchaseAmount || selected.areaSqFt * 6800);
      setAgreementNumber(`AGR-GVR-2025-${selected.flatNumber}`);
      setPurchaseError(null);
    }
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFlat) {
      setPurchaseError('Please select a flat to purchase.');
      return;
    }

    if (!buyerName.trim()) {
      setPurchaseError('Buyer Full Name is required.');
      return;
    }

    // 10-digit phone number validation
    const cleanedPhone = buyerPhone.replace(/[^0-9]/g, '');
    if (cleanedPhone.length < 10) {
      setPurchaseError('Buyer phone number must be a valid 10-digit mobile number.');
      return;
    }

    // Email validation
    if (!buyerEmail.trim() || !buyerEmail.includes('@') || !buyerEmail.includes('.')) {
      setPurchaseError('Please enter a valid buyer email address (e.g. buyer@example.com).');
      return;
    }

    // Emergency contact validation if provided
    if (buyerEmergencyContact.trim()) {
      const cleanedEmergency = buyerEmergencyContact.replace(/[^0-9]/g, '');
      if (cleanedEmergency.length > 0 && cleanedEmergency.length < 10) {
        setPurchaseError('Emergency contact number must be a valid 10-digit phone number.');
        return;
      }
    }

    if (!purchaseAmount || purchaseAmount <= 0) {
      setPurchaseError('A valid purchase price amount is required.');
      return;
    }

    // Check if flat is already owned/occupied
    if (targetFlat.occupancyStatus !== 'Vacant') {
      const confirmed = window.confirm(
        `Notice: Flat ${targetFlat.flatNumber} is currently recorded as "${targetFlat.occupancyStatus}" (Current owner: ${targetFlat.currentOwnerName || 'Existing'}). Do you want to execute an official Ownership Deed Transfer to ${buyerName.trim()}?`
      );
      if (!confirmed) return;
    }

    const regAgreementNo = agreementNumber.trim() || `AGR-GVR-2025-${targetFlat.flatNumber}`;
    const formattedRemarks = `${purchaseRemarks} [Mode: ${paymentMode}] [Doc: ${regAgreementNo}] [Status: ${paymentStatus}]`;

    // Execute complete purchase transaction in database context
    const success = purchaseFlat({
      flatId: targetFlat.id,
      buyerName: buyerName.trim(),
      phone: buyerPhone.trim(),
      email: buyerEmail.trim(),
      address: buyerAddress.trim(),
      purchaseAmount: Number(purchaseAmount),
      purchaseDate,
      remarks: formattedRemarks,
    });

    if (success !== false) {
      // Update occupancy status if specific choice made
      if (ownershipStatusChoice !== 'Owner-Occupied') {
        updateFlat(targetFlat.id, { occupancyStatus: ownershipStatusChoice });
      }

      const receiptNo = `MDG-ALLOT-${Date.now().toString().slice(-6)}`;
      const receiptData: PurchaseReceiptData = {
        receiptNo,
        flatNumber: targetFlat.flatNumber,
        wing: targetFlat.wing,
        floor: targetFlat.floor,
        bhk: targetFlat.bhk,
        areaSqFt: targetFlat.areaSqFt,
        buyerName: buyerName.trim(),
        phone: buyerPhone.trim(),
        email: buyerEmail.trim(),
        emergencyContact: buyerEmergencyContact.trim() || 'Not specified',
        address: buyerAddress.trim() || `Flat ${targetFlat.flatNumber}, Green Valley Residency, Bengaluru`,
        purchaseAmount: Number(purchaseAmount),
        purchaseDate,
        paymentMode,
        paymentStatus,
        agreementNumber: regAgreementNo,
        remarks: purchaseRemarks.trim() || 'Official sale deed and society share certificate transfer',
        previousOwner: targetFlat.currentOwnerName || 'Builder Allotment (MDG Society)',
        timestamp: new Date().toLocaleString('en-IN'),
      };

      setLastPurchaseReceipt(receiptData);
      setShowReceiptModal(true);
      setShowPurchaseModal(false);

      setSuccessBanner(
        `✓ Flat ${targetFlat.flatNumber} successfully registered to ${buyerName.trim()}! Agreement: ${regAgreementNo}. View and print the Allotment Certificate below.`
      );

      // Scroll to top to view success
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openEditModal = (flat: Flat) => {
    setTargetFlat(flat);
    setEditBhk(flat.bhk);
    setEditArea(flat.areaSqFt);
    setEditMaintenance(flat.monthlyMaintenanceAmount);
    setEditStatus(flat.occupancyStatus);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetFlat) return;

    updateFlat(targetFlat.id, {
      bhk: editBhk,
      areaSqFt: Number(editArea),
      monthlyMaintenanceAmount: Number(editMaintenance),
      occupancyStatus: editStatus,
    });

    setSuccessBanner(`Flat ${targetFlat.flatNumber} details successfully updated.`);
    setShowEditModal(false);
    setTargetFlat(null);
  };

  const handleAddFlatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlatNumber.trim()) return;

    // Check duplicate
    if (flats.some((f) => f.flatNumber.toLowerCase() === newFlatNumber.trim().toLowerCase())) {
      alert(`Flat number ${newFlatNumber.trim()} already exists! Cannot add duplicates.`);
      return;
    }

    addFlat({
      flatNumber: newFlatNumber.trim().toUpperCase(),
      wing: newWing,
      floor: Number(newFloor),
      bhk: newBhk,
      areaSqFt: Number(newArea),
      occupancyStatus: 'Vacant',
      monthlyMaintenanceAmount: Number(newMaintenance),
    });

    setSuccessBanner(`Flat ${newFlatNumber.trim().toUpperCase()} added to Wing ${newWing}.`);
    setShowAddFlatModal(false);
    setNewFlatNumber('');
  };

  return (
    <div className="space-y-6">
      {/* Success Notification Banner */}
      {successBanner && (
        <div className="flex items-center justify-between rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{successBanner}</p>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Society Overview Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-emerald-600" />
            All 48 Flats Directory
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Displaying all 48 Flats across Wing A, Wing B, and Wing C at Green Valley Residency, Bengaluru. Complete ownership registration and transfer tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* College Demo Purchase Button */}
          <button
            onClick={() => openPurchaseModal()}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
            title="Demonstrate registering a flat purchase in front of college evaluator"
          >
            <DollarSign className="h-4 w-4" />
            <span>Register New Buyer / Purchase Flat</span>
          </button>

          <button
            onClick={() => setShowAddFlatModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Flat</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-100">
        {/* Wing Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1">Wing:</span>
          {(['ALL', 'A', 'B', 'C'] as const).map((wing) => (
            <button
              key={wing}
              onClick={() => setSelectedWing(wing)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedWing === wing
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {wing === 'ALL' ? 'All Wings' : `Wing ${wing}`}
            </button>
          ))}
        </div>

        {/* Floor and Status Dropdowns & Search */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Floor filter */}
          <select
            value={selectedFloor}
            onChange={(e) => setSelectedFloor(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Floors</option>
            <option value="1">Floor 1</option>
            <option value="2">Floor 2</option>
            <option value="3">Floor 3</option>
            <option value="4">Floor 4</option>
          </select>

          {/* Occupancy status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Occupancies</option>
            <option value="Owner-Occupied">Owner-Occupied</option>
            <option value="Tenant-Occupied">Tenant-Occupied</option>
            <option value="Vacant">Vacant</option>
            <option value="Under Process">Under Process</option>
          </select>

          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flat no or owner..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-200"
            />
          </div>
        </div>
      </div>

      {/* Flats Statistics Counter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl bg-white p-3 border border-slate-100 shadow-sm flex items-center justify-between">
          <span className="text-slate-500 font-medium">Total Flats</span>
          <span className="font-extrabold text-slate-900 text-sm">{flats.length}</span>
        </div>
        <div className="rounded-xl bg-emerald-50/50 p-3 border border-emerald-100 shadow-sm flex items-center justify-between">
          <span className="text-emerald-700 font-medium">Owner-Occupied</span>
          <span className="font-extrabold text-emerald-800 text-sm">
            {flats.filter((f) => f.occupancyStatus === 'Owner-Occupied').length}
          </span>
        </div>
        <div className="rounded-xl bg-blue-50/50 p-3 border border-blue-100 shadow-sm flex items-center justify-between">
          <span className="text-blue-700 font-medium">Tenant-Occupied</span>
          <span className="font-extrabold text-blue-800 text-sm">
            {flats.filter((f) => f.occupancyStatus === 'Tenant-Occupied').length}
          </span>
        </div>
        <div className="rounded-xl bg-amber-50/50 p-3 border border-amber-100 shadow-sm flex items-center justify-between">
          <span className="text-amber-700 font-medium">Vacant / Available</span>
          <span className="font-extrabold text-amber-800 text-sm">
            {flats.filter((f) => f.occupancyStatus === 'Vacant' || f.occupancyStatus === 'Under Process').length}
          </span>
        </div>
      </div>

      {/* Flats Directory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredFlats.map((flat) => {
          const tenant = residents.find((r) => r.flatId === flat.id && r.type === 'Tenant');

          return (
            <div
              key={flat.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-extrabold text-slate-900">{flat.flatNumber}</span>
                    <span className="text-[10px] font-bold rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600">
                      Wing {flat.wing}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      flat.occupancyStatus === 'Owner-Occupied'
                        ? 'bg-emerald-100 text-emerald-700'
                        : flat.occupancyStatus === 'Tenant-Occupied'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {flat.occupancyStatus}
                  </span>
                </div>

                <div className="mt-2.5 text-xs text-slate-500 space-y-1">
                  <p>
                    Floor {flat.floor} • {flat.bhk} • {flat.areaSqFt} Sq Ft
                  </p>
                  <p className="font-medium text-slate-600">
                    Maintenance: ₹{flat.monthlyMaintenanceAmount.toLocaleString()}/mo
                  </p>
                </div>

                {/* Owner info card */}
                <div className="mt-3 rounded-xl bg-slate-50 p-2.5 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Owner</span>
                  <p className="font-semibold text-slate-800 truncate">
                    {flat.currentOwnerName || 'Builder Allotment'}
                  </p>
                  {flat.currentOwnerPhone && (
                    <p className="text-[11px] text-slate-500 mt-0.5">{flat.currentOwnerPhone}</p>
                  )}
                  {flat.occupancyStatus === 'Tenant-Occupied' && tenant && (
                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-blue-500">Tenant</span>
                      <p className="font-medium text-slate-700 truncate">{tenant.fullName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5">
                <button
                  onClick={() => openPurchaseModal(flat)}
                  className="flex-1 rounded-xl bg-emerald-50 px-2 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                  title="Purchase or Transfer Ownership"
                >
                  Transfer / Buy
                </button>
                <button
                  onClick={() => setViewingFlat(flat)}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition"
                  title="View Flat Details & History"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => openEditModal(flat)}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 transition"
                  title="Edit Flat Details"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteFlat(flat.id)}
                  className="rounded-xl border border-slate-200 p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Safe Delete Flat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFlats.length === 0 && (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500">
          <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h4 className="font-bold text-slate-700 text-base">No Flats Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your Wing, Floor, or Occupancy search filters.
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. FLAT PURCHASE AND NEW BUYER REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {showPurchaseModal && targetFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl text-slate-800 animate-in fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Flat Purchase & New Buyer Registration
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Demonstration Form • Saves directly into MySQL database and records permanent ownership deed history.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPurchaseModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {purchaseError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{purchaseError}</span>
              </div>
            )}

            <form onSubmit={handlePurchaseSubmit} className="mt-4 space-y-4">
              {/* Flat Selection & Specifications Preview */}
              <div className="rounded-2xl bg-emerald-50/50 border border-emerald-100 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Select Available Flat <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={targetFlat.id}
                      onChange={(e) => handleSelectFlatChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800"
                    >
                      {flats.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.flatNumber} (Wing {f.wing}, {f.bhk}, {f.occupancyStatus})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">Specifications</span>
                    <div className="text-xs text-slate-600 bg-white rounded-xl border border-slate-200 p-2 leading-tight">
                      <div>
                        Wing <strong>{targetFlat.wing}</strong> • Floor <strong>{targetFlat.floor}</strong> •{' '}
                        <strong>{targetFlat.bhk}</strong>
                      </div>
                      <div className="mt-0.5 text-slate-500">
                        Area: <strong>{targetFlat.areaSqFt} sq ft</strong> • Current:{' '}
                        <span className="text-emerald-700 font-semibold">{targetFlat.occupancyStatus}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-emerald-100/80 text-[11px] text-slate-500 flex justify-between">
                  <span>Previous Owner: <strong>{targetFlat.currentOwnerName || 'Builder Allotment'}</strong></span>
                  <span>Flat ID: <strong>#{targetFlat.id}</strong> (Original primary key)</span>
                </div>
              </div>

              {/* Buyer Information Section (Blank for demo entry) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. New Buyer Personal Details
                  </h4>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    Blank for Live Demonstration
                  </span>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Buyer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    placeholder="Enter buyer full name (e.g. Ramesh Chandra)"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Phone Number (10-digits) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={buyerEmail}
                      onChange={(e) => setBuyerEmail(e.target.value)}
                      required
                      placeholder="buyer@example.com"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Emergency Contact Number
                    </label>
                    <input
                      type="tel"
                      value={buyerEmergencyContact}
                      onChange={(e) => setBuyerEmergencyContact(e.target.value)}
                      maxLength={10}
                      placeholder="9811122233 (Next of Kin)"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Permanent / Current Address
                    </label>
                    <input
                      type="text"
                      value={buyerAddress}
                      onChange={(e) => setBuyerAddress(e.target.value)}
                      placeholder="Flat address or previous residence"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Purchase Financials and Deed Details */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  2. Transaction, Payment Mode & Deed Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Total Purchase Price (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={purchaseAmount}
                      onChange={(e) => setPurchaseAmount(Number(e.target.value))}
                      required
                      min={100000}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 font-bold focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Purchase / Registration Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={purchaseDate}
                      onChange={(e) => setPurchaseDate(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Payment Mode <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-800"
                    >
                      <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                      <option value="UPI">UPI (Instant Verification)</option>
                      <option value="Cheque">Cheque (Sub-registrar verified)</option>
                      <option value="Demand Draft">Demand Draft (Bank Allotment)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Payment Status
                    </label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800"
                    >
                      <option value="Full Payment Received">Full Payment Received</option>
                      <option value="Bank Loan Approved & Disbursed">Bank Loan Approved & Disbursed</option>
                      <option value="Cheque Cleared">Cheque Cleared</option>
                      <option value="Installment Scheduled">Installment Scheduled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Agreement / Registration Doc No.
                    </label>
                    <input
                      type="text"
                      value={agreementNumber}
                      onChange={(e) => setAgreementNumber(e.target.value)}
                      placeholder="e.g. AGR-GVR-2025-A101"
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 font-mono focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      New Occupancy Status
                    </label>
                    <select
                      value={ownershipStatusChoice}
                      onChange={(e) => setOwnershipStatusChoice(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800"
                    >
                      <option value="Owner-Occupied">Owner-Occupied</option>
                      <option value="Under Process">Under Process (Pending Possession)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Transaction Remarks / Sub-Registrar Notes
                  </label>
                  <input
                    type="text"
                    value={purchaseRemarks}
                    onChange={(e) => setPurchaseRemarks(e.target.value)}
                    placeholder="e.g. Registered sale deed and ownership transfer in society records"
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  <FileCheck className="h-4 w-4" />
                  <span>Execute Purchase & Generate Deed</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4.1 OFFICIAL ALLOTMENT CERTIFICATE & PURCHASE RECEIPT MODAL */}
      {/* ========================================================================= */}
      {showReceiptModal && lastPurchaseReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl text-slate-800 animate-in fade-in zoom-in-95 my-8 border border-emerald-200">
            {/* Modal Top Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Official Society Allotment Dossier
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  title="Print official allotment receipt"
                >
                  <Printer className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Certificate Body (Clean format suitable for printing & demo evaluation) */}
            <div className="mt-6 rounded-2xl border-2 border-emerald-600/30 bg-gradient-to-b from-emerald-50/20 via-white to-slate-50/40 p-6 sm:p-8 relative overflow-hidden">
              {/* Background Watermark */}
              <div className="absolute right-4 bottom-4 opacity-5 pointer-events-none select-none">
                <Building2 className="h-64 w-64 text-emerald-950" />
              </div>

              {/* Official Society Letterhead */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-slate-800 pb-4">
                <MDGLogo variant="full" size="md" />
                <div className="text-right text-[11px] text-slate-500 space-y-0.5">
                  <p className="font-bold text-slate-900 text-xs">GREEN VALLEY RESIDENCY</p>
                  <p>Reg No: BLR/SOC/2024/9821 • Karnataka Societies Act</p>
                  <p>Outer Ring Road, Bengaluru - 560103</p>
                </div>
              </div>

              {/* Certificate Title */}
              <div className="mt-5 text-center">
                <span className="inline-block rounded-full bg-emerald-100 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800">
                  Ownership Allotment & Share Certificate
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  FLAT ALLOTMENT & PURCHASE RECEIPT
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Certificate No: <strong className="text-emerald-800">{lastPurchaseReceipt.receiptNo}</strong> • Date: {lastPurchaseReceipt.purchaseDate}
                </p>
              </div>

              {/* Allotment Particulars */}
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Left: Buyer Details */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Allottee / Registered Owner</span>
                  <p className="text-sm font-extrabold text-slate-900">{lastPurchaseReceipt.buyerName}</p>
                  <p className="text-slate-600">Mobile: <strong>+91 {lastPurchaseReceipt.phone}</strong></p>
                  <p className="text-slate-600">Email: {lastPurchaseReceipt.email}</p>
                  <p className="text-slate-600">Emergency Contact: {lastPurchaseReceipt.emergencyContact}</p>
                  <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                    Address: {lastPurchaseReceipt.address}
                  </p>
                </div>

                {/* Right: Flat Specifications */}
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5 shadow-sm">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Allotted Property Particulars</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold text-emerald-800">Flat {lastPurchaseReceipt.flatNumber}</span>
                    <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Wing {lastPurchaseReceipt.wing}
                    </span>
                  </div>
                  <p className="text-slate-600">Floor: <strong>Floor {lastPurchaseReceipt.floor}</strong></p>
                  <p className="text-slate-600">Configuration: <strong>{lastPurchaseReceipt.bhk} Luxury Suite</strong></p>
                  <p className="text-slate-600">Super Built-up Area: <strong>{lastPurchaseReceipt.areaSqFt} Sq Ft</strong></p>
                  <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                    Previous Holder: {lastPurchaseReceipt.previousOwner}
                  </p>
                </div>
              </div>

              {/* Financial & Legal Summary */}
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Total Purchase Value</span>
                    <p className="text-sm font-black text-slate-900 mt-0.5">
                      ₹{lastPurchaseReceipt.purchaseAmount.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Payment Mode</span>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{lastPurchaseReceipt.paymentMode}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Payment Status</span>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">{lastPurchaseReceipt.paymentStatus}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-500">Agreement No.</span>
                    <p className="text-xs font-bold text-indigo-700 font-mono mt-0.5">{lastPurchaseReceipt.agreementNumber}</p>
                  </div>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[11px] text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-1">
                  <span>Remarks: <strong>{lastPurchaseReceipt.remarks}</strong></span>
                  <span className="text-emerald-700 font-semibold">Saved to MySQL database: mdg_society_management_db</span>
                </div>
              </div>

              {/* Authorized Signatories Footer */}
              <div className="mt-8 pt-6 border-t border-slate-300 flex items-end justify-between text-center text-[10px] text-slate-500">
                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 w-36 mx-auto flex items-center justify-center text-[10px] text-slate-400 italic">
                    {lastPurchaseReceipt.buyerName}
                  </div>
                  <p className="font-semibold text-slate-700">Allottee Signature</p>
                </div>

                <div className="text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-emerald-700 bg-emerald-50 text-[9px] font-black uppercase text-emerald-800">
                    MDG SEAL
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">Official Society Stamp</p>
                </div>

                <div className="space-y-1">
                  <div className="h-10 border-b border-dashed border-slate-400 w-36 mx-auto flex items-center justify-center text-[10px] text-emerald-800 font-bold">
                    Admin / Secretary
                  </div>
                  <p className="font-semibold text-slate-700">Society Secretary Signature</p>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => {
                  setShowReceiptModal(false);
                  setActiveTab('ownership');
                }}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
              >
                <History className="h-4 w-4" />
                <span>View in Ownership History & Deeds</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Official Certificate</span>
                </button>
                <button
                  onClick={() => setShowReceiptModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. VIEW FLAT DETAILS MODAL */}
      {/* ========================================================================= */}
      {viewingFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl text-slate-800 animate-in fade-in my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  {viewingFlat.wing}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Flat {viewingFlat.flatNumber} Specifications
                  </h3>
                  <p className="text-xs text-slate-500">Green Valley Residency • Bengaluru, Karnataka</p>
                </div>
              </div>
              <button
                onClick={() => setViewingFlat(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Key Specs Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Wing</span>
                  <div className="font-extrabold text-slate-800 text-sm">{viewingFlat.wing}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Floor</span>
                  <div className="font-extrabold text-slate-800 text-sm">{viewingFlat.floor}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">BHK</span>
                  <div className="font-extrabold text-slate-800 text-sm">{viewingFlat.bhk}</div>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Area</span>
                  <div className="font-extrabold text-slate-800 text-sm">{viewingFlat.areaSqFt} sq ft</div>
                </div>
              </div>

              {/* Ownership & Occupancy */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Occupancy Status:</span>
                  <span className="font-bold text-emerald-700">{viewingFlat.occupancyStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Owner:</span>
                  <span className="font-bold text-slate-800">{viewingFlat.currentOwnerName || 'Builder Allotment'}</span>
                </div>
                {viewingFlat.currentOwnerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Owner Phone:</span>
                    <span className="font-medium text-slate-700">{viewingFlat.currentOwnerPhone}</span>
                  </div>
                )}
                {viewingFlat.currentOwnerEmail && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Owner Email:</span>
                    <span className="font-medium text-slate-700">{viewingFlat.currentOwnerEmail}</span>
                  </div>
                )}
                {viewingFlat.purchaseDate && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchase Date:</span>
                    <span className="font-medium text-slate-700">{viewingFlat.purchaseDate}</span>
                  </div>
                )}
                {viewingFlat.purchaseAmount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Purchase Amount:</span>
                    <span className="font-bold text-emerald-800">₹{viewingFlat.purchaseAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Monthly Maintenance:</span>
                  <span className="font-bold text-slate-900">₹{viewingFlat.monthlyMaintenanceAmount.toLocaleString()} / month</span>
                </div>
              </div>

              {/* Flat Ownership History Records */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5" />
                  Ownership Transfer Deed History
                </h4>
                {ownershipRecords.filter((r) => r.flatId === viewingFlat.id).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">Original Builder Allotment (no subsequent transfers recorded).</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {ownershipRecords
                      .filter((r) => r.flatId === viewingFlat.id)
                      .map((rec) => (
                        <div key={rec.id} className="rounded-xl border border-slate-100 bg-white p-2.5 text-xs shadow-xs">
                          <div className="flex justify-between font-semibold text-slate-800">
                            <span>Transferred to {rec.buyerName}</span>
                            <span className="text-emerald-700">₹{rec.purchaseAmount.toLocaleString()}</span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex justify-between">
                            <span>From: {rec.previousOwnerName}</span>
                            <span>Date: {rec.purchaseDate}</span>
                          </div>
                          {rec.remarks && <p className="text-[10px] text-slate-400 mt-1">{rec.remarks}</p>}
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setViewingFlat(null);
                    openPurchaseModal(viewingFlat);
                  }}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  Transfer / Purchase This Flat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Flat Modal */}
      {showEditModal && targetFlat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Edit className="h-4 w-4 text-emerald-600" />
              Edit Flat {targetFlat.flatNumber}
            </h3>
            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">BHK Configuration</label>
                <select
                  value={editBhk}
                  onChange={(e) => setEditBhk(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                >
                  <option value="1BHK">1BHK</option>
                  <option value="2BHK">2BHK</option>
                  <option value="3BHK">3BHK</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    value={editArea}
                    onChange={(e) => setEditArea(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Maintenance (₹)</label>
                  <input
                    type="number"
                    value={editMaintenance}
                    onChange={(e) => setEditMaintenance(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Occupancy Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                >
                  <option value="Owner-Occupied">Owner-Occupied</option>
                  <option value="Tenant-Occupied">Tenant-Occupied</option>
                  <option value="Vacant">Vacant</option>
                  <option value="Under Process">Under Process</option>
                </select>
              </div>
              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add New Flat Modal */}
      {showAddFlatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 animate-in fade-in">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Plus className="h-4 w-4 text-emerald-600" />
              Add New Society Flat
            </h3>
            <form onSubmit={handleAddFlatSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Flat Number (e.g. A-501)</label>
                <input
                  type="text"
                  value={newFlatNumber}
                  onChange={(e) => setNewFlatNumber(e.target.value)}
                  required
                  placeholder="e.g. A-501 or C-303"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Wing</label>
                  <select
                    value={newWing}
                    onChange={(e) => setNewWing(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                  >
                    <option value="A">Wing A</option>
                    <option value="B">Wing B</option>
                    <option value="C">Wing C</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Floor</label>
                  <input
                    type="number"
                    value={newFloor}
                    onChange={(e) => setNewFloor(Number(e.target.value))}
                    min={1}
                    max={20}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">BHK</label>
                  <select
                    value={newBhk}
                    onChange={(e) => setNewBhk(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs"
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Area (sq ft)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(Number(e.target.value))}
                    required
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Monthly Maintenance (₹)</label>
                <input
                  type="number"
                  value={newMaintenance}
                  onChange={(e) => setNewMaintenance(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs"
                />
              </div>
              <div className="mt-5 flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddFlatModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-700"
                >
                  Add Flat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
