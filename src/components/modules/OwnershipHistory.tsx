import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Users,
  History,
  UserPlus,
  Plus,
  Phone,
  Mail,
  Home,
  Trash2,
  Calendar,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { Resident, FamilyMember } from '../../types';

export const OwnershipHistory: React.FC = () => {
  const {
    ownershipRecords,
    residents,
    flats,
    addResident,
    addFamilyMember,
    removeFamilyMember,
  } = useSociety();

  const [activeTab, setActiveTab] = useState<'history' | 'residents'>('history');

  // New resident modal state
  const [showAddResidentModal, setShowAddResidentModal] = useState(false);
  const [resName, setResName] = useState('');
  const [resEmail, setResEmail] = useState('');
  const [resPhone, setResPhone] = useState('');
  const [resFlatNumber, setResFlatNumber] = useState('A-101');
  const [resType, setResType] = useState<'Owner' | 'Tenant'>('Owner');
  const [resMoveInDate, setResMoveInDate] = useState(new Date().toISOString().split('T')[0]);
  const [resEmergencyContact, setResEmergencyContact] = useState('Spouse');
  const [resEmergencyPhone, setResEmergencyPhone] = useState('');

  // Add family member modal state
  const [selectedResidentId, setSelectedResidentId] = useState<number | null>(null);
  const [memName, setMemName] = useState('');
  const [memRelation, setMemRelation] = useState<'Spouse' | 'Child' | 'Parent' | 'Sibling' | 'Other'>('Spouse');
  const [memAge, setMemAge] = useState(30);
  const [memPhone, setMemPhone] = useState('');

  const handleCreateResident = (e: React.FormEvent) => {
    e.preventDefault();
    const flat = flats.find((f) => f.flatNumber === resFlatNumber) || flats[0];
    addResident({
      fullName: resName,
      email: resEmail,
      phone: resPhone,
      flatId: flat.id,
      flatNumber: flat.flatNumber,
      wing: flat.wing,
      type: resType,
      moveInDate: resMoveInDate,
      emergencyContact: resEmergencyContact,
      emergencyPhone: resEmergencyPhone || resPhone,
    });
    setShowAddResidentModal(false);
    setResName('');
    setResEmail('');
    setResPhone('');
  };

  const handleAddFamily = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResidentId) return;
    addFamilyMember(selectedResidentId, {
      fullName: memName,
      relation: memRelation,
      age: Number(memAge),
      phone: memPhone || undefined,
    });
    setSelectedResidentId(null);
    setMemName('');
  };

  return (
    <div className="space-y-6">
      {/* Header Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-600" />
            Ownership & Resident Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Track ownership deed history, previous transfers, and registered resident family structures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('history')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ownership Transfer History ({ownershipRecords.length})
          </button>
          <button
            onClick={() => setActiveTab('residents')}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === 'residents'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Residents & Family Directory ({residents.length})
          </button>
        </div>
      </div>

      {activeTab === 'history' && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="h-4 w-4 text-indigo-600" />
                Ownership Transfer & Deed Allotment Records
              </h3>
              <p className="text-xs text-slate-400">
                Audited historical database. Previous owner records are permanently retained for title verification.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Flat No</th>
                  <th className="py-3 px-4">Current Buyer / Owner</th>
                  <th className="py-3 px-4">Previous Owner</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Purchase Price</th>
                  <th className="py-3 px-4">Transfer Date</th>
                  <th className="py-3 px-4">Deed Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ownershipRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-700">
                        {rec.flatNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{rec.buyerName}</td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {rec.previousOwnerName || 'Original Allotment'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      <div>{rec.phone}</div>
                      <div className="text-[11px] text-slate-400">{rec.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      ₹ {rec.purchaseAmount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{rec.purchaseDate}</td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">{rec.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'residents' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">
              Total {residents.length} Main Residents Linked to Flats
            </span>
            <button
              onClick={() => setShowAddResidentModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-indigo-500"
            >
              <UserPlus className="h-4 w-4" /> Add Resident
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {residents.map((res) => (
              <div
                key={res.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                        Flat {res.flatNumber} (Wing {res.wing})
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 mt-1">{res.fullName}</h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        res.type === 'Owner' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {res.type}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-slate-500 space-y-1">
                    <p className="flex items-center gap-1.5">
                      <Phone className="h-3 w-3 text-slate-400" /> {res.phone}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail className="h-3 w-3 text-slate-400" /> {res.email}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" /> Moved in: {res.moveInDate}
                    </p>
                  </div>

                  {/* Family Members list */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">
                        Family Members ({res.familyMembers?.length || 0})
                      </span>
                      <button
                        onClick={() => setSelectedResidentId(res.id)}
                        className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                      >
                        <Plus className="h-3 w-3" /> Add
                      </button>
                    </div>

                    <div className="mt-2 space-y-1.5">
                      {res.familyMembers?.map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px]"
                        >
                          <span className="font-medium text-slate-700">
                            {m.fullName} ({m.relation}, {m.age}y)
                          </span>
                          <button
                            onClick={() => removeFamilyMember(res.id, m.id)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 text-[10px] text-slate-400 border-t border-slate-100">
                  Emergency: {res.emergencyContact} • {res.emergencyPhone}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Resident Modal */}
      {showAddResidentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Register Resident & Link to Flat</h3>
            <form onSubmit={handleCreateResident} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={resName}
                  onChange={(e) => setResName(e.target.value)}
                  required
                  placeholder="e.g. Vikramaditya Reddy"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    value={resEmail}
                    onChange={(e) => setResEmail(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={resPhone}
                    onChange={(e) => setResPhone(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Assign Flat</label>
                  <select
                    value={resFlatNumber}
                    onChange={(e) => setResFlatNumber(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.flatNumber}>
                        {f.flatNumber} (Wing {f.wing} - {f.bhk})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Resident Type</label>
                  <select
                    value={resType}
                    onChange={(e) => setResType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                  >
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Move-in Date</label>
                <input
                  type="date"
                  value={resMoveInDate}
                  onChange={(e) => setResMoveInDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddResidentModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Save Resident
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {selectedResidentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Add Family Member</h3>
            <form onSubmit={handleAddFamily} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Relation</label>
                <select
                  value={memRelation}
                  onChange={(e) => setMemRelation(e.target.value as any)}
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
                    value={memAge}
                    onChange={(e) => setMemAge(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Phone (Optional)</label>
                  <input
                    type="text"
                    value={memPhone}
                    onChange={(e) => setMemPhone(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedResidentId(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
