import React from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  BarChart3,
  Trophy,
  PieChart,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Building,
} from 'lucide-react';

export const ReportsAnalyticsView: React.FC = () => {
  const { healthScore, flats, maintenanceBills, complaints, facilityBookings } = useSociety();

  const totalFlats = flats.length;
  const ownerOccupied = flats.filter((f) => f.occupancyStatus === 'Owner-Occupied').length;
  const tenantOccupied = flats.filter((f) => f.occupancyStatus === 'Tenant-Occupied').length;
  const vacant = flats.filter((f) => f.occupancyStatus === 'Vacant').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-600" />
            Society Reports & Health Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time statistical evaluation computed directly from MySQL operational tables.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
        >
          <Printer className="h-4 w-4 text-indigo-600" />
          <span>Print Analytics Dossier</span>
        </button>
      </div>

      {/* Society Health Score Deep Dive Card */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-6">
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
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
                <span className="text-3xl font-black text-slate-900">{healthScore.overallScore}%</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                  {healthScore.ratingText}
                </span>
              </div>
            </div>

            <div>
              <span className="rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                Composite Society Health Index
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 mt-1">
                Green Valley Residency Overall Health Rating
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md">
                Transparent governance formula calculated using real weights: Maintenance collection (30%),
                Complaint resolution speed (25%), Facility utilization (15%), Resident engagement (15%), and
                Reserve financial surplus (15%).
              </p>
            </div>
          </div>
        </div>

        {/* 5 Factors Breakdown */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Maintenance Collection</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{healthScore.maintenanceCollectionScore}%</div>
            <p className="text-[10px] text-slate-400 mt-1">30% total weighting</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Complaint Resolution</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{healthScore.complaintResolutionScore}%</div>
            <p className="text-[10px] text-slate-400 mt-1">25% total weighting</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Facility Usage Rate</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{healthScore.facilityUsageScore}%</div>
            <p className="text-[10px] text-slate-400 mt-1">15% total weighting</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Resident Engagement</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{healthScore.residentEngagementScore}%</div>
            <p className="text-[10px] text-slate-400 mt-1">15% total weighting</p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500">Financial Reserve Health</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{healthScore.financialHealthScore}%</div>
            <p className="text-[10px] text-slate-400 mt-1">15% total weighting</p>
          </div>
        </div>
      </div>
    </div>
  );
};
