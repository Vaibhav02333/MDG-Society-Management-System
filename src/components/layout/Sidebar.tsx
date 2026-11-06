import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  LayoutDashboard,
  Building2,
  Users,
  CreditCard,
  Dumbbell,
  CalendarDays,
  QrCode,
  Car,
  AlertCircle,
  Package,
  Vote,
  Megaphone,
  Wallet,
  FolderLock,
  BarChart3,
  Activity,
  Settings,
  ChevronRight,
  ShieldAlert,
  Download,
} from 'lucide-react';
import { MDGLogo } from '../common/MDGLogo';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  roles?: ('ADMIN' | 'RESIDENT' | 'SECURITY')[];
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser } = useSociety();

  const userRole = currentUser?.role || 'ADMIN';

  const allNavItems: NavItem[] = [
    {
      id: 'dashboard',
      label: userRole === 'RESIDENT' ? 'My Flat Dashboard' : userRole === 'SECURITY' ? 'Security Gate Console' : 'Executive Dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'RESIDENT', 'SECURITY'],
    },
    { id: 'flats', label: 'Society & Flat Management', icon: Building2, roles: ['ADMIN'] },
    { id: 'ownership', label: 'Ownership & Residents', icon: Users, roles: ['ADMIN'] },
    {
      id: 'maintenance',
      label: userRole === 'RESIDENT' ? 'My Maintenance & Bills' : 'Maintenance & Payments',
      icon: CreditCard,
      roles: ['ADMIN', 'RESIDENT'],
    },
    {
      id: 'facilities',
      label: userRole === 'RESIDENT' ? 'Facility Booking' : 'Facility Management',
      icon: CalendarDays,
      roles: ['ADMIN', 'RESIDENT'],
    },
    {
      id: 'gym',
      label: userRole === 'RESIDENT' ? 'My Gym Membership' : 'Gym Management',
      icon: Dumbbell,
      roles: ['ADMIN', 'RESIDENT'],
    },
    {
      id: 'visitors',
      label: userRole === 'RESIDENT' ? 'My Visitor QR Passes' : userRole === 'SECURITY' ? 'Visitor Gate Registry' : 'Visitors & QR Passes',
      icon: QrCode,
      roles: ['ADMIN', 'RESIDENT', 'SECURITY'],
    },
    {
      id: 'parking',
      label: userRole === 'RESIDENT' ? 'My Parking & Vehicles' : userRole === 'SECURITY' ? 'Parking Slot Check' : 'Parking Management',
      icon: Car,
      roles: ['ADMIN', 'RESIDENT', 'SECURITY'],
    },
    {
      id: 'complaints',
      label: userRole === 'RESIDENT' ? 'My Complaints & Helpdesk' : 'Complaints & Service Requests',
      icon: AlertCircle,
      roles: ['ADMIN', 'RESIDENT'],
    },
    {
      id: 'parcels',
      label: userRole === 'RESIDENT' ? 'My Parcels & Deliveries' : userRole === 'SECURITY' ? 'Parcel Intake & Handover' : 'Parcel Management',
      icon: Package,
      roles: ['ADMIN', 'RESIDENT', 'SECURITY'],
    },
    { id: 'events-polls', label: 'Events & Society Polls', icon: Vote, roles: ['ADMIN', 'RESIDENT'] },
    { id: 'notices', label: 'Notices & Communication', icon: Megaphone, roles: ['ADMIN', 'RESIDENT'] },
    { id: 'expenses', label: 'Expenses & Finance', icon: Wallet, roles: ['ADMIN'] },
    { id: 'documents', label: 'Document Vault', icon: FolderLock, roles: ['ADMIN'] },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3, roles: ['ADMIN'] },
    {
      id: 'activity',
      label: userRole === 'SECURITY' ? 'Security Gate Audit Logs' : 'Activity Logs',
      icon: Activity,
      roles: ['ADMIN', 'SECURITY'],
    },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['ADMIN'] },
  ];

  const navItems = allNavItems.filter((item) => !item.roles || item.roles.includes(userRole));

  return (
    <aside className="relative flex w-72 flex-col bg-[#0F172A] text-slate-300 min-h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="px-5 py-4 border-b border-slate-800/80">
        <MDGLogo variant="light" size="md" />
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <ChevronRight
                className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                  isActive ? 'text-white rotate-90' : 'opacity-40 group-hover:opacity-100'
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* 1-Click ZIP Download in Sidebar */}
      <div className="px-4 pt-2 pb-1">
        <button
          onClick={async () => {
            const { downloadFullProjectZip } = await import('../../utils/downloadZip');
            downloadFullProjectZip();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-500 hover:to-teal-500 transition"
          title="Download complete project (app.py, schema.sql, requirements.txt, .env.example, README.md) as a ZIP"
        >
          <Download className="h-4 w-4" />
          <span>Download Project (.ZIP)</span>
        </button>
      </div>

      {/* Skyline Graphic & Slogan at bottom */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900/90 p-3.5 text-center border border-indigo-900/40">
          {/* Stylized Skyline SVG */}
          <div className="h-12 w-full flex items-end justify-center gap-1 opacity-75">
            <div className="w-2.5 h-6 bg-gradient-to-t from-violet-600 to-indigo-400 rounded-t-sm"></div>
            <div className="w-3 h-10 bg-gradient-to-t from-violet-600 to-purple-400 rounded-t-sm"></div>
            <div className="w-2 h-4 bg-gradient-to-t from-violet-700 to-indigo-500 rounded-t-sm"></div>
            <div className="w-4 h-12 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-sm"></div>
            <div className="w-3 h-8 bg-gradient-to-t from-violet-600 to-purple-400 rounded-t-sm"></div>
            <div className="w-2.5 h-11 bg-gradient-to-t from-purple-600 to-indigo-400 rounded-t-sm"></div>
            <div className="w-3 h-7 bg-gradient-to-t from-violet-700 to-blue-400 rounded-t-sm"></div>
          </div>
          <div className="mt-2 text-xs font-semibold text-indigo-300 tracking-wide">
            Better Living Together
          </div>
        </div>
      </div>
    </aside>
  );
};
