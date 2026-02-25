import React, { useState, useEffect } from 'react';
import { Search, Inbox } from 'lucide-react';
import api from '../services/api';

const PendingTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const response = await api.get('/teachers');
        // Filter for pending/inactive teachers if API supports it
        const pending = response.data.filter((t: any) => !t.is_active);
        setTeachers(pending);
      } catch (error) {
        console.error('Failed to fetch pending faculty', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-gray-800">Users List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-11 pr-6 py-2.5 bg-gray-50 border border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none w-[280px] font-medium"
              />
            </div>
            <button className="bg-[#00B894] text-white px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[11px] font-black uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-5">Name</th>
                <th className="px-8 py-5">User Name</th>
                <th className="px-8 py-5">School Name</th>
                <th className="px-8 py-5">User Type</th>
                <th className="px-8 py-5">Mobile / WhatsApp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-10 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B894] mx-auto"></div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Inbox className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending requests in queue</p>
                    </div>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center text-[#00B894]">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.email}`} className="w-8 h-8 rounded" alt="" />
                        </div>
                        <span className="font-bold text-gray-900">{teacher.full_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-600 font-medium">{teacher.email.split('@')[0]}</td>
                    <td className="px-8 py-6 text-sm text-gray-600 font-medium">{teacher.school_name}</td>
                    <td className="px-8 py-6">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#00B894]">TEACHER</span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs text-rose-500 font-bold italic">Profile not updated yet..</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PendingTeachers;
