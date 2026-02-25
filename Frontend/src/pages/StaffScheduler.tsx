import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface ScheduleEntry {
  id: string;
  grade_id: string;
  grade_name: string;
  module_id: string;
  module_name: string;
  lesson_id?: string;
  lesson_sub_topic?: string;
  teacher_id: string;
  teacher_name: string;
  date: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Grade { id: string; grade_name: string; }
interface Module { id: string; name: string; grade_id: string; }
interface Lesson { id: string; sub_topic: string; module_id: string; }
interface Teacher { id: string; full_name: string; }
interface Division { id: string; name: string; }

const StaffScheduler: React.FC = () => {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [view, setView] = useState<'list' | 'create' | 'calendar'>('list');

  useEffect(() => {
    if (location.pathname.includes('/create')) {
      setView('create');
    } else if (location.pathname.includes('/calender')) {
      setView('calendar');
    } else {
      setView('list');
    }
  }, [location]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);

  const [formData, setFormData] = useState({
    school_id: '',
    teacher_id: '',
    grade_id: '',
    division_id: '',
    module_id: '',
    lesson_id: '',
    date: '',
    start_time: '',
    end_time: '',
  });

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.utype === 'teacher') {
        setFormData(prev => ({ ...prev, teacher_id: parsed.id }));
      }
    }
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [schedulesRes, gradesRes, modulesRes, lessonsRes, teachersRes] = await Promise.allSettled([
        api.get('/schedulers'),
        api.get('/grades'),
        api.get('/modules'),
        api.get('/lessons'),
        api.get('/teachers'),
      ]);

      let gradesData: any[] = [];
      if (schedulesRes.status === 'fulfilled') {
        const d = schedulesRes.value.data;
        const scheds = Array.isArray(d) ? d : (d.value || []);
        setSchedules(scheds);
      }
      if (gradesRes.status === 'fulfilled') {
        const d = gradesRes.value.data;
        gradesData = Array.isArray(d) ? d : (d.value || []);
        setGrades(gradesData);
      }

      // Extract unique sections from grades to use as Divisions
      const uniqueSections = Array.from(new Set(gradesData.map(g => g.section).filter(Boolean)));
      const dynamicDivisions = uniqueSections.map(s => ({ id: s as string, name: s as string }));

      // Merge with stored divisions from localStorage
      const stored = localStorage.getItem('lms_divisions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const combined = [...dynamicDivisions];
        parsed.forEach((p: any) => {
          if (!combined.find(c => c.name === p.name)) combined.push(p);
        });
        setDivisions(combined);
      } else {
        setDivisions(dynamicDivisions.length > 0 ? dynamicDivisions : [{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }]);
      }
      if (modulesRes.status === 'fulfilled') {
        const d = modulesRes.value.data;
        const mods = Array.isArray(d) ? d : (d.value || []);
        setModules(mods);
        setFilteredModules(mods);
      }
      if (lessonsRes.status === 'fulfilled') {
        const d = lessonsRes.value.data;
        setLessons(Array.isArray(d) ? d : (d.value || []));
      }
      if (teachersRes.status === 'fulfilled') {
        const d = teachersRes.value.data;
        setTeachers(Array.isArray(d) ? d : (d.value || []));
      }
    } catch (e) {
      console.error('Error fetching data', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDivisionChange = (section: string) => {
    setFormData(prev => ({ ...prev, division_id: section, grade_id: '', module_id: '', lesson_id: '' }));
  };

  const handleGradeChange = (gradeId: string) => {
    setFormData(prev => ({ ...prev, grade_id: gradeId, module_id: '', lesson_id: '' }));
    setFilteredModules(modules.filter(m => m.grade_id === gradeId));
    setFilteredLessons([]);
  };

  const handleModuleChange = (moduleId: string) => {
    setFormData(prev => ({ ...prev, module_id: moduleId, lesson_id: '' }));
    setFilteredLessons(lessons.filter(l => l.module_id === moduleId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.grade_id || !formData.module_id || !formData.teacher_id || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const payload = {
      grade_id: formData.grade_id,
      module_id: formData.module_id,
      lesson_id: formData.lesson_id || null,
      teacher_id: formData.teacher_id,
      date: formData.date,
      start_time: formData.start_time || '08:00:00',
      end_time: formData.end_time || '09:00:00',
    };

    try {
      if (editingId) {
        await api.put(`/schedulers/${editingId}`, { ...payload, is_active: true });
        toast.success('Schedule updated successfully');
      } else {
        await api.post('/schedulers', payload);
        toast.success('Schedule created successfully');
      }
      resetForm();
      setView('list');
      fetchAllData();
    } catch (error: any) {
      console.error('Save failed', error);
      const msg = error?.response?.data?.message || 'Error saving schedule';
      toast.error(msg);
    }
  };

  const handleEdit = (s: ScheduleEntry) => {
    setEditingId(s.id);
    setFilteredModules(modules.filter(m => m.grade_id === s.grade_id));
    setFilteredLessons(lessons.filter(l => l.module_id === s.module_id));
    setFormData({
      school_id: '',
      teacher_id: s.teacher_id,
      grade_id: s.grade_id,
      division_id: '',
      module_id: s.module_id,
      lesson_id: s.lesson_id || '',
      date: s.date ? s.date.slice(0, 10) : '',
      start_time: s.start_time || '',
      end_time: s.end_time || '',
    });
    setView('create');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedulers/${id}`);
      toast.success('Schedule deleted');
      fetchAllData();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      school_id: '',
      teacher_id: user?.utype === 'teacher' ? user.id : '',
      grade_id: '',
      division_id: '',
      module_id: '',
      lesson_id: '',
      date: '',
      start_time: '',
      end_time: ''
    });
    setFilteredModules(modules);
    setFilteredLessons([]);
  };

  // Calendar view: group by date
  const calendarByDate = schedules.reduce<Record<string, ScheduleEntry[]>>((acc, s) => {
    const dateKey = s.date ? s.date.slice(0, 10) : 'Unknown';
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(s);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Scheduler</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage class schedules and timetables</p>
        </div>
      </div>

      {/* Breadcrumb / Nav */}
      <div className="flex items-center gap-4 text-sm font-medium">
        <button
          onClick={() => { resetForm(); setView('create'); }}
          className={`px-4 py-2 rounded-lg transition-all ${view === 'create' ? 'bg-[#00B894] text-white' : 'text-gray-500 hover:text-[#00B894] hover:bg-teal-50'}`}
        >
          + New Scheduler
        </button>
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg transition-all ${view === 'list' ? 'bg-[#00B894] text-white' : 'text-gray-500 hover:text-[#00B894] hover:bg-teal-50'}`}
        >
          View List
        </button>
        <button
          onClick={() => setView('calendar')}
          className={`px-4 py-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-[#00B894] text-white' : 'text-gray-500 hover:text-[#00B894] hover:bg-teal-50'}`}
        >
          Calender Mapping
        </button>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Schedule List</h2>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B894] mx-auto"></div>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 text-xs font-bold border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-4">Teacher</th>
                    <th className="px-4 py-4">Grade</th>
                    <th className="px-4 py-4">Module</th>
                    <th className="px-4 py-4">Lesson</th>
                    <th className="px-4 py-4">Date</th>
                    <th className="px-4 py-4">Start Time</th>
                    <th className="px-4 py-4">End Time</th>
                    <th className="px-4 py-4 text-center">Update</th>
                    <th className="px-4 py-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {schedules.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                        <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No schedules found</p>
                      </td>
                    </tr>
                  ) : (
                    schedules.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{s.teacher_name}</td>
                        <td className="px-4 py-3 text-gray-700">{s.grade_name}</td>
                        <td className="px-4 py-3 text-gray-600">{s.module_name}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{s.lesson_sub_topic || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{s.date ? s.date.slice(0, 10) : '—'}</td>
                        <td className="px-4 py-3 text-gray-500">{s.start_time}</td>
                        <td className="px-4 py-3 text-gray-500">{s.end_time}</td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(s)}
                            className="w-8 h-8 bg-[#00B894] text-white rounded-lg flex items-center justify-center hover:bg-[#00A884] mx-auto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 mx-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === 'calendar' && (
        <div className="space-y-4">
          {Object.keys(calendarByDate).length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-16 text-center text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No scheduled sessions yet</p>
            </div>
          ) : (
            Object.entries(calendarByDate).map(([date, entries]) => (
              <div key={date} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 bg-teal-50 border-b border-teal-100 flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-[#00B894]" />
                  <h3 className="font-black text-gray-900">{date}</h3>
                  <span className="ml-auto text-xs font-bold text-teal-600 bg-white px-3 py-1 rounded-full border border-teal-100">
                    {entries.length} session{entries.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {entries.map(e => (
                    <div key={e.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 text-sm text-gray-500 min-w-[120px]">
                        <Clock className="w-4 h-4 text-[#00B894]" />
                        {e.start_time} - {e.end_time}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">{e.module_name}</div>
                        <div className="text-xs text-gray-500">{e.grade_name} • {e.teacher_name}</div>
                        {e.lesson_sub_topic && <div className="text-xs text-teal-600 mt-1">{e.lesson_sub_topic}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* CREATE / EDIT FORM */}
      {view === 'create' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Update Schedule' : 'Create Schedule'}</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Teacher + Grade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Teacher *</label>
                <select
                  value={formData.teacher_id}
                  onChange={e => setFormData(prev => ({ ...prev, teacher_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Teacher</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.full_name}</option>
                  ))}
                </select>
                {user?.utype === 'teacher' && <p className="text-[10px] text-[#00B894] mt-1 font-bold italic">* Locked to your account</p>}
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Grade *</label>
                <select
                  value={formData.grade_id}
                  onChange={e => handleGradeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Grade</option>
                  {grades.filter(g => !formData.division_id || (g as any).section === formData.division_id).map(g => (
                    <option key={g.id} value={g.id}>{g.grade_name} {(g as any).section ? `- ${(g as any).section}` : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Division + Module */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Division</label>
                <select
                  value={formData.division_id}
                  onChange={e => handleDivisionChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Module *</label>
                <select
                  value={formData.module_id}
                  onChange={e => handleModuleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Module</option>
                  {filteredModules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lesson + Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Lesson</label>
                <select
                  value={formData.lesson_id}
                  onChange={e => setFormData(prev => ({ ...prev, lesson_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Lesson (Optional)</option>
                  {filteredLessons.map(l => (
                    <option key={l.id} value={l.id}>{l.sub_topic}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                />
              </div>
            </div>

            {/* Start Time + End Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Start Time</label>
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={e => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">End Time</label>
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={e => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { resetForm(); setView('list'); }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#00B894] text-white rounded-xl font-bold hover:bg-[#00A884]"
              >
                {editingId ? 'Update Schedule' : 'Create Schedule'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffScheduler;
