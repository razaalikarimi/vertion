import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CreditCard, History, FileText, Plus, Search, DollarSign, Wallet, User } from 'lucide-react';
import { toast } from 'sonner';

interface FeePayment {
  id: string;
  student_id: string;
  student_name: string;
  grade_name: string;
  amount: number;
  date: string;
  method: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

const TeacherFees: React.FC = () => {
  const location = useLocation();
  const [view, setView] = useState<'setting' | 'list' | 'report' | 'create'>('list');

  const [payments, setPayments] = useState<FeePayment[]>([]);

  useEffect(() => {
    if (location.pathname.includes('/fee-setting')) setView('setting');
    else if (location.pathname.includes('/fee-paid-list')) setView('list');
    else if (location.pathname.includes('/student-fee-report')) setView('report');
    else if (location.pathname.includes('/create-fee-paid')) setView('create');
  }, [location]);

  // Load from LocalStorage (Mock Backend)
  useEffect(() => {
    const storedPayments = localStorage.getItem('lms_fee_payments');
    if (storedPayments) setPayments(JSON.parse(storedPayments));
  }, []);

  const savePayments = (newPayments: FeePayment[]) => {
    setPayments(newPayments);
    localStorage.setItem('lms_fee_payments', JSON.stringify(newPayments));
  };

  const [formData, setFormData] = useState({
    student_id: '',
    student_name: '',
    grade_name: '',
    amount: '',
    method: 'Cash',
    description: ''
  });

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const newPayment: FeePayment = {
      id: Math.random().toString(36).substr(2, 9),
      student_id: formData.student_id,
      student_name: formData.student_name,
      grade_name: formData.grade_name,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString().split('T')[0],
      method: formData.method,
      status: 'Completed'
    };
    savePayments([newPayment, ...payments]);
    toast.success('Fee transaction recorded successfully');
    setFormData({ student_id: '', student_name: '', grade_name: '', amount: '', method: 'Cash', description: '' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-[#00B894]" />
            Fee Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Institutional financial ledger and student treasury oversight.</p>
        </div>
      </div>

      {/* Beta Advisory */}
      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-center gap-3 text-amber-700">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
          <Wallet className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest">Financial Matrix Alpha</p>
          <p className="text-[10px] font-medium italic">These records are currently preserved in the local environment and are awaiting synchronization with the core institutional ledger.</p>
        </div>
      </div>

      {/* Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { id: 'list', label: 'Payment Ledger', icon: History, path: '/teacher/fee-paid-list' },
          { id: 'create', label: 'Record Payment', icon: Plus, path: '/teacher/create-fee-paid' },
          { id: 'setting', label: 'Fee Structures', icon: CreditCard, path: '/teacher/fee-setting' },
          { id: 'report', label: 'Financial Reports', icon: FileText, path: '/teacher/student-fee-report' },
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => window.history.pushState({}, '', btn.path)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${view === btn.id ? 'bg-[#00B894] text-white shadow-lg shadow-teal-500/20' : 'bg-white text-gray-500 hover:bg-teal-50 hover:text-[#00B894] border border-gray-100'
              }`}
          >
            <btn.icon className="w-4 h-4" />
            {btn.label}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Operational Ledger</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search transactions..." className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm outline-none w-64 focus:ring-2 focus:ring-[#00B894]" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th className="px-8 py-4">Student</th>
                  <th className="px-8 py-4">Value</th>
                  <th className="px-8 py-4">Timeline</th>
                  <th className="px-8 py-4">Protocols</th>
                  <th className="px-8 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-16 text-center text-gray-400 italic text-sm">No transaction records detected in the local cache.</td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-[#00B894] font-black shadow-sm uppercase">{p.student_name[0]}</div>
                          <div>
                            <p className="font-bold text-gray-900">{p.student_name}</p>
                            <p className="text-[10px] text-gray-400 uppercase font-bold">{p.grade_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-black text-[#00B894]">${p.amount.toLocaleString()}</td>
                      <td className="px-8 py-6 text-sm font-medium text-gray-500">{p.date}</td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black uppercase text-gray-600 border border-gray-200">{p.method}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase border border-emerald-100">{p.status}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE VIEW */}
      {view === 'create' && (
        <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
          <div className="p-10 border-b border-gray-50 bg-gray-50/30">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Record Transaction</h2>
            <p className="text-sm text-gray-500 mt-1 font-medium italic">Synchronize institutional fee payment from student.</p>
          </div>
          <form onSubmit={handleCreatePayment} className="p-10 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Student Identifier</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input required type="text" value={formData.student_name} onChange={e => setFormData({ ...formData, student_name: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] outline-none font-bold" placeholder="Full Student Name" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Grade</label>
                <input required type="text" value={formData.grade_name} onChange={e => setFormData({ ...formData, grade_name: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] outline-none font-bold" placeholder="e.g. Grade 10-A" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Transaction Value ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00B894] w-5 h-5" />
                  <input required type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] outline-none font-black text-lg text-[#00B894]" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Payment Protocol</label>
                <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })} className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] outline-none font-bold">
                  <option>Cash</option>
                  <option>Bank Transfer</option>
                  <option>Digital Token</option>
                  <option>Scholarship Offset</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50">
              <button type="submit" className="w-full py-4 bg-[#00B894] text-white rounded-2xl font-black shadow-lg shadow-teal-500/20 hover:bg-[#00A884] transition-all active:scale-[0.98] uppercase tracking-widest text-xs">Commit Payment Registry</button>
            </div>
          </form>
        </div>
      )}

      {/* OTHER VIEWS (Placeholders) */}
      {(view === 'setting' || view === 'report') && (
        <div className="bg-white rounded-[2rem] p-20 shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-[2rem] flex items-center justify-center text-[#00B894] mb-6 animate-pulse">
            <CreditCard className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Institutional Configuration Required</h2>
          <p className="text-gray-500 max-w-md mt-2 font-medium italic">The {view === 'setting' ? 'fee structure' : 'financial analytics'} module is undergoing administrative calibration. Please contact the high-level network architect for full synchronization.</p>
        </div>
      )}
    </div>
  );
};

export default TeacherFees;
