import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, Save, Key } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const ChangePassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Matrix divergence detected: Passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Security protocol violation: Password too short');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        current_password: formData.current_password,
        new_password: formData.new_password
      });
      toast.success('Security sequence updated successfully');
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Access denied: Synchronization failure');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Security Credentials</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Update your encrypted access sequence for institutional security.</p>
        </div>
        <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 shadow-sm">
          <Shield className="w-7 h-7" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-800">Password Update Protocol</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">Official security clearance required</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Sequence</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  value={formData.current_password}
                  onChange={e => setFormData({ ...formData, current_password: e.target.value })}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
                  placeholder="••••••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B894] transition-colors"
                >
                  {showCurrent ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">New Sequence</label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    value={formData.new_password}
                    onChange={e => setFormData({ ...formData, new_password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B894] transition-colors"
                  >
                    {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Sequence</label>
                <div className="relative">
                  <Key className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirm_password}
                    onChange={e => setFormData({ ...formData, confirm_password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#00B894] transition-colors"
                  >
                    {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-[#00B894] text-white rounded-2xl font-black shadow-lg shadow-teal-100 hover:bg-[#00A884] hover:shadow-teal-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Synchronize Security Keys
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-black text-amber-900 uppercase tracking-tight">Security Protocol Advisory</p>
          <p className="text-xs text-amber-700 font-medium leading-relaxed">
            Updating your credentials will not terminate your current active session. However, all future network synchronizations will require the newly established security sequence.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
