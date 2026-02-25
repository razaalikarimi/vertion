import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

import {
  BookOpen,
  FileText,
  Activity,
  ArrowUpRight,
  TrendingUp,
  UserCheck,
  LayoutDashboard,
  PlayCircle,
  ChevronDown,
  BookText,
  Image as ImageIcon,
  Code,
  ListChecks,
  Award,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Menu,
  Bell,
  Layers
} from 'lucide-react';




import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import StatsCard from '../components/StatsCard';
import type { DashboardStats } from '../types/index';
import api from '../services/api';

interface Lesson {
  id: string;
  module_id: string;
  module_name: string;
  sub_topic: string;
  activity?: string;
  video_url?: string;
  diagram_url?: string;
  code?: string;
  procedure?: string;
  required_material?: string;
  what_you_get?: string;
  created_by_teacher_name?: string;
}

interface Module {
  id: string;
  name: string;
  description?: string;
  lessons: Lesson[];
}

const PIE_COLORS = ['#FFDEDE', '#C2F0FF', '#FFF4DE', '#FFE0B2'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [studentModules, setStudentModules] = useState<Module[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('About');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
    }

    const fetchData = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const role = currentUser.utype || currentUser.role?.toLowerCase();
        const isStudent = role === 'student';

        const requests: Promise<any>[] = [
          api.get('/modules'),
          api.get('/lessons')
        ];

        // Only fetch admin/principal stats if not a student
        if (!isStudent) {
          requests.push(api.get('/dashboard/stats'));
          requests.push(api.get('/schools'));
        } else {
          requests.push(api.get('/lessons/completed'));
        }

        const results = await Promise.allSettled(requests);

        // Map results back correctly
        const modulesRes = results[0];
        const lessonsRes = results[1];

        if (modulesRes.status === 'fulfilled' && lessonsRes.status === 'fulfilled') {
          const mods: any[] = modulesRes.value.data;
          const less: any[] = lessonsRes.value.data;

          const grouped = mods.map(m => ({
            ...m,
            lessons: less.filter((l: any) => l.module_id === m.id)
          }));
          setStudentModules(grouped);

          if (grouped.length > 0 && grouped[0].lessons.length > 0) {
            setSelectedLesson(grouped[0].lessons[0]);
            setExpandedModules({ [grouped[0].id]: true });
          }
        }

        if (!isStudent) {
          const statsRes = results[2];
          const schoolsRes = results[3];
          if (statsRes?.status === 'fulfilled') setStats(statsRes.value.data);
          if (schoolsRes?.status === 'fulfilled') setSchools(schoolsRes.value.data);
        } else {
          const completedRes = results[2];
          if (completedRes?.status === 'fulfilled') {
            setCompletedLessons(completedRes.value.data);
          }
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleMarkAsCompleted = async (lessonId: string) => {
    try {
      await api.post(`/lessons/${lessonId}/complete`);
      setCompletedLessons(prev => [...prev, lessonId]);
      toast.success('Course module completed! Keep it up.');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };


  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-teal-50 border-t-[#00B894] rounded-full animate-spin"></div>
        <LayoutDashboard className="absolute inset-0 m-auto text-[#00B894] w-6 h-6 animate-pulse" />
      </div>
      <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing Hub...</p>
    </div>
  );

  const studentProgressData = stats?.student_progress || [
    { name: 'John', progress: 75 },
    { name: 'Mary', progress: 85 },
    { name: 'David', progress: 68 },
    { name: 'Alice', progress: 92 },
    { name: 'Michael', progress: 78 },
  ];

  const gradeAttendanceData = stats?.grade_attendance || [
    { grade: 'V', attendance: 85 },
    { grade: 'VI', attendance: 92 },
    { grade: 'VII', attendance: 78 },
    { grade: 'VIII', attendance: 88 },
    { grade: 'IX', attendance: 82 },
  ];

  const teacherAttendanceData = stats?.teacher_stats || [
    { name: 'Trainer 1', value: 25 },
    { name: 'Trainer 2', value: 25 },
    { name: 'Trainer 3', value: 25 },
    { name: 'Trainer 4', value: 25 },
  ];

  const lessonStatus = studentModules.slice(0, 7).map((m, idx) => ({
    title: m.name,
    progress: m.lessons.length > 0 ? (completedLessons.filter(id => m.lessons.some(l => l.id === id)).length / m.lessons.length) * 100 : 0,
    color: ['bg-teal-500', 'bg-blue-600', 'bg-emerald-600', 'bg-teal-700', 'bg-slate-300', 'bg-blue-500', 'bg-emerald-500'][idx % 7]
  }));

  const upcomingEvents = [
    { date: '5 Jan', time: '08.00 AM', category: 'UI Design', title: 'Introduction Wireframe', color: 'bg-blue-500' },
    { date: '5 Jan', time: '08.00 AM', category: 'Graphic Design', title: 'Basic HTML', color: 'bg-slate-400' },
    { date: '5 Jan', time: '08.00 AM', category: 'Web Design', title: 'Basic HTML', color: 'bg-yellow-500' },
    { date: '5 Jan', time: '08.00 AM', category: 'UI Design', title: 'Introduction Wireframe', color: 'bg-blue-500' },
    { date: '5 Jan', time: '08.00 AM', category: 'UI Design', title: 'Prototyping', color: 'bg-blue-500' },
  ];

  if (user?.utype === 'student' || user?.role?.toLowerCase() === 'student') {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        {/* Top Header Row */}
        <div className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-white/20">
          <div className="flex items-center gap-6">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors lg:hidden">
              <Menu className="w-6 h-6 text-gray-400" />
            </button>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-4">
              <Menu className="w-8 h-8 text-gray-300 hidden lg:block" />
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 bg-white shadow-sm border border-gray-100 rounded-xl text-gray-400 hover:text-[#00B894] transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-12 h-12 bg-white shadow-md border-2 border-white rounded-[1.2rem] flex items-center justify-center overflow-hidden ring-4 ring-teal-50">
              <img src="/placeholder-user.png" alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')} />
            </div>
          </div>
        </div>


        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Panel: Module/Lesson List (Accordion) */}
          <div className="lg:w-1/3 xl:w-1/4 space-y-4">
            {studentModules.map((module) => {
              const isExpanded = expandedModules[module.id];
              return (
                <div key={module.id} className="bg-white rounded-[1.5rem] shadow-sm border border-gray-100 overflow-hidden">
                  <div
                    className="p-5 flex justify-between items-center cursor-pointer group"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div>
                      <h3 className={`font-black tracking-tight transition-colors ${isExpanded ? 'text-[#00B894]' : 'text-gray-800'}`}>
                        {module.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                        Total Lessons : ({module.lessons.length})
                      </p>
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isExpanded ? 'bg-[#00B894] text-white shadow-lg shadow-teal-100' : 'bg-teal-50 text-[#00B894]'}`}>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-6 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          onClick={() => setSelectedLesson(lesson)}
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${selectedLesson?.id === lesson.id
                            ? 'bg-white border-[#00B894] shadow-lg shadow-teal-500/5'
                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                            }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${selectedLesson?.id === lesson.id ? 'bg-[#00B894] text-white' : 'bg-white text-[#00B894] shadow-sm'
                            }`}>
                            <PlayCircle className="w-5 h-5" />
                          </div>
                          <div className="flex-1 flex justify-between items-center gap-3 min-w-0">
                            <div className={`text-sm font-bold truncate ${selectedLesson?.id === lesson.id ? 'text-[#00B894]' : 'text-gray-600'}`}>
                              {lesson.sub_topic}
                            </div>
                            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex-shrink-0 flex items-center gap-2">
                              {completedLessons.includes(lesson.id) ? (
                                <span className="text-[#00B894] flex items-center gap-1">
                                  <ListChecks className="w-3 h-3" />
                                  COMPLETED
                                </span>
                              ) : (
                                '(Mints 10)'
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      {module.lessons.length === 0 && (
                        <div className="p-10 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] italic">No content establish</p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              );
            })}
          </div>

          {/* Right Panel: Content Details */}
          <div className="flex-1 min-w-0">
            {selectedLesson ? (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col">
                {/* Banner Section */}
                <div className="p-8">
                  <div className="aspect-video rounded-[2rem] bg-black overflow-hidden relative group border-4 border-white shadow-2xl flex items-center justify-center">
                    {selectedLesson.video_url ? (
                      <iframe
                        className="w-full h-full"
                        src={selectedLesson.video_url.replace('watch?v=', 'embed/')}
                        title={selectedLesson.sub_topic}
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center p-12">
                        <PlayCircle className="w-20 h-20 text-gray-800 mx-auto mb-6 opacity-20" />
                        <p className="text-gray-400 font-bold text-sm max-w-sm mx-auto">
                          The media could not be loaded, either because the server or network failed or because the format is not supported.
                        </p>
                      </div>
                    )}
                  </div>
                </div>


                {/* Tabs Navigation */}
                <div className="flex items-center border-b border-gray-50 px-8 overflow-x-auto no-scrollbar">
                  {['About', 'Required Material', 'Circuit Diagram', 'Code', 'Procedure', 'What You Get'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-6 py-5 text-[10px] font-black uppercase tracking-widest transition-all relative flex-shrink-0 ${activeTab === tab ? 'text-[#00B894]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#00B894] rounded-t-full"></div>
                      )}
                    </button>
                  ))}
                  <div className="ml-auto pr-8">
                    {!completedLessons.includes(selectedLesson.id) ? (
                      <button
                        onClick={() => handleMarkAsCompleted(selectedLesson.id)}
                        className="px-4 py-1.5 bg-[#00B894] text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#00A884] transition-all flex items-center gap-2"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
                        Complete Session
                      </button>
                    ) : (
                      <div className="px-4 py-1.5 bg-teal-50 text-[#00B894] text-[9px] font-black uppercase tracking-widest rounded-lg border border-teal-100 flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5" />
                        Session Archived
                      </div>
                    )}
                  </div>
                </div>

                {/* Tab Content Area */}
                <div className="p-8 flex-1 animate-in fade-in duration-500">
                  {activeTab === 'About' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-[#00B894] mb-2">
                        <BookText className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Instructional Context</h4>
                      </div>
                      <p className="text-gray-600 leading-relaxed font-medium">
                        {selectedLesson.activity || 'Instructional context will be loaded for this session.'}
                      </p>
                    </div>
                  )}

                  {activeTab === 'Required Material' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-orange-500 mb-2">
                        <Layers className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Study Kit Inventory</h4>
                      </div>
                      <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 text-gray-700 whitespace-pre-wrap font-medium">
                        {selectedLesson.required_material || 'Material requirements pending.'}
                      </div>
                    </div>
                  )}

                  {activeTab === 'Circuit Diagram' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-blue-500 mb-2">
                        <ImageIcon className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Technical Overview</h4>
                      </div>
                      {selectedLesson.diagram_url ? (
                        <div className="rounded-2xl border-4 border-gray-50 overflow-hidden bg-white group cursor-zoom-in">
                          <img src={selectedLesson.diagram_url} alt="Technical Diagram" className="w-full h-auto group-hover:scale-[1.02] transition-transform" />
                        </div>
                      ) : (
                        <div className="h-64 border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center text-gray-300">
                          <ImageIcon className="w-12 h-12 mb-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Visual data unavailable</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'Code' && (
                    <div className="space-y-4 h-full flex flex-col relative">
                      <div className="flex items-center gap-3 text-emerald-500 mb-2">
                        <Code className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Logic implementation</h4>
                      </div>
                      {selectedLesson.code ? (
                        <div className="relative flex-1 group">
                          <button
                            onClick={() => {
                              if (selectedLesson.code) {
                                navigator.clipboard.writeText(selectedLesson.code);
                                toast.success('Logic copied to clipboard');
                              }
                            }}
                            className="absolute top-4 right-4 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg backdrop-blur-md transition-all z-10"
                          >
                            Copy
                          </button>
                          <div className="bg-[#1E1E1E] rounded-2xl p-8 overflow-auto font-mono text-sm text-[#D4D4D4] h-full min-h-[400px] shadow-2xl border border-gray-800">
                            <pre className="leading-relaxed"><code>{selectedLesson.code}</code></pre>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-2xl p-16 text-center text-gray-400 italic border-2 border-dashed border-gray-100">
                          No programmatic reference provided for this lesson.
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'Procedure' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-indigo-500 mb-2">
                        <ListChecks className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Procedural Workflow</h4>
                      </div>
                      <div className="bg-white rounded-2xl text-gray-700 leading-[2] font-medium whitespace-pre-wrap text-sm pl-4">
                        {selectedLesson.procedure || 'The implementation guide is currently being updated.'}
                      </div>
                    </div>
                  )}

                  {activeTab === 'What You Get' && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-amber-500 mb-2">
                        <Award className="w-5 h-5" />
                        <h4 className="text-sm font-black uppercase tracking-widest">Learning Outcomes</h4>
                      </div>
                      <div className="bg-white rounded-2xl text-gray-700 leading-[2.2] font-medium italic text-sm pl-4">
                        {selectedLesson.what_you_get || 'Deliverables and verified outcomes will appear here.'}
                      </div>
                    </div>
                  )}

                  {!selectedLesson.activity && !selectedLesson.required_material && !selectedLesson.diagram_url && !selectedLesson.code && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-50">
                      <BookText className="w-16 h-16 mb-4" />
                      <p className="font-bold uppercase tracking-[0.2em] text-[10px]">Synchronizing lesson details...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[600px] flex flex-col items-center">
                {/* Default Banner */}
                <div className="p-8 w-full">
                  <div className="aspect-video rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl">
                    <img
                      src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1200"
                      className="w-full h-full object-cover"
                      alt="LMS Welcome"
                    />
                  </div>
                </div>
                {/* Tabs Navigation (Placeholder) */}
                <div className="w-full flex items-center border-b border-gray-50 px-8 overflow-x-auto no-scrollbar">
                  {['About', 'Required Material', 'Circuit Diagram', 'Code', 'Procedure', 'What You Get'].map((tab) => (
                    <button key={tab} className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {tab}
                    </button>
                  ))}
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center">
                  <div className="w-20 h-20 bg-teal-50 text-[#00B894] rounded-[2rem] flex items-center justify-center mb-6">
                    <LayoutDashboard className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-800 tracking-tight text-center">Select a lesson to view details.</h3>
                  <p className="text-gray-400 mt-2 font-medium italic">Your learning journey starts with a single click.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    );
  }

  if (user?.utype === 'principal') {

    return (
      <div className="space-y-6 animate-in fade-in duration-700 p-2">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <div className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center">
            <img src="/placeholder-user.png" alt="" className="w-8 h-8 rounded-lg" onError={(e) => (e.currentTarget.src = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix')} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Student Progress Chart */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Student Progress</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-teal-200 rounded-sm"></span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Progress (%)</span>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={studentProgressData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#A0AEC0' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#A0AEC0' }} />
                      <Tooltip cursor={{ fill: '#f7fafc' }} />
                      <Bar dataKey="progress" fill="#C2F0FF" radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grade Attendance Chart */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-800">Grade Attendance</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-300 rounded-sm"></span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Attendance (%)</span>
                  </div>
                </div>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gradeAttendanceData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="grade" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#A0AEC0' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#A0AEC0' }} />
                      <Tooltip cursor={{ fill: '#f7fafc' }} />
                      <Bar dataKey="attendance" fill="#CDEFFF" radius={[4, 4, 0, 0]} barSize={35} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Teacher Attendance Pie Chart */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 lg:col-span-1">
                <h3 className="font-bold text-gray-800 mb-6">Teacher Attendance</h3>
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={teacherAttendanceData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {teacherAttendanceData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}

                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Custom Legend */}
                  <div className="absolute top-0 right-0 space-y-2">
                    {teacherAttendanceData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="w-4 h-2 rounded-sm" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                        <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap uppercase tracking-widest">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lesson Status List */}
              <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100 lg:col-span-2">
                <h3 className="font-bold text-gray-800 mb-6">Lesson Status</h3>
                <div className="space-y-4">
                  {lessonStatus.map((lesson, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-gray-700 italic">
                        <span>{lesson.title}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${lesson.color} transition-all duration-1000`} style={{ width: `${lesson.progress}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Calendar & Events */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <ChevronLeft className="w-4 h-4 text-gray-400 cursor-pointer" />
                <h4 className="font-bold text-gray-800 text-sm">February 2026</h4>
                <ChevronRight className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              <div className="grid grid-cols-7 gap-y-4 text-center">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                  <span key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{d}</span>
                ))}
                {[...Array(28)].map((_, i) => (
                  <span key={i} className={`text-xs font-bold py-1 transition-colors cursor-pointer rounded-lg hover:bg-teal-50 hover:text-[#00B894] ${i + 1 === 23 ? 'bg-[#00B894] text-white shadow-lg' : 'text-gray-600'}`}>
                    {i + 1}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Upcoming Events</h3>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
              <div className="space-y-5">
                {upcomingEvents.map((event, idx) => (
                  <div key={idx} className="relative pl-6 pb-4 border-l border-gray-100 last:border-0 last:pb-0">
                    <div className="absolute left-[-1px] top-0 w-3 h-3 bg-white border-2 border-teal-500 rounded-full flex items-center justify-center">
                      <div className="w-1 h-1 bg-teal-500 rounded-full"></div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-900 mb-1">{event.date}</div>
                      <div className="bg-white rounded-xl p-3 border border-gray-50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{event.time}</span>
                          <span className={`w-1.5 h-1.5 rounded-full ${event.color}`}></span>
                        </div>
                        <h5 className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{event.category}</h5>
                        <p className="text-xs font-bold text-[#00B894] hover:underline cursor-pointer">{event.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default Admin/Staff Dashboard
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            Insight Engine
            <span className="text-xs bg-[#00B894] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest">Live</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Welcome back, {user?.full_name}. Here is the institutional pulse.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end mr-2">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Network Status</span>
            <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
          <button className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm transition-all font-bold group">
            <FileText className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Export Intel
          </button>
        </div>
      </div>

      {/* Primary Stats Grid - Role Aware */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {user?.utype === 'admin' ? (
          <>
            <StatsCard
              title="Global Network Schools"
              value={stats?.total_schools || 0}
              colorClass="bg-[#00B894]"
            />
            <StatsCard
              title="Credentialed Principals"
              value={stats?.total_principals || 0}
              colorClass="bg-[#0984E3]"
            />
            <StatsCard
              title="Pending Authorizations"
              value={stats?.total_principals_pending || 0}
              colorClass="bg-[#E17055]"
            />
            <StatsCard
              title="Active Faculty"
              value={stats?.total_teachers || 0}
              colorClass="bg-[#6C5CE7]"
            />
            <StatsCard
              title="Pending Faculty"
              value={stats?.total_teachers_pending || 0}
              colorClass="bg-[#BDBDBD]"
            />
            <StatsCard
              title="Total Student Registry"
              value={stats?.total_students || 0}
              colorClass="bg-[#00BCA5]"
            />
            <StatsCard
              title="Admission Queue"
              value={stats?.total_students_pending || 0}
              colorClass="bg-[#FBC531]"
            />
            <StatsCard
              title="Total Outcomes"
              value={stats?.total_results || 0}
              colorClass="bg-[#4834D4]"
            />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Teachers"
              value={stats?.total_teachers || 0}
              colorClass="bg-[#FFA000]"
            />
            <StatsCard
              title="Total Students"
              value={stats?.total_students || 0}
              colorClass="bg-[#00BCA5]"
            />
            <StatsCard
              title="Total Grades"
              value={stats?.total_grades || 0}
              colorClass="bg-[#00B894]"
            />
            <StatsCard
              title="Total Lessons"
              value={stats?.total_lessons || 0}
              colorClass="bg-[#00BFA5]"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Intelligence Panel */}
        <div className="lg:col-span-2 space-y-8">
          {user?.utype === 'admin' && (
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-teal-100/20 border border-gray-100 overflow-hidden group">
              <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-teal-50 text-[#00B894] rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 uppercase tracking-tight">Institutional Dynamics</h3>
                    <p className="text-xs text-gray-400 font-bold">Network growth and capacity mapping</p>
                  </div>
                </div>
                <button
                  onClick={() => window.location.href = '/schools'}
                  className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-xl transition-all"
                >
                  <ArrowUpRight className="w-5 h-5" />
                </button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
                    <tr>
                      <th className="px-8 py-4">Campus Unit</th>
                      <th className="px-8 py-4">Operational Status</th>
                      <th className="px-8 py-4 text-right">Identifier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {schools.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-8 py-10 text-center text-gray-400 text-sm italic">
                          No institutions detected in matrix.
                        </td>
                      </tr>
                    ) : (
                      schools.slice(0, 5).map((school, i) => (
                        <tr key={school.id} className="hover:bg-gray-50/50 transition-colors cursor-default group/row">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-[#00B894] font-bold text-xs ring-1 ring-teal-100 group-hover/row:scale-110 transition-transform">
                                {String.fromCharCode(65 + i)}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{school.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{school.school_code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${school.is_active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-rose-50 text-rose-700 border border-rose-100'
                              }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${school.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                              {school.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="text-sm font-black text-gray-900">{school.school_code}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-slate-900 to-[#00B894]/20 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-teal-900/10">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <BookOpen className="w-5 h-5 text-teal-200" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Curriculum Hub</h4>
                  <p className="text-sm text-teal-100/60 font-medium italic">Mapped Subjects and Tracks</p>
                </div>
                <div className="text-4xl font-black">{stats?.total_modules ?? 0}</div>
                <button
                  onClick={() => window.location.href = '/modules'}
                  className="text-[10px] font-black uppercase tracking-widest text-[#00B894] bg-white/10 w-fit px-4 py-1.5 rounded-lg hover:bg-white hover:text-slate-900 transition-all"
                >
                  Explore Modules
                </button>
              </div>
              <Activity className="absolute -right-8 -bottom-8 w-48 h-48 text-white/5 group-hover:scale-110 transition-transform duration-1000" />
            </div>

            <div className="bg-[#00B894] rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-teal-600/20">
              <div className="relative z-10 space-y-4">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                  <FileText className="w-5 h-5 text-teal-100" />
                </div>
                <div>
                  <h4 className="text-xl font-black tracking-tight">Assessments</h4>
                  <p className="text-sm text-teal-50/60 font-medium italic">Active Exams & Results</p>
                </div>
                <div className="text-4xl font-black">{stats?.total_exams ?? 0}</div>
                <button
                  onClick={() => window.location.href = '/exams'}
                  className="text-[10px] font-black uppercase tracking-widest text-white bg-black/10 w-fit px-4 py-1.5 rounded-lg hover:bg-white hover:text-[#00B894] transition-all"
                >
                  View Schedule
                </button>
              </div>
              <LayoutDashboard className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 group-hover:rotate-12 transition-transform duration-1000" />
            </div>
          </div>
        </div>

        {/* Action & Activity Sidebar */}
        <div className="space-y-8">
          {(user?.utype === 'admin' || user?.utype === 'principal' || user?.utype === 'staff' || user?.utype === 'teacher') && (
            <div className="bg-white rounded-[2rem] shadow-xl shadow-teal-100/20 border border-gray-100 p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-teal-50 text-[#00B894] rounded-3xl flex items-center justify-center mb-6 shadow-inner ring-4 ring-teal-50/50">
                <UserCheck size={40} />
              </div>
              <div className="space-y-2 mb-8">
                <h4 className="font-black text-xl text-gray-900 uppercase tracking-tight">Executive Queue</h4>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed">System oversight and user provisioning</p>
              </div>
              <div className="w-full space-y-3">
                <button
                  onClick={() => window.location.href = '/users'}
                  className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-gray-900/20 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                >
                  {user?.utype === 'admin'
                    ? (stats?.total_principals_pending ? `(${stats.total_principals_pending}) ` : '')
                    : (stats?.total_teachers_pending ? `(${stats.total_teachers_pending}) ` : '')}
                  {user?.utype === 'admin' ? 'Approve Principals' : (user?.utype === 'teacher' ? 'Directory' : 'Approve Teachers')}
                </button>
                {user?.utype !== 'admin' && (
                  <button
                    onClick={() => window.location.href = '/students'}
                    className="w-full py-4 bg-[#00B894] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-teal-100 hover:scale-[1.02] active:scale-95 transition-all outline-none"
                  >
                    {stats?.total_students_pending ? `(${stats.total_students_pending}) ` : ''}
                    Admit Students
                  </button>
                )}
                <button
                  onClick={() => window.location.href = user?.utype === 'admin' ? '/schools' : '/grades'}
                  className="w-full py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-gray-50 transition-all outline-none"
                >
                  {user?.utype === 'admin' ? 'Manage Network' : 'Manage Classes'}
                </button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-[2rem] shadow-xl shadow-teal-500/5 border border-gray-100 p-8 overflow-hidden">
            <h4 className="font-black text-gray-900 uppercase tracking-widest text-[11px] mb-6 flex items-center justify-between">
              Intelligence Feed
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
            </h4>
            <div className="space-y-5">
              <div className="flex justify-between items-center group/item">
                <span className="text-xs font-bold text-gray-500 group-hover/item:text-[#00B894] transition-colors">Digital Lessons</span>
                <span className="text-sm font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">{stats?.total_lessons ?? 0}</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-xs font-bold text-gray-500 group-hover/item:text-[#00B894] transition-colors">Results Published</span>
                <span className="text-sm font-black text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">{stats?.total_results ?? 0}</span>
              </div>
              <div className="flex justify-between items-center group/item">
                <span className="text-xs font-bold text-gray-500 group-hover/item:text-[#00B894] transition-colors">System Health</span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Optimal</span>
              </div>
              {user?.utype === 'admin' && (
                <div className="pt-4 mt-4 border-t border-gray-50 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Status</span>
                    <span className="text-xs font-bold text-gray-900">{stats?.total_schools ?? 0} Campuses</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
