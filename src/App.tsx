import React from 'react';
import { SocietyProvider, useSociety } from './context/SocietyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { ResidentDashboard } from './components/dashboard/ResidentDashboard';
import { SecurityDashboard } from './components/dashboard/SecurityDashboard';
import { FlatsManagement } from './components/modules/FlatsManagement';
import { OwnershipHistory } from './components/modules/OwnershipHistory';
import { MaintenanceBilling } from './components/modules/MaintenanceBilling';
import { GymManagement } from './components/modules/GymManagement';
import { FacilityManagement } from './components/modules/FacilityManagement';
import { VisitorsManagement } from './components/modules/VisitorsManagement';
import { ParkingManagement } from './components/modules/ParkingManagement';
import { ComplaintsManagement } from './components/modules/ComplaintsManagement';
import { ParcelManagement } from './components/modules/ParcelManagement';
import { EventsPolls } from './components/modules/EventsPolls';
import { NoticesCommunication } from './components/modules/NoticesCommunication';
import { ExpensesFinance } from './components/modules/ExpensesFinance';
import { DocumentVault } from './components/modules/DocumentVault';
import { ReportsAnalyticsView } from './components/modules/ReportsAnalyticsView';
import { ActivityLogsView } from './components/modules/ActivityLogsView';
import { CodeAndGuideModal } from './components/modules/CodeAndGuideModal';
import { Settings, Shield, Building, Database, RotateCcw, ShieldAlert } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser, activeTab, setActiveTab, setIsCodeModalOpen } = useSociety();

  // If user is logged out or viewing public landing page
  if (!currentUser || activeTab === 'landing') {
    return (
      <>
        <LandingPage onEnterApp={() => setActiveTab('dashboard')} />
        <CodeAndGuideModal />
      </>
    );
  }

  const renderActiveView = () => {
    // 1. Role-based access control guard for RESIDENT
    const adminOnlyTabs = ['flats', 'ownership', 'expenses', 'documents', 'reports', 'settings'];
    if (currentUser.role === 'RESIDENT' && adminOnlyTabs.includes(activeTab)) {
      return (
        <div className="rounded-3xl border border-rose-200 bg-white p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Access Restricted — Admin Authorization Required</h3>
          <p className="text-xs text-slate-500 mt-2">
            This module contains confidential society governance and administrative financials. As a resident, your access is isolated to your flat records, billing receipts, and community amenities.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
          >
            Return to My Resident Dashboard
          </button>
        </div>
      );
    }

    // 2. Role-based access control guard for SECURITY
    const securityAllowedTabs = ['dashboard', 'visitors', 'parcels', 'parking', 'activity'];
    if (currentUser.role === 'SECURITY' && !securityAllowedTabs.includes(activeTab)) {
      return (
        <div className="rounded-3xl border border-amber-200 bg-white p-8 text-center max-w-lg mx-auto my-12 shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4">
            <ShieldAlert className="h-7 w-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Security Gate Authorization Restricted</h3>
          <p className="text-xs text-slate-500 mt-2">
            Security Staff permissions are strictly scoped to Gate 1 operations: visitor registry, QR pass validation, parcel intake, and gate activity logs.
          </p>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="mt-6 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500 transition"
          >
            Return to Gate Command Console
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'dashboard':
        if (currentUser.role === 'ADMIN') return <AdminDashboard />;
        if (currentUser.role === 'RESIDENT') return <ResidentDashboard />;
        return <SecurityDashboard />;
      case 'flats':
        return <FlatsManagement />;
      case 'ownership':
        return <OwnershipHistory />;
      case 'maintenance':
        return <MaintenanceBilling />;
      case 'gym':
        return <GymManagement />;
      case 'facilities':
        return <FacilityManagement />;
      case 'visitors':
        return <VisitorsManagement />;
      case 'parking':
        return <ParkingManagement />;
      case 'complaints':
        return <ComplaintsManagement />;
      case 'parcels':
        return <ParcelManagement />;
      case 'events-polls':
        return <EventsPolls />;
      case 'notices':
        return <NoticesCommunication />;
      case 'expenses':
        return <ExpensesFinance />;
      case 'documents':
        return <DocumentVault />;
      case 'reports':
        return <ReportsAnalyticsView />;
      case 'activity':
        return <ActivityLogsView />;
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-indigo-600" />
                Society Governance Settings
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure Green Valley Residency parameters, MySQL connection parameters, and administrative controls.
              </p>

              <div className="mt-6 space-y-4 max-w-xl text-xs">
                <div>
                  <label className="font-semibold text-slate-700">Society Name</label>
                  <input
                    type="text"
                    defaultValue="Green Valley Residency"
                    disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700">Total Wings</label>
                    <input
                      type="text"
                      defaultValue="3 Wings (A, B, C)"
                      disabled
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700">Total Flats</label>
                    <input
                      type="text"
                      defaultValue="48 Flats (16 per wing)"
                      disabled
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-slate-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">MySQL Database Target</label>
                  <input
                    type="text"
                    defaultValue="mdg_society_management_db (MySQL 8.0)"
                    disabled
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 font-mono text-slate-800"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => setIsCodeModalOpen(true)}
                    className="rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                  >
                    View Python & MySQL Source Code
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Reset database to clean default seed state?')) {
                        localStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Demo State
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-800 antialiased">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Code Export & Setup Guide Modal */}
      <CodeAndGuideModal />
    </div>
  );
};

export default function App() {
  return (
    <SocietyProvider>
      <AppContent />
    </SocietyProvider>
  );
}
