import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, BookText, Video, Image as ImageIcon, Code, ListChecks, Layers, User, Award, ArrowLeft } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  module_id: string;
  module_name?: string;
  sub_topic: string;
  activity?: string;
  video_url?: string;
  diagram_url?: string;
  code?: string;
  procedure?: string;
  required_material?: string;
  what_you_get?: string;
  created_by_teacher_id?: string;
  created_by_teacher_name?: string;
}

interface Module {
  id: string;
  name: string;
}

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const location = useLocation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    if (location.pathname.includes('/create')) {
      resetForm();
      setShowModal(true);
    }
  }, [location, teachers]);
  const [user, setUser] = useState<any>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState('About');

  const fetchLessonDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/lessons/${id}`);
      setSelectedLesson(res.data);
    } catch (error) {
      toast.error('Failed to load lesson details');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    module_id: '',
    sub_topic: '',
    activity: '',
    video_url: '',
    diagram_url: '',
    code: '',
    procedure: '',
    required_material: '',
    what_you_get: '',
    created_by_teacher_id: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      // Only set teacher_id if user is actually a teacher. Staff/Admin don't have it in the same context.
      setFormData(prev => ({
        ...prev,
        created_by_teacher_id: parsed.utype === 'teacher' ? parsed.id : ''
      }));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, modulesRes, teachersRes] = await Promise.allSettled([
        api.get('/lessons'),
        api.get('/modules'),
        api.get('/teachers')
      ]);
      if (lessonsRes.status === 'fulfilled') setLessons(lessonsRes.value.data);
      if (modulesRes.status === 'fulfilled') setModules(modulesRes.value.data);
      if (teachersRes.status === 'fulfilled') setTeachers(teachersRes.value.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_id) {
      toast.error('Please select a curriculum module');
      return;
    }
    try {
      const payload = {
        ...formData,
        created_by_teacher_id: (user?.utype === 'teacher' ? user?.id : (formData.created_by_teacher_id || null))
      };
      if (editingId) {
        await api.put(`/lessons/${editingId}`, payload);
        toast.success('Lesson plan updated');
      } else {
        await api.post('/lessons', payload);
        toast.success('New lesson published');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving lesson:', error);
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setFormData({
      module_id: lesson.module_id,
      sub_topic: lesson.sub_topic,
      activity: lesson.activity || '',
      video_url: lesson.video_url || '',
      diagram_url: lesson.diagram_url || '',
      code: lesson.code || '',
      procedure: lesson.procedure || '',
      required_material: lesson.required_material || '',
      what_you_get: lesson.what_you_get || '',
      created_by_teacher_id: lesson.created_by_teacher_id || user?.id || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete lesson plan "${name}"?`)) return;
    try {
      await api.delete(`/lessons/${id}`);
      toast.success('Lesson removed');
      fetchData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      module_id: '',
      sub_topic: '',
      activity: '',
      video_url: '',
      diagram_url: '',
      code: '',
      procedure: '',
      required_material: '',
      what_you_get: '',
      created_by_teacher_id: user?.id || ''
    });
  };

  if (selectedLesson) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setSelectedLesson(null); }}
            className="flex items-center gap-2 text-gray-500 hover:text-[#00B894] transition-colors font-bold group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back to Learning Material
          </button>
          <div className="text-right text-xs font-black text-gray-400 uppercase tracking-widest italic">
            Module: {selectedLesson.module_name}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video Player Section */}
            <div className="bg-white rounded-3xl shadow-xl shadow-teal-50 border border-gray-100 overflow-hidden">
              <div className="aspect-video bg-slate-900 flex items-center justify-center relative group">
                {selectedLesson.video_url ? (
                  <iframe
                    className="w-full h-full"
                    src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                    title={selectedLesson.sub_topic}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-center">
                    <Video className="w-16 h-16 text-slate-800 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">Instructional video coming soon</p>
                  </div>
                )}
              </div>
              <div className="p-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight uppercase underline decoration-[#00B894]/20 decoration-8 underline-offset-4">
                  {selectedLesson.sub_topic}
                </h1>
                <div className="flex items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-600">
                    <User className="w-4 h-4 text-[#00B894]" />
                    {selectedLesson.created_by_teacher_name || 'Expert Faculty'}
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl border border-gray-100 text-xs font-bold text-gray-600">
                    <Layers className="w-4 h-4 text-blue-400" />
                    Interactive Study Kit
                  </div>
                </div>
              </div>
            </div>

            {/* Content Tabs Section */}
            <div className="bg-white rounded-3xl shadow-xl shadow-teal-50 border border-gray-100 overflow-hidden">
              <div className="flex items-center border-b border-gray-100 px-6 overflow-x-auto no-scrollbar bg-gray-50/30">
                {['About', 'Required Material', 'Circuit Diagram', 'Code', 'Procedure', 'What You Get'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-5 text-xs font-black uppercase tracking-widest transition-all relative flex-shrink-0 ${activeTab === tab ? 'text-[#00B894]' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00B894] rounded-t-full shadow-[0_-4px_10px_rgba(0,184,148,0.3)]"></div>
                    )}
                  </button>
                ))}
              </div>

              <div className="p-8 min-h-[400px]">
                {activeTab === 'About' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894]">
                        <BookText className="w-5 h-5" />
                      </div>
                      Instructional Objectives
                    </h3>
                    <p className="text-gray-600 leading-relaxed font-medium text-lg italic whitespace-pre-wrap pl-13">
                      {selectedLesson.activity || 'No activity description provided for this session.'}
                    </p>
                  </div>
                )}

                {activeTab === 'Required Material' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                        <Layers className="w-5 h-5" />
                      </div>
                      Prerequisite Equipment & Material
                    </h3>
                    <div className="bg-orange-50/30 border border-orange-100/50 rounded-2xl p-6 pl-13 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap">
                      {selectedLesson.required_material || 'Material list pending faculty update.'}
                    </div>
                  </div>
                )}

                {activeTab === 'Circuit Diagram' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      Technical Visual mapping
                    </h3>
                    {selectedLesson.diagram_url ? (
                      <div className="rounded-3xl border-4 border-gray-50 overflow-hidden shadow-inner bg-white p-4">
                        <img
                          src={selectedLesson.diagram_url}
                          alt="Circuit Schematic"
                          className="w-full h-auto rounded-2xl transition-transform hover:scale-[1.02] cursor-zoom-in"
                        />
                      </div>
                    ) : (
                      <div className="p-16 border-2 border-dashed border-gray-100 rounded-3xl text-center bg-gray-50/50">
                        <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs italic">Visual schematic currently unavailable</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Code' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                        <Code className="w-5 h-5" />
                      </div>
                      Algorithmic implementation
                    </h3>
                    {selectedLesson.code ? (
                      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
                        <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-slate-800">
                          <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                          </div>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Source Code Reference</span>
                        </div>
                        <pre className="p-8 text-sm font-mono text-emerald-400 overflow-x-auto custom-scrollbar leading-relaxed">
                          <code>{selectedLesson.code}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="p-16 border-2 border-dashed border-gray-100 rounded-3xl text-center">
                        <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs">No technical reference provided</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'Procedure' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-500">
                        <ListChecks className="w-5 h-5" />
                      </div>
                      Step-by-Step Methodology
                    </h3>
                    <div className="prose prose-teal max-w-none pl-13">
                      <div className="text-gray-700 leading-relaxed font-medium text-lg whitespace-pre-wrap">
                        {selectedLesson.procedure || 'The procedural methodology is being finalized by instructional designers.'}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'What You Get' && (
                  <div className="animate-in fade-in zoom-in-95 duration-300">
                    <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
                        <Award className="w-5 h-5" />
                      </div>
                      Verified Learning Outcomes
                    </h3>
                    <div className="bg-amber-50/30 border border-amber-100/50 rounded-2xl p-6 pl-13 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic">
                      {selectedLesson.what_you_get || 'Deliverables and outcomes pending validation.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-8">
            <div className="bg-[#00B894] rounded-3xl p-8 text-white shadow-2xl shadow-teal-100 relative overflow-hidden group">
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
              <h2 className="text-2xl font-black leading-tight mb-4 relative z-10 uppercase tracking-tighter">Your Intelligence Feed</h2>
              <p className="text-teal-50 font-medium mb-8 relative z-10 leading-relaxed opacity-90 italic">Track your progress and access auxiliary research materials for this session.</p>
              <div className="space-y-4 relative z-10">
                <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-between group-hover:bg-white/20 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">01</div>
                    <span className="font-bold text-sm tracking-tight capitalize">Assignment Research</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180 opacity-40" />
                </div>
                <div className="p-5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 flex items-center justify-between group-hover:bg-white/20 transition-all cursor-pointer opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center font-black">02</div>
                    <span className="font-bold text-sm tracking-tight capitalize">Peer Discussion</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 rotate-180 opacity-40" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-100/50">
              <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight flex items-center justify-between">
                Faculty Reference
                <User className="w-5 h-5 text-[#00B894]" />
              </h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-50 shadow-inner">
                  <User className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-black text-gray-900 tracking-tight">{selectedLesson.created_by_teacher_name || 'Department Head'}</div>
                  <div className="text-[10px] font-black text-[#00B894] uppercase tracking-widest mt-0.5">Senior Instructor</div>
                </div>
              </div>
              <p className="text-sm text-gray-500 italic leading-relaxed font-medium">
                "Apply the theoretical frameworks discussed in the video to your practical prototype development."
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Content</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Design and structure instructional sessions for the semester</p>
        </div>
        {user?.utype !== 'student' && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="px-5 py-2.5 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 shadow-sm transition-all active:scale-95 font-bold"
          >
            <Plus className="w-5 h-5" />
            Author Content
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800">Lesson List</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
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
                <th className="px-6 py-4">Instructional Topic</th>
                <th className="px-6 py-4">Parent Curriculum</th>
                <th className="px-6 py-4">Author</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
                    <p className="text-gray-500 mt-4 font-black uppercase tracking-widest text-[10px]">Retrieving instructional sessions...</p>
                  </td>
                </tr>
              ) : lessons.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-40">
                      <BookText className="w-16 h-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold">No academic content has been published yet.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lessons.map((lesson) => (
                  <tr
                    key={lesson.id}
                    className={`hover:bg-gray-50/50 transition-colors group ${user?.utype === 'student' ? 'cursor-pointer' : ''}`}
                    onClick={() => user?.utype === 'student' && fetchLessonDetail(lesson.id)}
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-teal-50 rounded-xl flex items-center justify-center text-[#00B894] shadow-inner group-hover:scale-110 transition-transform">
                          <BookText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 group-hover:text-[#00B894] transition-colors uppercase tracking-tight">{lesson.sub_topic}</div>
                          <div className="flex items-center gap-3 mt-1 underline-offset-4 decoration-2">
                            {lesson.video_url && <Video className="w-3 h-3 text-rose-400" />}
                            {lesson.diagram_url && <ImageIcon className="w-3 h-3 text-blue-400" />}
                            {lesson.code && <Code className="w-3 h-3 text-emerald-400" />}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-gray-100 text-gray-700 border border-gray-200">
                        <Layers className="w-3 h-3" />
                        {lesson.module_name || 'Core Curriculum'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs text-gray-600 font-bold">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 shadow-inner">
                          <User className="w-3 h-3 text-gray-400" />
                        </div>
                        {lesson.created_by_teacher_name || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      {user?.utype !== 'student' && (
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lesson.id, lesson.sub_topic)}
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
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Content' : 'Publish Material'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Strategic lesson planning and resource mapping</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <BookText className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instructional Title</label>
                  <input
                    type="text"
                    required
                    value={formData.sub_topic}
                    onChange={(e) => setFormData({ ...formData, sub_topic: e.target.value })}
                    placeholder="e.g. Molecular Lattice Structures"
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold text-[#00B894]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Curriculum Link</label>
                  <select
                    required
                    value={formData.module_id}
                    onChange={(e) => setFormData({ ...formData, module_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    <option value="">Select Modular Track</option>
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {user?.utype !== 'teacher' && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Assign Teacher</label>
                  <select
                    value={formData.created_by_teacher_id}
                    onChange={(e) => setFormData({ ...formData, created_by_teacher_id: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  >
                    <option value="">Select Faculty Member (Optional)</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Core Learning Activity</label>
                <textarea
                  rows={2}
                  value={formData.activity}
                  onChange={(e) => setFormData({ ...formData, activity: e.target.value })}
                  placeholder="Define the primary instructional objective and exercise..."
                  className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-24 resize-none font-medium text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Multimedia (Video URL)</label>
                  <div className="relative">
                    <Video className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-rose-400" />
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      placeholder="e.g. Strategic Resource Link"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Visual Mapping (IMG URL)</label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" />
                    <input
                      type="url"
                      value={formData.diagram_url}
                      onChange={(e) => setFormData({ ...formData, diagram_url: e.target.value })}
                      placeholder="Visual aids and schematics..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Required Material</label>
                  <div className="relative">
                    <Layers className="w-4 h-4 absolute left-3.5 top-4 text-orange-400" />
                    <textarea
                      rows={3}
                      value={formData.required_material}
                      onChange={(e) => setFormData({ ...formData, required_material: e.target.value })}
                      placeholder="List components, tools, or software needed..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-28 resize-none font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">What You Get (Outcomes)</label>
                  <div className="relative">
                    <Award className="w-4 h-4 absolute left-3.5 top-4 text-amber-500" />
                    <textarea
                      rows={3}
                      value={formData.what_you_get}
                      onChange={(e) => setFormData({ ...formData, what_you_get: e.target.value })}
                      placeholder="Define the final prototype or learning outcome..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-28 resize-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instructional Procedure</label>
                <div className="relative">
                  <ListChecks className="w-4 h-4 absolute left-3.5 top-4 text-gray-400" />
                  <textarea
                    rows={3}
                    value={formData.procedure}
                    onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
                    placeholder="Step-by-step methodology for the session..."
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-28 resize-none font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Technical Reference (CODE)</label>
                <div className="relative">
                  <Code className="w-4 h-4 absolute left-3.5 top-4 text-emerald-400" />
                  <textarea
                    rows={4}
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="// Syntactic reference and algorithmic logic samples..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-transparent rounded-xl focus:ring-2 focus:ring-[#00B894] transition-all outline-none h-32 font-mono text-xs text-slate-100 placeholder:text-slate-600 resize-none shadow-inner"
                  />
                </div>
              </div>
            </form>

            <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex gap-4 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-black transition-all active:scale-[0.98]"
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                type="submit"
                className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-black shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
              >
                {editingId ? 'Refine Content' : 'Publish Material'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
