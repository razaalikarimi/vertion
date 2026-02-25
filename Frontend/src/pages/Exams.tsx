import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, FileSpreadsheet, Clock, Calendar, BarChart3, Layers } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface Exam {
  id: string;
  title: string;
  module_id: string;
  module_name?: string;
  grade_id: string;
  grade_name?: string;
  date: string;
  duration_minutes: number;
  total_marks: number;
}

interface Module {
  id: string;
  name: string;
}

interface Grade {
  id: string;
  grade_name: string;
}

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    module_id: '',
    grade_id: '',
    date: '',
    duration_minutes: 60,
    total_marks: 100
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [examsRes, modulesRes, gradesRes] = await Promise.all([
        api.get('/exams'),
        api.get('/modules'),
        api.get('/grades')
      ]);
      setExams(examsRes.data);
      setModules(modulesRes.data);
      setGrades(gradesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_id || !formData.grade_id) {
      toast.error('Module and Grade selection required');
      return;
    }

    const payload = {
      title: formData.title,
      module_id: formData.module_id,
      grade_id: formData.grade_id,
      date: formData.date,
      duration_minutes: formData.duration_minutes,
      total_marks: formData.total_marks,
      created_by_teacher_id: user?.id
    };

    try {
      if (editingId) {
        await api.put(`/exams/${editingId}`, payload);
        toast.success('Examination updated');
      } else {
        await api.post('/exams', payload);
        toast.success('Exam scheduled successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Action failed', error);
      toast.error('Failed to save exam');
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setFormData({
      title: exam.title,
      module_id: exam.module_id,
      grade_id: exam.grade_id,
      date: exam.date?.split('Z')[0] || '',
      duration_minutes: exam.duration_minutes,
      total_marks: exam.total_marks
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Cancel exam "${title}"?`)) return;
    try {
      await api.delete(`/exams/${id}`);
      toast.success('Exam canceled');
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      module_id: '',
      grade_id: '',
      date: '',
      duration_minutes: 60,
      total_marks: 100
    });
  };

  const filteredExams = exams.filter(e =>
    e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.module_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Assessments & Exams</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Coordinate institutional testing schedules and grading rubrics</p>
        </div>
        {user?.utype !== 'student' && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5" />
            Provision Exam
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Exam Schedule</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search exams..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white min-w-[200px] outline-none"
              />
            </div>
            <button className="bg-[#00B894] text-white px-6 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-black text-gray-400">
              <tr>
                <th className="px-6 py-4 text-left">Assessment Identity</th>
                <th className="px-6 py-4 text-left">Class & Track</th>
                <th className="px-6 py-4 text-left">Timeline</th>
                <th className="px-6 py-4 text-left">Credit Value</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
                    <p className="text-gray-500 mt-4 font-black uppercase tracking-widest text-[10px]">Retrieving assessment schedule...</p>
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <FileSpreadsheet className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold">No institutional examinations are currently scheduled.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894] border border-teal-100 shadow-sm group-hover:scale-110 transition-transform">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors">{exam.title}</div>
                          <div className="flex items-center gap-2 mt-0.5 text-[10px] font-black text-gray-400 uppercase tracking-widest font-mono">
                            <Clock className="w-3 h-3" />
                            {exam.duration_minutes} MIN SESSION
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-200 shadow-sm">
                          <Layers className="w-3 h-3" />
                          {exam.module_name || 'Generic Track'}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">Grade: {exam.grade_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-[#00B894]" />
                          {new Date(exam.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <span className="text-[10px] text-gray-400 font-black uppercase ml-5 tracking-tighter italic">
                          T - {new Date(exam.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-600 bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">
                        <BarChart3 className="w-4 h-4" />
                        {exam.total_marks} MARKS
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user?.utype !== 'student' && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(exam)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(exam.id, exam.title)}
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
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Rubric' : 'New Assessment'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Define assessment timing and grading weight</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assessment Identity</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mid-Term Proficiency Q3"
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-[#00B894]"
                />
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Grade / Class</label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={(e) => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    <option value="">Enrollment Grade</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.grade_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Subject Link</label>
                  <select
                    required
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    <option value="">Modular Track</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Examination Window</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Duration (MIN)</label>
                  <div className="relative">
                    <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mark Weight</label>
                  <div className="relative">
                    <BarChart3 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.total_marks}
                      onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black text-emerald-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-black transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-black shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Refine Rubric' : 'Schedule Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;
