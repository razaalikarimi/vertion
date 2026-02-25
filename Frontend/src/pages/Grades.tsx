import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Library, Hash, Layers } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface Grade {
  id: string;
  grade_level: string;
  section: string;
  grade_name: string;
  school_id?: string;
  school_name?: string;
  is_active: boolean;
}

const Grades: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes('/create')) {
      resetForm();
      setShowModal(true);
    }
  }, [location]);

  const [formData, setFormData] = useState({
    grade_level: '',
    section: '',
    grade_name: '',
    school_id: ''
  });
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Auto-populate school_id for staff, principal, etc.
      setFormData(prev => ({ ...prev, school_id: parsed.school_id || '' }));
    }
  }, []);

  useEffect(() => {
    fetchGrades();
    // Fetch schools for admin and staff
    if (user?.utype === 'admin' || user?.utype === 'staff') {
      fetchSchools();
    }
  }, [user]);

  const fetchSchools = async () => {
    try {
      const resp = await api.get('/schools');
      setSchools(resp.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get('/grades');
      setGrades(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Always ensure school_id is set from user if not explicitly provided
    const payload = {
      ...formData,
      school_id: formData.school_id || user?.school_id || ''
    };
    if (!payload.school_id) {
      toast.error('School ID is required. Please select a school.');
      return;
    }
    try {
      if (editingId) {
        await api.put(`/grades/${editingId}`, payload);
        toast.success('Grade updated successfully');
      } else {
        await api.post('/grades', payload);
        toast.success('Grade created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchGrades();
    } catch (error: any) {
      console.error('Error saving grade:', error);
      const msg = error?.response?.data?.message || 'Failed to preserve grade definition';
      toast.error(msg);
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingId(grade.id);
    setFormData({
      grade_level: grade.grade_level,
      section: grade.section,
      grade_name: grade.grade_name,
      school_id: grade.school_id || user?.school_id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete grade "${name}"?`)) return;
    try {
      await api.delete(`/grades/${id}`);
      toast.success('Grade deleted');
      fetchGrades();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      grade_level: '',
      section: '',
      grade_name: '',
      school_id: user?.school_id || ''
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Levels</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage institutional grades, classes, and sections</p>
        </div>
        {(user?.utype === 'admin' || user?.utype === 'principal' || user?.utype === 'staff') && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5" />
            Define Grade
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Grade List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search grades..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] outline-none"
              />
            </div>
            <button className="bg-[#00B894] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-500 text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">Academic Identity</th>
                <th className="px-6 py-4">Internal Section</th>
                <th className="px-6 py-4">Growth Level</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
                    <p className="text-gray-500 mt-4 font-black uppercase tracking-widest text-[10px]">Retrieving academic levels...</p>
                  </td>
                </tr>
              ) : grades.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <Library className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold">No academic levels mapped for this institution.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                grades.map((grade) => (
                  <tr key={grade.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894] shadow-inner group-hover:scale-110 transition-transform">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors">{grade.grade_name}</div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-0.5 italic">{grade.school_name || 'Assigned Campus'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-black uppercase border border-amber-100 shadow-sm">
                        Block {grade.section}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-tighter">Academic Rank {grade.grade_level}</span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {(user?.utype === 'admin' || user?.utype === 'principal' || user?.utype === 'staff') && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(grade)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(grade.id, grade.grade_name)}
                            className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Grade' : 'Academic Definition'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Define institutional ranking and blocks</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <Hash className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ranking Level</label>
                  <input
                    type="text"
                    required
                    value={formData.grade_level}
                    onChange={(e) => setFormData({ ...formData, grade_level: e.target.value })}
                    placeholder="e.g. 10"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Section Block</label>
                  <input
                    type="text"
                    required
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    placeholder="e.g. A"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Formal Grade Name</label>
                <div className="relative">
                  <Library className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={formData.grade_name}
                    onChange={(e) => setFormData({ ...formData, grade_name: e.target.value })}
                    placeholder="e.g. Grade 10 - Alpha"
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black text-[#00B894]"
                  />
                </div>
              </div>

              {(user?.utype === 'admin' || user?.utype === 'staff') && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Target Institution</label>
                  <select
                    required
                    value={formData.school_id}
                    onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  >
                    <option value="">Select a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.id}>{school.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-black transition-all active:scale-[0.98]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-black shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Confirm Updates' : 'Establish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;
