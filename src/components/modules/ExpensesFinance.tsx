import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Wallet,
  Plus,
  Download,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building,
  FileSpreadsheet,
} from 'lucide-react';
import { ExpenseRecord } from '../../types';

export const ExpensesFinance: React.FC = () => {
  const { expenses, maintenanceBills, addExpense } = useSociety();

  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory] = useState<ExpenseRecord['category']>('Security Staff');
  const [amount, setAmount] = useState(25000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [vendor, setVendor] = useState('');
  const [invoice, setInvoice] = useState('');
  const [description, setDescription] = useState('');
  const [payMode, setPayMode] = useState<ExpenseRecord['paymentMode']>('Bank Transfer');

  const totalExpenseAmount = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalMaintenanceCollected = maintenanceBills
    .filter((b) => b.status === 'Paid')
    .reduce((acc, b) => acc + b.amount, 0) + 825000;

  const netSurplus = totalMaintenanceCollected - totalExpenseAmount;

  // Real CSV Export Functionality
  const exportToCSV = () => {
    const headers = ['ID', 'Category', 'Vendor Name', 'Invoice Number', 'Amount (INR)', 'Expense Date', 'Payment Mode', 'Description'];
    const rows = expenses.map((e) => [
      e.id,
      `"${e.category}"`,
      `"${e.vendorName}"`,
      `"${e.invoiceNumber}"`,
      e.amount,
      e.expenseDate,
      `"${e.paymentMode}"`,
      `"${e.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MDG_Society_Expenses_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      category,
      amount: Number(amount),
      expenseDate: date,
      vendorName: vendor,
      invoiceNumber: invoice || `INV-${Date.now().toString().slice(-6)}`,
      description,
      paymentMode: payMode,
    });
    setShowAddModal(false);
    setVendor('');
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-600" />
            Expenses & Financial Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Society expenditure ledger, vendor invoices, monthly collection reconciliation, and CSV export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export CSV Report</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 transition"
          >
            <Plus className="h-4 w-4" /> Record Expense
          </button>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Inflow (Maintenance)</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            ₹ {totalMaintenanceCollected.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Paid resident contributions</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Total Outflow (Expenses)</span>
          <div className="mt-2 text-2xl font-black text-rose-500">
            ₹ {totalExpenseAmount.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-slate-400">Vendor, AMC & Utility payouts</span>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Operating Reserve Balance</span>
          <div className="mt-2 text-2xl font-black text-indigo-600">
            ₹ {netSurplus.toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold">Positive Operating Surplus</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 text-indigo-600" />
              Expenditure Ledger ({expenses.length} records)
            </h3>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Vendor & Invoice</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3.5 px-4 font-medium text-slate-700">{e.expenseDate}</td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {e.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800">{e.vendorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{e.invoiceNumber}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 max-w-sm truncate">{e.description}</td>
                  <td className="py-3.5 px-4 text-slate-600">{e.paymentMode}</td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    ₹ {e.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl text-slate-800">
            <h3 className="text-base font-bold text-slate-900">Record Society Expense</h3>
            <form onSubmit={handleExpenseSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Security Staff">Security Staff</option>
                  <option value="Electricity & Water">Electricity & Water</option>
                  <option value="Gardening & Housekeeping">Gardening & Housekeeping</option>
                  <option value="Elevator AMC">Elevator AMC</option>
                  <option value="Repairs">Repairs</option>
                  <option value="Events">Events</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Expense Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700">Vendor / Payee Name</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={(e) => setVendor(e.target.value)}
                    required
                    placeholder="e.g. BESCOM"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700">Invoice / Bill No</label>
                  <input
                    type="text"
                    value={invoice}
                    onChange={(e) => setInvoice(e.target.value)}
                    placeholder="e.g. INV-1029"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs bg-white text-slate-800"
                >
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Cheque">Cheque</option>
                  <option value="UPI">UPI</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={2}
                  placeholder="Details of expense..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                ></textarea>
              </div>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
