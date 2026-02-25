import React, { useState } from 'react';
import { toast } from 'sonner';
import api from '../services/api';

const CreateTeacher: React.FC = () => {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return toast.error('Please enter a user name');

    setLoading(true);
    try {
      // Mocking the creation based on image UI
      // In a real scenario, this would send more data
      await api.post('/teachers', {
        user_name: userName,
        role: 'Teacher',
        is_active: false // Initial state
      });
      toast.success('Teacher account provisioned successfully');
      setUserName('');
    } catch (error) {
      toast.error('Provisioning failed. Matrix rejected identity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Create Teacher</h1>

      <div className="bg-white rounded-[2rem] p-8 max-w-2xl shadow-sm border border-gray-50">
        <form onSubmit={handleCreate} className="space-y-6">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
              User Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Choose your user name"
              className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-gray-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-[#00B894] text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-teal-100 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacher;
