import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookOpen, Layers, Award } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  grade_id: string;
  grade_name?: string;
  description?: string;
  credits?: number;
}

interface Grade {
  id: string;
  grade_name: string;
}

const Modules: React.FC = () => {
  const [modules, setModules] = useState<Module[]>([]);
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
    name: '',
    grade_id: '',
    description: '',
    credits: 0
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [modulesRes, gradesRes] = await Promise.all([
        api.get('/modules'),
        api.get('/grades')
      ]);
      setModules(modulesRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grade_id) {
      toast.error('Please select a grade');
      return;
    }

    const payload = {
      name: formData.name,
      grade_id: formData.grade_id,
      description: formData.description,
      credits: formData.credits
    };

    try {
      if (editingId) {
        await api.put(`/modules/${editingId}`, payload);
        toast.success('Module updated successfully');
      } else {
        await api.post('/modules', payload);
        toast.success('Module created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error saving module';
      console.error('Error saving module:', error);
      toast.error(msg);
    }
  };

  const handleEdit = (module: Module) => {
    setEditingId(module.id);
    setFormData({
      name: module.name,
      grade_id: module.grade_id,
      description: module.description || '',
      credits: module.credits || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete module "${name}"?`)) return;
    try {
      await api.delete(`/modules/${id}`);
      toast.success('Module removed');
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      grade_id: '',
      description: '',
      credits: 0
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Curriculum Inventory</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Define subjects, academic credits, and learning tracks</p>
        </div>
        {user?.utype !== 'student' && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5" />
            Provision Module
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Module List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search modules..."
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
                <th className="px-6 py-4">Module Identity</th>
                <th className="px-6 py-4">Academic Placement</th>
                <th className="px-6 py-4">Value Weight</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
                    <p className="text-gray-500 mt-4 font-black uppercase tracking-widest text-[10px]">Syncing dynamic curriculum...</p>
                  </td>
                </tr>
              ) : modules.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <BookOpen className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold">No academic subjects established in the curriculum.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                modules.map((module) => (
                  <tr key={module.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894] shadow-inner group-hover:scale-110 transition-transform">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors uppercase tracking-tight">{module.name}</div>
                          <p className="text-[10px] text-gray-400 truncate max-w-[250px] font-medium mt-0.5 italic">{module.description || 'Core Institutional Curriculum Subject'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                        <Layers className="w-3 h-3" />
                        {module.grade_name || 'Generic Track'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-600 uppercase tracking-tighter">
                        <Award className="w-4 h-4" />
                        {module.credits} Academic Credits
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user?.utype !== 'student' && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(module)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(module.id, module.name)}
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
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Subject' : 'Establish Module'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Configure instructional weight and subjects</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subject Nomenclature</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Theoretical Physics IV"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-[#00B894]"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Target Ranking</label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    <option value="">Select Level</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.grade_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Credit Weight</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.credits}
                      onChange={(e) => setFormData({ ...formData, credits: parseInt(e.target.value) })}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black text-amber-600"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instructional Summary</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Define the scope of this instructional module..."
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-28 resize-none font-medium text-gray-600"
                />
              </div>

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
                  {editingId ? 'Apply Refinement' : 'Confirm Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Modules;
