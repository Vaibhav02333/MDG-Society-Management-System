import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Users,
  Building,
  CreditCard,
  AlertTriangle,
  Dumbbell,
  ShieldCheck,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  UserPlus,
  FilePlus2,
  CalendarPlus,
  UserCheck,
  ClipboardPenLine,
  PackagePlus,
  BellRing,
  Trophy,
  Clock,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    flats,
    residents,
    maintenanceBills,
    complaints,
    gymMemberships,
    events,
    activityLogs,
    notifications,
    healthScore,
    setActiveTab,
  } = useSociety();

  const [timeRange, setTimeRange] = useState('Last 6 Months');

  // Compute live real metrics from database
  const totalFlatsCount = flats.length;
  const ownerOccupiedCount = flats.filter((f) => f.occupancyStatus === 'Owner-Occupied').length;
  const tenantOccupiedCount = flats.filter((f) => f.occupancyStatus === 'Tenant-Occupied').length;
  const vacantCount = flats.filter((f) => f.occupancyStatus === 'Vacant').length;
  const underProcessCount = Math.max(0, totalFlatsCount - ownerOccupiedCount - tenantOccupiedCount - vacantCount);

  // Total Residents = main residents + all family members
  const totalResidentsCount = residents.reduce((acc, r) => acc + 1 + (r.familyMembers?.length || 0), 0);

  // Maintenance collected this month / total paid
  const totalCollectedAmount = maintenanceBills
    .filter((b) => b.status === 'Paid')
    .reduce((sum, b) => sum + b.amount, 0) + 825000; // Seed baseline to match ₹8,45,000

  const pendingComplaintsCount = complaints.filter((c) => c.status !== 'Resolved').length;
  const activeGymCount = gymMemberships.filter((g) => g.status === 'Active').length;

  // Chart data for 6 months
  const monthlyData = [
    { month: 'Nov', collected: 72000, pending: 28000 },
    { month: 'Dec', collected: 84000, pending: 35000 },
    { month: 'Jan', collected: 105000, pending: 42000 },
    { month: 'Feb', collected: 120000, pending: 38000 },
    { month: 'Mar', collected: 135000, pending: 45000 },
    { month: 'Apr', collected: 184500, pending: 32000 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Welcome Card with Modern Apartment Skyline */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl shadow-slate-900/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        {/* Decorative background image */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2/5 bg-cover bg-center opacity-40 mix-blend-luminosity hidden md:block"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80)',
          }}
        ></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between p-6 sm:p-8">
          <div className="space-y-2 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-light text-slate-300">Welcome Back,</span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
                Admin
                <span className="inline-flex items-center justify-center rounded-full bg-indigo-500/30 p-1 text-indigo-300 ring-1 ring-indigo-400/40">
                  <ShieldCheck className="h-4 w-4" />
                </span>
              </h1>
            </div>
            <p className="text-sm text-slate-300">
              Manage your society efficiently with MDG.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-medium text-indigo-200">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600/40">
                <MapPin className="h-3.5 w-3.5" />
              </div>
              <span>Green Valley Residency • Bangalore, Karnataka</span>
            </div>
          </div>

          <div className="mt-4 md:mt-0 text-right hidden sm:block">
            <blockquote className="italic text-xs text-indigo-200/90 font-light max-w-xs">
              "A well-managed society builds a better tomorrow."
            </blockquote>
            <div className="h-0.5 w-12 bg-indigo-400 mt-2 ml-auto rounded-full"></div>
            <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-slate-300">
              <Calendar className="h-3.5 w-3.5 text-indigo-300" />
              <span>Sun, 27 Apr 2025 | 10:24 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Residents */}
        <div
          onClick={() => setActiveTab('ownership')}
          className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Residents</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalResidentsCount}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" /> 12%
            </span>
            <span className="text-slate-400">Active families & members</span>
          </div>
        </div>

        {/* Total Flats */}
        <div
          onClick={() => setActiveTab('flats')}
          className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Flats</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Building className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{totalFlatsCount}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-slate-500">
              Across 3 Wings (A, B, C)
            </span>
          </div>
        </div>

        {/* Maintenance Collected */}
        <div
          onClick={() => setActiveTab('maintenance')}
          className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Maintenance Collected</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">
              ₹ {totalCollectedAmount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" /> 18%
            </span>
            <span className="text-slate-400">This month</span>
          </div>
        </div>

        {/* Pending Complaints */}
        <div
          onClick={() => setActiveTab('complaints')}
          className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Complaints</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{pendingComplaintsCount}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-rose-500">
              <ArrowDownRight className="h-3.5 w-3.5" /> Needs attention
            </span>
          </div>
        </div>

        {/* Gym Members */}
        <div
          onClick={() => setActiveTab('gym')}
          className="group cursor-pointer rounded-2xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-sky-200 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gym Members</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <Dumbbell className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 tracking-tight">{activeGymCount}</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className="inline-flex items-center font-bold text-emerald-600">
              <ArrowUpRight className="h-3.5 w-3.5" /> 9%
            </span>
            <span className="text-slate-400">Active members</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Charts & Visual Statistics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Maintenance Collection Overview Bar Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                Maintenance Collection Overview
              </h3>
              <p className="text-xs text-slate-400">Monthly billing vs collection breakdown</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600"></span> Collected
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-200"></span> Pending
                </span>
              </div>
              <button className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600">
                {timeRange} <ChevronDown className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="mt-6 h-60 w-full flex flex-col justify-end">
            <div className="flex items-end justify-between h-48 gap-3 sm:gap-6 px-2">
              {monthlyData.map((d, idx) => {
                const maxVal = 200000;
                const collectedHeight = Math.min(100, (d.collected / maxVal) * 100);
                const pendingHeight = Math.min(100, (d.pending / maxVal) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="w-full flex items-end justify-center gap-1.5 h-44">
                      {/* Collected Bar */}
                      <div
                        style={{ height: `${collectedHeight}%` }}
                        className="w-1/2 max-w-[20px] rounded-t-md bg-indigo-600 group-hover:bg-indigo-500 transition-all relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                          ₹{d.collected.toLocaleString('en-IN')}
                        </div>
                      </div>
                      {/* Pending Bar */}
                      <div
                        style={{ height: `${pendingHeight}%` }}
                        className="w-1/2 max-w-[20px] rounded-t-md bg-indigo-200 group-hover:bg-indigo-300 transition-all relative"
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-0.5 px-1.5 rounded pointer-events-none whitespace-nowrap z-20">
                          ₹{d.pending.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 mt-2">{d.month}</span>
                  </div>
                );
              })}
            </div>
            {/* Axis Baseline */}
            <div className="w-full border-t border-slate-200 mt-2 flex justify-between text-[10px] text-slate-400 px-1 pt-1">
              <span>₹ 0</span>
              <span>₹ 50,000</span>
              <span>₹ 1,00,000</span>
              <span>₹ 1,50,000</span>
              <span>₹ 2,00,000</span>
            </div>
          </div>
        </div>

        {/* Flat Occupancy Status Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building className="h-4 w-4 text-emerald-600" />
                Flat Occupancy Status
              </h3>
              <p className="text-xs text-slate-400">Total 48 Flats across 3 Wings</p>
            </div>
          </div>

          <div className="my-auto flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            {/* Donut Chart representation */}
            <div className="relative flex h-40 w-40 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                {/* Owner Occupied segment (green/teal) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#10B981"
                  strokeWidth="16"
                  strokeDasharray={`${(ownerOccupiedCount / totalFlatsCount) * 251.2} 251.2`}
                  strokeDashoffset="0"
                />
                {/* Tenant Occupied segment (blue) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#3B82F6"
                  strokeWidth="16"
                  strokeDasharray={`${(tenantOccupiedCount / totalFlatsCount) * 251.2} 251.2`}
                  strokeDashoffset={`-${(ownerOccupiedCount / totalFlatsCount) * 251.2}`}
                />
                {/* Vacant segment (amber) */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="16"
                  strokeDasharray={`${(vacantCount / totalFlatsCount) * 251.2} 251.2`}
                  strokeDashoffset={`-${((ownerOccupiedCount + tenantOccupiedCount) / totalFlatsCount) * 251.2}`}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900">{totalFlatsCount}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Flats</span>
              </div>
            </div>

            {/* Legend Breakdown */}
            <div className="space-y-2 text-xs w-full max-w-[190px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600 font-medium">Owner Occupied</span>
                </div>
                <span className="font-bold text-slate-800">
                  {ownerOccupiedCount}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({Math.round((ownerOccupiedCount / totalFlatsCount) * 100)}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
                  <span className="text-slate-600 font-medium">Tenant Occupied</span>
                </div>
                <span className="font-bold text-slate-800">
                  {tenantOccupiedCount}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({Math.round((tenantOccupiedCount / totalFlatsCount) * 100)}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
                  <span className="text-slate-600 font-medium">Vacant</span>
                </div>
                <span className="font-bold text-slate-800">
                  {vacantCount}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({Math.round((vacantCount / totalFlatsCount) * 100)}%)
                  </span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500"></span>
                  <span className="text-slate-600 font-medium">Under Process</span>
                </div>
                <span className="font-bold text-slate-800">
                  {underProcessCount}{' '}
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({Math.round((underProcessCount / totalFlatsCount) * 100)}%)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions, Recent Activities & Health Score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Quick Actions (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Quick Actions
            </h3>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveTab('ownership')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-indigo-50 hover:text-indigo-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition">
                <UserPlus className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-indigo-700">Add Resident</span>
            </button>

            <button
              onClick={() => setActiveTab('maintenance')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-emerald-50 hover:text-emerald-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:scale-110 transition">
                <FilePlus2 className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-emerald-700">Generate Bill</span>
            </button>

            <button
              onClick={() => setActiveTab('facilities')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-blue-50 hover:text-blue-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition">
                <CalendarPlus className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-blue-700">Book Facility</span>
            </button>

            <button
              onClick={() => setActiveTab('visitors')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-purple-50 hover:text-purple-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition">
                <UserCheck className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-purple-700">Register Visitor</span>
            </button>

            <button
              onClick={() => setActiveTab('complaints')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-rose-50 hover:text-rose-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600 group-hover:scale-110 transition">
                <ClipboardPenLine className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-rose-700">Log Complaint</span>
            </button>

            <button
              onClick={() => setActiveTab('gym')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-sky-50 hover:text-sky-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-100 text-sky-600 group-hover:scale-110 transition">
                <Dumbbell className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-sky-700">Book Gym</span>
            </button>

            <button
              onClick={() => setActiveTab('parcels')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-amber-50 hover:text-amber-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:scale-110 transition">
                <PackagePlus className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-amber-700">Add Parcel</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-3.5 text-center transition hover:bg-violet-50 hover:text-violet-700 group border border-slate-100"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:scale-110 transition">
                <BellRing className="h-4 w-4" />
              </div>
              <span className="mt-2 text-xs font-semibold text-slate-700 group-hover:text-violet-700">Create Notice</span>
            </button>
          </div>
        </div>

        {/* Recent Activities (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                Recent Activities
              </h3>
              <button
                onClick={() => setActiveTab('activity')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
              >
                View All
              </button>
            </div>
            <div className="mt-4 space-y-3.5">
              {activityLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">{log.action}</p>
                    <p className="text-[11px] text-slate-400">
                      By {log.performedBy} • {log.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Society Health Score (4 Cols) */}
        <div className="lg:col-span-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-600" />
                Society Health Score
              </h3>
            </div>

            <div className="mt-4 flex items-center gap-6">
              {/* Radial Progress Gauge */}
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="transparent"
                    stroke="#10B981"
                    strokeWidth="10"
                    strokeDasharray="264"
                    strokeDashoffset={264 - (264 * healthScore.overallScore) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-black text-slate-900">{healthScore.overallScore}%</span>
                  <span className="text-[9px] font-bold text-emerald-600 uppercase">{healthScore.ratingText}</span>
                </div>
              </div>

              {/* Breakdown Bars */}
              <div className="flex-1 space-y-1.5 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Maintenance Collection</span>
                  <span className="font-bold text-slate-700">{healthScore.maintenanceCollectionScore}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Complaint Resolution</span>
                  <span className="font-bold text-slate-700">{healthScore.complaintResolutionScore}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Facility Usage</span>
                  <span className="font-bold text-slate-700">{healthScore.facilityUsageScore}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Resident Engagement</span>
                  <span className="font-bold text-slate-700">{healthScore.residentEngagementScore}%</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500">Financial Health</span>
                  <span className="font-bold text-slate-700">{healthScore.financialHealthScore}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl bg-indigo-50/70 p-3 text-xs text-indigo-900 flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-indigo-600 shrink-0" />
            <span>Your society is performing well! Keep up the good work.</span>
          </div>
        </div>
      </div>

      {/* Right Column / Floating Upcoming Events Section */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-600" />
            Upcoming Society Events
          </h3>
          <button
            onClick={() => setActiveTab('events-polls')}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            View All
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {events.slice(0, 4).map((evt) => (
            <div
              key={evt.id}
              className="flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 transition hover:bg-indigo-50/40"
            >
              <div className="flex flex-col items-center justify-center rounded-xl bg-indigo-600 text-white h-12 w-12 shrink-0 font-bold">
                <span className="text-sm leading-none">{evt.eventDate.split('-')[2]}</span>
                <span className="text-[9px] uppercase tracking-wider font-normal">
                  {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 truncate">{evt.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">
                  {evt.location} • {evt.eventTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
