import React, { useEffect, useState } from 'react';
import { Users, BookOpen, BookText, GraduationCap, School, HelpCircle, SplitSquareHorizontal, Calendar, FileSpreadsheet, TrendingUp, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

interface DashboardStats {
  total_students: number;
  total_teachers: number;
  total_modules: number;
  total_lessons: number;
  total_exams: number;
  total_results: number;
  total_schools: number;
  total_grades: number;
  total_principals: number;
  total_principals_pending: number;
  total_teachers_pending: number;
  total_students_pending: number;
}

const StaffDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Dashboard stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Schools',
      value: stats?.total_schools ?? 0,
      icon: School,
      color: 'bg-blue-50 text-blue-500',
      trend: '+3%',
    },
    {
      label: 'Total Grades',
      value: stats?.total_grades ?? 0,
      icon: GraduationCap,
      color: 'bg-teal-50 text-teal-500',
      trend: '+5%',
    },
    {
      label: 'Total Modules',
      value: stats?.total_modules ?? 0,
      icon: BookOpen,
      color: 'bg-purple-50 text-purple-500',
      trend: '+8%',
    },
    {
      label: 'Total Lessons',
      value: stats?.total_lessons ?? 0,
      icon: BookText,
      color: 'bg-orange-50 text-orange-500',
      trend: '+12%',
    },
    {
      label: 'Total Teachers',
      value: stats?.total_teachers ?? 0,
      icon: Users,
      color: 'bg-pink-50 text-pink-500',
      trend: '+2%',
    },
    {
      label: 'Total Students',
      value: stats?.total_students ?? 0,
      icon: Users,
      color: 'bg-cyan-50 text-cyan-500',
      trend: '+15%',
    },
    {
      label: 'Total Exams',
      value: stats?.total_exams ?? 0,
      icon: HelpCircle,
      color: 'bg-amber-50 text-amber-500',
      trend: '+4%',
    },
    {
      label: 'Pending Teachers',
      value: stats?.total_teachers_pending ?? 0,
      icon: Users,
      color: 'bg-red-50 text-red-500',
      trend: '',
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-teal-50 border-t-[#00B894] rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Staff Dashboard</h1>
        <p className="text-gray-500 mt-1 font-medium italic">
          Welcome back, {user?.full_name || user?.first_name || 'Staff Member'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                {card.trend && (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                    <TrendingUp className="w-3 h-3" />
                    {card.trend}
                  </div>
                )}
              </div>
              <div className="text-3xl font-black text-gray-900 mb-1">
                {card.value.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 font-medium">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-lg font-black text-gray-900 mb-5">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Add Grade', href: '/staff/grades/create/', icon: GraduationCap, color: 'teal' },
            { label: 'Add Division', href: '/staff/divisions/create/', icon: SplitSquareHorizontal, color: 'blue' },
            { label: 'Add Module', href: '/staff/modules/create/', icon: BookOpen, color: 'purple' },
            { label: 'Add Lesson', href: '/staff/lessons/create/', icon: BookText, color: 'orange' },
            { label: 'Add Exam', href: '/staff/exam/create/', icon: FileSpreadsheet, color: 'teal' },
            { label: 'Add Question', href: '/staff/modulequestion/create/', icon: HelpCircle, color: 'red' },
            { label: 'Add Schedule', href: '/staff/scheduler/create/', icon: Calendar, color: 'blue' },
          ].map((action, i) => {
            const Icon = action.icon;
            return (
              <a
                key={i}
                href={action.href}
                className="flex flex-col items-center gap-3 p-5 bg-gray-50 hover:bg-teal-50 rounded-2xl border border-gray-100 hover:border-teal-100 transition-all group"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6 text-[#00B894]" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#00B894] transition-colors">
                  {action.label}
                </span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-gradient-to-br from-[#00B894] to-[#00A884] rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-teal-50 text-sm font-bold uppercase tracking-widest">Active Principals</p>
              <h3 className="text-4xl font-black mt-1">{stats?.total_principals ?? 0}</h3>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="flex items-center gap-2 text-teal-50 text-sm font-medium">
            <ArrowUpRight className="w-4 h-4" />
            {stats?.total_principals_pending ?? 0} pending approval
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Pending Students</p>
              <h3 className="text-4xl font-black text-gray-900 mt-1">{stats?.total_students_pending ?? 0}</h3>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Students awaiting approval or enrollment</p>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
