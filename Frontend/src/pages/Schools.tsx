import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, School, MapPin, Phone, Mail, Hash } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface SchoolData {
  id: string;
  school_code: string;
  name: string;
  address?: string;
  contact_phone?: string;
  contact_email?: string;
  logo_url?: string;
  is_active: boolean;
}

const Schools: React.FC = () => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    school_code: '',
    name: '',
    address: '',
    contact_phone: '',
    contact_email: '',
    logo_url: '',
    is_active: true
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove school "${name}"?`)) return;
    try {
      await api.delete(`/schools/${id}`);
      toast.success(`School "${name}" removed successfully`);
      fetchSchools();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleEdit = (school: SchoolData) => {
    setEditingId(school.id);
    setFormData({
      school_code: school.school_code,
      name: school.name,
      address: school.address || '',
      contact_phone: school.contact_phone || '',
      contact_email: school.contact_email || '',
      logo_url: school.logo_url || '',
      is_active: school.is_active
    });
    setShowModal(true);
  };

  const handleSaveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/schools/${editingId}`, formData);
        toast.success('School updated successfully!');
      } else {
        await api.post('/schools', formData);
        toast.success('School registered successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchSchools();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Failed to save school';
      console.error('Save failed', msg);
      toast.error(msg);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      school_code: '',
      name: '',
      address: '',
      contact_phone: '',
      contact_email: '',
      logo_url: '',
      is_active: true
    });
  };

  const filteredSchools = schools.filter(school =>
    school.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.school_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    school.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Institution Network</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage all registered schools and academic centers</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          Register School
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Institution List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search schools..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] outline-none"
              />
            </div>
            <button className="bg-[#00B894] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
              <p className="text-gray-500 mt-4 font-medium italic">Loading institutions...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Institution Details</th>
                  <th className="px-6 py-4">Contact Info</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSchools.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <School className="w-16 h-16 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No institutions found matching your criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredSchools.map((school) => (
                    <tr key={school.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894] shadow-inner group-hover:scale-110 transition-transform">
                            {school.logo_url ? (
                              <img src={school.logo_url} alt="" className="w-8 h-8 rounded" />
                            ) : (
                              <School className="w-6 h-6" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors">{school.name}</div>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black">{school.school_code}</span>
                              <div className="text-xs text-gray-400 font-medium flex items-center gap-1 italic">
                                <MapPin className="w-3 h-3" />
                                {school.address || 'Location Not Set'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col gap-1">
                          <div className="text-sm text-gray-600 flex items-center gap-2 group/contact">
                            <Mail className="w-3.5 h-3.5 text-gray-400 group-hover/contact:text-[#00B894] transition-colors" />
                            {school.contact_email || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {school.contact_phone || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${school.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${school.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {school.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(school)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(school.id, school.name)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Update Institution' : 'Register Institution'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">{editingId ? 'Modify existing institution details' : 'Add a new school to the network'}</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <School className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSaveSchool} className="p-8 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">School Code</label>
                  <div className="relative">
                    <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.school_code}
                      onChange={e => setFormData({ ...formData, school_code: e.target.value })}
                      placeholder="VER-001"
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Veriton International School"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Official Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street, City, Country"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-24 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Contact Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="contact@school.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                    placeholder="+1 234 567 890"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-bold transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-bold shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Save Changes' : 'Confirm Registration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schools;
