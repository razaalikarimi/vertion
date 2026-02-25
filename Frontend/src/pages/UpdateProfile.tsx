import React, { useState, useEffect } from 'react';
import { User, Shield, Phone, Mail, MapPin, Save, X, Edit3 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

const UpdateProfile: React.FC = () => {
  const [user, setUser] = useState<any>(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || ''
    });
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);

      // Update local storage and state
      const updatedUser = {
        ...user,
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`.trim()
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      toast.success('Profile synchronized successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update identity record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Institutional Profile</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage your professional identity and contact protocols.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-32 h-32 bg-teal-50 rounded-[2.5rem] flex items-center justify-center text-[#00B894] mb-6 border-4 border-white shadow-xl overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${user.full_name}&background=f0fdfa&color=00b894&size=128&bold=true`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-xl font-black text-gray-900">{user.full_name}</h2>
            <p className="text-[10px] font-black text-[#00B894] uppercase tracking-[0.2em] mt-2 bg-teal-50 px-4 py-1.5 rounded-full">{user.utype}</p>
          </div>

          <div className="bg-[#00B894] rounded-[2.5rem] p-8 shadow-xl shadow-teal-100 text-white space-y-6">
            <div className="flex items-center gap-4">
              <Shield className="w-5 h-5 opacity-60" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Access Level</p>
                <p className="text-sm font-bold uppercase tracking-tight">{user.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="w-5 h-5 opacity-60" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Matrix Identity</p>
                <p className="text-sm font-bold truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Identity Details</h3>
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00B894] hover:text-white transition-all shadow-sm border border-gray-100"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Records
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    <X className="w-3.5 h-3.5" />
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-[#00B894] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00A884] shadow-lg shadow-teal-500/20 transition-all disabled:opacity-50"
                  >
                    {loading ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Commit Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-8 flex-1">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#00B894] focus:bg-white outline-none font-bold text-gray-700 transition-all"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-800 px-1">{user.first_name || '—'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                      required
                      className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-[#00B894] focus:bg-white outline-none font-bold text-gray-700 transition-all"
                    />
                  ) : (
                    <p className="text-lg font-bold text-gray-800 px-1">{user.last_name || '—'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Communications (Phone)</label>
                  <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-gray-50 border border-gray-100/50">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00B894] shadow-sm flex-shrink-0">
                      <Phone className="w-6 h-6" />
                    </div>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="e.g. +1 234 567 890"
                        className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-gray-700 placeholder:text-gray-300"
                      />
                    ) : (
                      <div className="flex-1">
                        <p className="text-sm font-bold text-gray-700">{user.phone || 'No phone record detected'}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department / Office Association</label>
                  <div className="flex items-center gap-4 p-5 rounded-[2rem] bg-gray-50 border border-gray-100/50 opacity-80">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#00B894] shadow-sm flex-shrink-0">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-700">{user.school_name || 'Institutional Neutrality Zone'}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium italic ml-1">* Campus association can only be modified by network administrators.</p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
