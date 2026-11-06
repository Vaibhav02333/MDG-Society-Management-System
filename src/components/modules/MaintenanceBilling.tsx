import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  CreditCard,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  DollarSign,
  Download,
} from 'lucide-react';
import { MaintenanceBill } from '../../types';
import { MDGLogo } from '../common/MDGLogo';

export const MaintenanceBilling: React.FC = () => {
  const { maintenanceBills, generateMonthlyBills, recordBillPayment } = useSociety();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Paid' | 'Pending' | 'Overdue'>('ALL');
  const [search, setSearch] = useState('');

  // Generate bills modal
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [billingMonth, setBillingMonth] = useState('May 2025');
  const [dueDate, setDueDate] = useState('2025-05-10');

  // Record payment modal
  const [selectedBillForPay, setSelectedBillForPay] = useState<MaintenanceBill | null>(null);
  const [payMode, setPayMode] = useState<MaintenanceBill['paymentMode']>('UPI');
  const [transRef, setTransRef] = useState('');

  // View receipt modal
  const [receiptBill, setReceiptBill] = useState<MaintenanceBill | null>(null);

  const filteredBills = maintenanceBills.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      search === '' ||
      b.flatNumber.toLowerCase().includes(search.toLowerCase()) ||
      b.residentName.toLowerCase().includes(search.toLowerCase()) ||
      (b.receiptNumber && b.receiptNumber.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  // Calculate totals
  const totalBilled = maintenanceBills.reduce((acc, b) => acc + b.amount, 0);
  const totalCollected = maintenanceBills
    .filter((b) => b.status === 'Paid')
    .reduce((acc, b) => acc + b.amount, 0);
  const totalPending = maintenanceBills
    .filter((b) => b.status === 'Pending')
    .reduce((acc, b) => acc + b.amount, 0);
  const totalOverdue = maintenanceBills
    .filter((b) => b.status === 'Overdue')
    .reduce((acc, b) => acc + b.amount, 0);

  const handleGenerateBills = (e: React.FormEvent) => {
    e.preventDefault();
    const count = generateMonthlyBills(billingMonth, dueDate);
    setShowGenerateModal(false);
    alert(`Successfully generated ${count} maintenance bills for ${billingMonth}!`);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay) return;
    recordBillPayment(selectedBillForPay.id, payMode, transRef || undefined);
    setSelectedBillForPay(null);
    setTransRef('');
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Billed</span>
          <div className="mt-2 text-2xl font-black text-slate-900">₹ {totalBilled.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400">All registered billing cycles</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Collected</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            ₹ {totalCollected.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% Collection Rate
          </span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Dues</span>
          <div className="mt-2 text-2xl font-black text-amber-500">
            ₹ {totalPending.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Awaiting payment</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Overdue Amount</span>
          <div className="mt-2 text-2xl font-black text-rose-500">
            ₹ {totalOverdue.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold">Requires follow-up</span>
        </div>
      </div>

      {/* Main Billing Table Box */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              Maintenance Bills & Payment Register
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate monthly bills, record resident payments, and generate official stamped receipts.
            </p>
          </div>

          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Monthly Bills</span>
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {(['ALL', 'Paid', 'Pending', 'Overdue'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search flat or receipt..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Bills Table */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Flat No</th>
                <th className="py-3 px-4">Resident</th>
                <th className="py-3 px-4">Billing Month</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Payment Info</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-indigo-700">
                      {bill.flatNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">{bill.residentName}</td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">{bill.month}</td>
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">
                    ₹ {bill.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">{bill.dueDate}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        bill.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : bill.status === 'Overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {bill.status === 'Paid' && <CheckCircle2 className="h-3 w-3" />}
                      {bill.status === 'Overdue' && <AlertTriangle className="h-3 w-3" />}
                      {bill.status === 'Pending' && <Clock className="h-3 w-3" />}
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {bill.paidDate ? (
                      <div>
                        <span className="font-medium text-slate-700">{bill.paymentMode}</span>
                        <div className="text-[10px] text-slate-400 font-mono">{bill.receiptNumber}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Unpaid</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {bill.status !== 'Paid' ? (
                      <button
                        onClick={() => setSelectedBillForPay(bill)}
                        className="rounded-xl bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white shadow hover:bg-indigo-500 transition"
                      >
                        Record Payment
                      </button>
                    ) : (
                      <button
                        onClick={() => setReceiptBill(bill)}
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                      >
                        <Printer className="h-3 w-3 text-indigo-600" />
                        <span>Receipt</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bills Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Generate Monthly Maintenance Bills</h3>
            <p className="text-xs text-slate-500 mt-1">
              Creates billing entries for all occupied flats in society according to their registered BHK configuration.
            </p>
            <form onSubmit={handleGenerateBills} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Billing Month & Year</label>
                <input
                  type="text"
                  value={billingMonth}
                  onChange={(e) => setBillingMonth(e.target.value)}
                  required
                  placeholder="e.g. May 2025"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Generate Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Record Maintenance Payment</h3>
            <p className="text-xs text-slate-500 mt-1">
              Flat: <strong>{selectedBillForPay.flatNumber}</strong> • Amount: <strong>₹{selectedBillForPay.amount}</strong> ({selectedBillForPay.month})
            </p>
            <form onSubmit={handleRecordPayment} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="NetBanking">Net Banking</option>
                  <option value="Card">Credit / Debit Card</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Transaction Reference / Cheque No</label>
                <input
                  type="text"
                  value={transRef}
                  onChange={(e) => setTransRef(e.target.value)}
                  placeholder="e.g. UPI/12345678"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBillForPay(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-500"
                >
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Receipt Modal */}
      {receiptBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800 border border-slate-100">
            <div className="text-center pb-4 border-b border-slate-200">
              <div className="flex justify-center mb-2">
                <MDGLogo variant="full" size="sm" />
              </div>
              <p className="text-xs text-slate-500 font-medium">Green Valley Residency • Bengaluru, Karnataka</p>
              <span className="inline-block mt-2 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                OFFICIAL PAYMENT RECEIPT
              </span>
            </div>

            <div className="mt-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Receipt Number:</span>
                <span className="font-bold text-slate-800">{receiptBill.receiptNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Flat Number:</span>
                <span className="font-bold text-slate-800">{receiptBill.flatNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Resident Name:</span>
                <span className="font-bold text-slate-800">{receiptBill.residentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Billing Period:</span>
                <span className="font-bold text-slate-800">{receiptBill.month}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payment Date:</span>
                <span className="font-bold text-slate-800">{receiptBill.paidDate}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Payment Mode:</span>
                <span className="font-bold text-slate-800">{receiptBill.paymentMode}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-400">Reference:</span>
                <span className="font-mono text-slate-700">{receiptBill.transactionRef}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-black text-slate-900">
                <span>Amount Paid:</span>
                <span className="text-indigo-600">₹ {receiptBill.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setReceiptBill(null)}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 flex items-center justify-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
