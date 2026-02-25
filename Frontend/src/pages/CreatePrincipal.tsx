import { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'sonner';
import { Shield, Mail, School, ArrowRight } from 'lucide-react';

const CreatePrincipal: React.FC = () => {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    school_id: ''
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to fetch schools', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.school_id) {
      toast.error('Please select a school');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users', {
        email: formData.email,
        password: 'Password123!', // Default password
        role: 'Principal',
        school_id: formData.school_id,
        first_name: 'Principal',
        last_name: 'User'
      });
      toast.success('Principal identity provisioned successfully');
      setFormData({ email: '', school_id: '' });
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Institutional Leadership</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Authorize and provision administrative access for campus principals</p>
        </div>
        <div className="w-14 h-14 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894] shadow-sm">
          <Shield className="w-7 h-7" />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 bg-gray-50/30">
          <h2 className="text-xl font-bold text-gray-800">Identity Provisioning Protocol</h2>
          <p className="text-xs text-gray-400 uppercase tracking-widest font-black mt-1">Official network security clearance</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Campus Association</label>
              <div className="relative">
                <School className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <select
                  required
                  value={formData.school_id}
                  onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700 appearance-none"
                >
                  <option value="">Select Target Institution</option>
                  {schools.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Official Email Address</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="principal@institution.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
                />
              </div>
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

export default CreatePrincipal;
