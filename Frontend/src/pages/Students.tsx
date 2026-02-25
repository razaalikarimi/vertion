import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Mail, Upload, GraduationCap, School } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  student_id: string;
  grade_id: string;
  grade_name: string;
  school_id: string;
  school_name: string;
  is_active: boolean;
  progress_percentage?: number;
}

interface Grade {
  id: string;
  grade_name: string;
}

interface SchoolData {
  id: string;
  name: string;
}

const Students: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (location.pathname.includes('/create-student')) {
      resetForm();
      setShowModal(true);
    } else if (location.pathname.includes('/uploadstud')) {
      fileInputRef.current?.click();
    }
  }, [location]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_id: '',
    grade_id: '',
    school_id: '',
    is_active: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData(prev => ({ ...prev, school_id: parsed.school_id || '' }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const isAdmin = user?.utype === 'admin';
      const isPrincipal = user?.utype === 'principal';

      const calls: Promise<any>[] = [
        api.get('/students'),
        api.get('/grades')
      ];

      if (isAdmin || isPrincipal) {
        calls.push(api.get('/schools'));
      }

      const results = await Promise.all(calls);
      setStudents(results[0].data);
      setGrades(results[1].data);

      if ((isAdmin || isPrincipal) && results[2]) {
        setSchools(results[2].data);
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      toast.loading('Importing students...', { id: 'csv-upload' });
      await api.post('/students/upload-csv', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Batch import complete', { id: 'csv-upload' });
      fetchData();
    } catch (error) {
      toast.error('Import failed - check CSV format', { id: 'csv-upload' });
    }
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      school_id: formData.school_id || null
    };

    if (user?.utype !== 'admin') {
      finalData.school_id = user?.school_id || null;
    }

    try {
      if (editingId) {
        await api.put(`/students/${editingId}`, finalData);
        toast.success('Student record updated!');
      } else {
        await api.post('/students', finalData);
        toast.success('Student enrolled successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Action failed', error);
      toast.error('Failed to save student record');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingId(student.id);
    setFormData({
      first_name: student.first_name,
      last_name: student.last_name,
      email: student.email,
      student_id: student.student_id,
      grade_id: student.grade_id,
      school_id: student.school_id,
      is_active: student.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Unenroll student "${name}"?`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student unenrolled');
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      student_id: '',
      grade_id: '',
      school_id: user?.school_id || '',
      is_active: true
    });
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase());

    if (location.pathname.includes('pending-student-list')) {
      return matchesSearch && !s.is_active;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Student Repository</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Academic profiles and school-wide enrollment management</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all font-bold group"
          >
            <Upload className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Bulk Sync
          </button>
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5" />
            Enrollment
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Student List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search students..."
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
              <p className="text-gray-500 mt-4 font-black uppercase tracking-widest text-[10px]">Retrieving student directory...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Academic Profile</th>
                  <th className="px-6 py-4">Institutional ID</th>
                  <th className="px-6 py-4">Placement</th>
                  <th className="px-6 py-4">Syllabus Progress</th>
                  <th className="px-6 py-4">Enrollment</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <GraduationCap className="w-16 h-16 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-bold">No student records match the current filters.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 font-black shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                            {s.first_name?.[0]}{s.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors">{s.full_name}</div>
                            <div className="text-xs text-gray-400 font-bold">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-xs font-black text-gray-400 font-mono tracking-tighter">{s.student_id}</div>
                      </td>
                      <td className="px-6 py-5 font-bold">
                        <div className="flex flex-col gap-1">
                          <span className="px-2 py-0.5 text-[10px] font-black uppercase rounded bg-teal-50 text-[#00B894] border border-teal-100 w-fit">
                            {s.grade_name}
                          </span>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 uppercase tracking-widest italic">
                            <School className="w-3 h-3" />
                            {s.school_name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1.5 w-[140px]">
                          <div className="flex justify-between items-center text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                            <span>Modules</span>
                            <span className="text-[#00B894]">{s.progress_percentage || 0}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                            <div
                              className="h-full bg-[#00B894] rounded-full transition-all duration-1000"
                              style={{ width: `${s.progress_percentage || 0}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs font-bold">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${s.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {s.is_active ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(s)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(s.id, s.full_name)}
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
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Profile' : 'Student Enrollment'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Official academic and institutional record entry</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSaveStudent} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Given Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="e.g. John"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Family Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="e.g. Doe"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Institutional Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@school.edu"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Student Identifier</label>
                  <input
                    type="text"
                    required
                    value={formData.student_id}
                    onChange={e => setFormData({ ...formData, student_id: e.target.value })}
                    placeholder="S-2024-XXX"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black text-[#00B894] tracking-tighter"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Institution</label>
                  <select
                    required
                    value={formData.school_id}
                    onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                    disabled={user?.utype !== 'admin'}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black disabled:opacity-50"
                  >
                    <option value="">Campus Registry</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                    {user?.school_id && !schools.find(s => s.id === user.school_id) && (
                      <option value={user.school_id}>{user.school_name || 'My Institution'}</option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Academic Level</label>
                  <select
                    required
                    value={formData.grade_id}
                    onChange={e => setFormData({ ...formData, grade_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    <option value="">Enrollment Grade</option>
                    {grades.map(g => (
                      <option key={g.id} value={g.id}>{g.grade_name}</option>
                    ))}
                  </select>
                </div>
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
                  {editingId ? 'Push Changes' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;
