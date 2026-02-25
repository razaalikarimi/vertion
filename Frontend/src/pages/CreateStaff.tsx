import { useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';
import { User, Mail, ArrowRight } from 'lucide-react';

const CreateStaff: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users', {
        email: formData.email,
        password: 'Password123!', // Default password
        role: 'Staff',
        first_name: 'Staff',
        last_name: 'User'
      });
      toast.success('Staff identity provisioned successfully');
      setFormData({ email: '' });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to authorize provisioning');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Personnel</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Empower your institutional support team with network access</p>
        </div>
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894] shadow-sm">
          <User className="w-7 h-7" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-800">Operational Identity Setup</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">Official staff provisioning protocol</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="max-w-md space-y-3">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Official Email Address</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="staff@institution.com"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-gray-50">
            <div className="text-sm text-gray-400 font-medium italic">
              * A temporary password (Password123!) will be generated automatically.
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-[#00B894] text-white rounded-2xl font-black shadow-lg shadow-teal-100 hover:bg-[#00A884] hover:shadow-teal-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Authorize Provisioning
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStaff;
