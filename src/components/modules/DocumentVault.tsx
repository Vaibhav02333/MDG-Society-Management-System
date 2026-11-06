import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  FolderLock,
  Plus,
  FileText,
  Download,
  Lock,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { DocumentItem } from '../../types';

export const DocumentVault: React.FC = () => {
  const { documents, addDocument, currentUser } = useSociety();

  const [search, setSearch] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<DocumentItem['category']>('Society Bye-Laws');
  const [docRoles, setDocRoles] = useState<('ADMIN' | 'RESIDENT' | 'SECURITY')[]>(['ADMIN', 'RESIDENT']);

  // Filter documents permitted for current role
  const userRole = currentUser?.role || 'ADMIN';
  const permittedDocs = documents.filter((d) => {
    const isPermitted = userRole === 'ADMIN' || d.allowedRoles.includes(userRole);
    const matchesSearch =
      search === '' ||
      d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.category.toLowerCase().includes(search.toLowerCase());
    return isPermitted && matchesSearch;
  });

  const handleDownload = (doc: DocumentItem) => {
    // Generate sample document blob
    const sampleContent = `MDG SOCIETY MANAGEMENT SYSTEM - SECURE DOCUMENT VAULT\n========================================================\nDocument: ${doc.title}\nCategory: ${doc.category}\nUpload Date: ${doc.uploadDate}\nAccess Clearance: ${doc.allowedRoles.join(', ')}\n\nThis is an authentic certified copy stored in the Green Valley Residency digital repository.`;
    const blob = new Blob([sampleContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDocument({
      title: docTitle,
      category: docCategory,
      fileSize: '2.4 MB',
      allowedRoles: docRoles,
    });
    setShowUploadModal(false);
    setDocTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <FolderLock className="h-5 w-5 text-indigo-600" />
            Secure Society Document Vault
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Encrypted repository for bye-laws, fire NOC, audited accounts, title deeds, and AGM minutes with role-based clearance.
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" /> Upload Document
          </button>
        )}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permittedDocs.map((doc) => (
          <div
            key={doc.id}
            className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase rounded-md bg-indigo-50 px-2.5 py-1 text-indigo-700">
                  {doc.category}
                </span>
                <span className="text-[11px] font-mono text-slate-400">{doc.fileSize}</span>
              </div>

              <h4 className="text-sm font-extrabold text-slate-900 mt-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-600 shrink-0" />
                {doc.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1">Uploaded: {doc.uploadDate}</p>

              <div className="mt-3 flex items-center gap-1 text-[10px] text-slate-500">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                <span>Permitted: {doc.allowedRoles.join(', ')}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">PDF / Secure Vault</span>
              <button
                onClick={() => handleDownload(doc)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Upload to Document Vault</h3>
            <form onSubmit={handleUploadSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Document Title</label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                  placeholder="e.g. Lift Safety Inspection Certificate 2025"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Society Bye-Laws">Society Bye-Laws</option>
                  <option value="Ownership Document">Ownership Document</option>
                  <option value="Maintenance Receipt">Maintenance Receipt</option>
                  <option value="Audited Accounts">Audited Accounts</option>
                  <option value="Fire NOC">Fire NOC</option>
                  <option value="Meeting Minutes">Meeting Minutes</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Access Roles</label>
                <div className="mt-1.5 flex gap-3 text-xs">
                  <label className="flex items-center gap-1.5">
                    <input type="checkbox" checked={true} disabled /> Admin
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={docRoles.includes('RESIDENT')}
                      onChange={(e) => {
                        if (e.target.checked) setDocRoles([...docRoles, 'RESIDENT']);
                        else setDocRoles(docRoles.filter((r) => r !== 'RESIDENT'));
                      }}
                    />{' '}
                    Resident
                  </label>
                  <label className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={docRoles.includes('SECURITY')}
                      onChange={(e) => {
                        if (e.target.checked) setDocRoles([...docRoles, 'SECURITY']);
                        else setDocRoles(docRoles.filter((r) => r !== 'SECURITY'));
                      }}
                    />{' '}
                    Security
                  </label>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Save to Vault
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
