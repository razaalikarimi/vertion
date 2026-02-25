import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, GraduationCap, Briefcase, Award } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  employee_id: string;
  specialization?: string;
  qualification?: string;
  is_active: boolean;
  school_id: string;
  school_name: string;
}

const Teachers: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    specialization: '',
    qualification: '',
    school_id: '',
    is_active: true
  });
  const [schools, setSchools] = useState<any[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setFormData(prev => ({ ...prev, school_id: parsed.school_id || '' }));
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    if (user?.utype === 'admin') {
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
  }

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove teacher "${name}"?`)) return;
    try {
      await api.delete(`/teachers/${id}`);
      toast.success(`Teacher "${name}" removed successfully`);
      fetchTeachers();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingId(teacher.id);
    setFormData({
      first_name: teacher.first_name,
      last_name: teacher.last_name,
      email: teacher.email,
      employee_id: teacher.employee_id,
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      school_id: teacher.school_id || user?.school_id || '',
      is_active: teacher.is_active
    });
    setShowModal(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
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
        await api.put(`/teachers/${editingId}`, finalData);
        toast.success('Teacher profile updated');
      } else {
        await api.post('/teachers', finalData);
        toast.success('Teacher added successfully!');
      }
      setShowModal(false);
      resetForm();
      fetchTeachers();
    } catch (error) {
      console.error('Save failed', error);
      toast.error('Failed to preserve teacher record');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      employee_id: '',
      specialization: '',
      qualification: '',
      school_id: user?.school_id || '',
      is_active: true
    });
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Faculty Registry</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage teaching staff and academic personnel</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
        >
          <Plus className="w-5 h-5" />
          Add Teacher
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Faculty List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teachers..."
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
              <p className="text-gray-500 mt-4 font-medium italic">Loading faculty members...</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs font-bold border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">Teacher Profile</th>
                  <th className="px-6 py-4">Employee ID</th>
                  <th className="px-6 py-4">Specialization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-40">
                        <GraduationCap className="w-16 h-16 text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No faculty members found.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-[#00B894] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-teal-100 group-hover:scale-110 transition-transform">
                            {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors">{teacher.full_name}</div>
                            <div className="text-xs text-gray-400 font-medium">{teacher.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-gray-400 tracking-tighter">{teacher.employee_id}</td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm text-gray-700 font-bold">{teacher.specialization || 'General Education'}</span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black italic">{teacher.qualification}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${teacher.is_active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-rose-50 text-rose-700 border border-rose-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${teacher.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {teacher.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all">
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(teacher)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(teacher.id, teacher.full_name)}
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
                <h2 className="text-2xl font-black text-gray-900">{editingId ? 'Modify Teacher' : 'Add New Teacher'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">Preserve institutional records for faculty personnel</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSaveTeacher} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    placeholder="Jane"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    placeholder="Smith"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="teacher@veriton.com"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={formData.employee_id}
                    onChange={e => setFormData({ ...formData, employee_id: e.target.value })}
                    placeholder="T-2024-05"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Specialization</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Mathematics"
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Qualification</label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.qualification}
                      onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. Master of Science"
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {user?.utype === 'admin' && (
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

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-bold transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-bold shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Refine Profile' : 'Confirm Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teachers;
