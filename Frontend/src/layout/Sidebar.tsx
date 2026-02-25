import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  School as SchoolIcon,
  LogOut,
  UserCheck,
  ChevronDown,
  ChevronRight,
  Key,
  BookOpen,
  BookText,
  HelpCircle,
  Calendar,
  GraduationCap,
  SplitSquareHorizontal
} from 'lucide-react';


import type { UserRole } from '../types/index';

interface SidebarProps {
  role: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({
    'Users': true,
    'Teachers': true
  });

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
      label: 'Users',
      icon: Users,
      subItems: [
        { to: '/users', label: 'User List' },
        { to: '/schools', label: 'School wise Student List' },
        { to: '/create-principal', label: 'Create Principal' },
        { to: '/create-staff', label: 'Create staff' },
      ]
    },
    { to: '/change-password', icon: Key, label: 'Change Password' },
  ];

  const principalLinks = [
    { to: '/principal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
      label: 'Teachers',
      icon: Users,
      subItems: [
        { to: '/teachers', label: 'Teacher List' },
        { to: '/create-teacher', label: 'Create Teacher' },
        { to: '/teachers-pending', label: 'Pending Teacher List' },
        { to: '/teacher-attendance', label: 'Teacher Attendance' },
      ]
    },
    { to: '/update-profile', icon: UserCheck, label: 'Update Profile' },
    { to: '/change-password', icon: Key, label: 'Change Password' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    {
      label: 'Schools',
      icon: SchoolIcon,
      subItems: [
        { to: '/staff/schools/', label: 'Schools List' },
        { to: '/staff/schools/create/', label: 'Create Schools' },
      ]
    },
    {
      label: 'Grades',
      icon: GraduationCap,
      subItems: [
        { to: '/staff/grades/', label: 'Grades List' },
        { to: '/staff/grades/create/', label: 'Create Grades' },
      ]
    },
    {
      label: 'Divisions',
      icon: SplitSquareHorizontal,
      subItems: [
        { to: '/staff/divisions/', label: 'Divisions List' },
        { to: '/staff/divisions/create/', label: 'Create Divisions' },
      ]
    },
    {
      label: 'Modules',
      icon: BookOpen,
      subItems: [
        { to: '/staff/modules/', label: 'Modules List' },
        { to: '/staff/modules/create/', label: 'Create Modules' },
      ]
    },
    {
      label: 'Lesson',
      icon: BookText,
      subItems: [
        { to: '/staff/lessons/', label: 'Lessons List' },
        { to: '/staff/lessons/create/', label: 'Create Lessons' },
      ]
    },
    {
      label: 'Module Questions',
      icon: HelpCircle,
      subItems: [
        { to: '/staff/modulequestion/', label: 'Module Questions List' },
        { to: '/staff/modulequestion/create/', label: 'Create Module Question' },
      ]
    },
    {
      label: 'Scheduler',
      icon: Calendar,
      subItems: [
        { to: '/staff/scheduler/list/', label: 'Scheduler List' },
        { to: '/staff/scheduler/calender/', label: 'Scheduler Calender' },
        { to: '/staff/scheduler/create/', label: 'Create Scheduler' },
      ]
    },
    { to: '/update-profile', icon: UserCheck, label: 'Update Profile' },
    { to: '/change-password', icon: Key, label: 'Change Password' },
  ];

  const teacherLinks = [
    { to: '/teacher/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/teacher/teacher-attendance-report-monthwise/', icon: UserCheck, label: 'Self Attendance' },
    {
      label: 'Students',
      icon: Users,
      subItems: [
        { to: '/teacher/student-list', label: 'Student List' },
        { to: '/teacher/pending-student-list', label: 'Pending Student List' },
        { to: '/teacher/student-attendance', label: 'Manage Attendance' },
        { to: '/teacher/create-student', label: 'Create Student' },
        { to: '/teacher/uploadstud/', label: 'Upload Student CSV' },
      ]
    },
    {
      label: 'Exams',
      icon: BookText,
      subItems: [
        { to: '/teacher/exams/', label: 'Exams List' },
        { to: '/teacher/exams/create/', label: 'Create Exams' },
        { to: '/teacher/examquestion/', label: 'Exam Questions List' },
        { to: '/teacher/examquestion/create/', label: 'Create Exam Questions' },
      ]
    },
    {
      label: 'Scheduler Status',
      icon: Calendar,
      subItems: [
        { to: '/teacher/schedulerstatus/', label: 'Scheduler Status List' },
        { to: '/teacher/schedulerstatus/create/', label: 'Create Scheduler' },
      ]
    },
    {
      label: 'Fee Management',
      icon: SchoolIcon,
      subItems: [
        { to: '/teacher/fee-setting', label: 'Fee Setting' },
        { to: '/teacher/fee-paid-list', label: 'Fee Paid List' },
        { to: '/teacher/student-fee-report', label: 'Student Fee Report' },
        { to: '/teacher/create-fee-paid', label: 'Create Fee Paid' },
      ]
    },
    { to: '/teacher/teacher-calender/', icon: Calendar, label: 'Calender' },
    { to: '/update-profile', icon: UserCheck, label: 'Update Profile' },
    { to: '/change-password', icon: Key, label: 'Change Password' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: LayoutDashboard, label: 'Study Kit' },
    { to: '/logout', icon: LogOut, label: 'Logout', isAction: true },
  ];




  let links: any[] = adminLinks;
  if (role === 'admin' || role === 'superadmin') links = adminLinks;
  else if (role === 'principal') links = principalLinks;
  else if (role === 'staff') links = staffLinks;
  else if (role === 'teacher') links = teacherLinks;
  else if (role === 'student') links = studentLinks;
  else links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-black text-[#00B894] tracking-tight italic">Veriton LMS</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-gray-400 mt-1">Institutional Governance</p>
      </div>

      <nav className="flex-1 px-4 mt-4 overflow-y-auto custom-scrollbar">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isOpen = openSubMenus[link.label];

          if (link.subItems) {
            return (
              <div key={index} className="mb-1">
                <button
                  onClick={() => toggleSubMenu(link.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${isOpen ? 'bg-[#00B894] text-white shadow-lg shadow-teal-100' : 'text-gray-500 hover:bg-teal-50 hover:text-[#00B894]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 transition-transform ${isOpen ? 'text-white' : 'text-gray-400 group-hover:text-[#00B894]'}`} />
                    <span className="font-semibold">{link.label}</span>
                  </div>
                  {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>
                {isOpen && (
                  <div className="mt-1 ml-4 space-y-1 border-l-2 border-teal-50">
                    {link.subItems.map((subItem: any) => (
                      <NavLink
                        key={subItem.to}
                        to={subItem.to}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-6 py-2 rounded-lg transition-all text-sm ${isActive ? 'text-[#00B894] font-bold' : 'text-gray-400 hover:text-[#00B894]'
                          }`
                        }
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-40"></span>
                        {subItem.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            );
          }
          return (
            <NavLink
              key={link.to || link.label}
              to={link.to === '/logout' ? '#' : (link.to || '#')}
              onClick={(e) => {
                if (link.to === '/logout') {
                  e.preventDefault();
                  localStorage.clear();
                  window.location.href = '/login';
                }
              }}
              className={({ isActive }) =>
                `flex items-center gap-4 px-5 py-4 rounded-2xl mb-4 transition-all group ${isActive
                  ? 'bg-[#00B894] text-white shadow-xl shadow-teal-500/20 font-black'
                  : 'text-gray-500 hover:bg-teal-50 hover:text-[#00B894] font-bold'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-[#00B894]'}`} />
                  <span className="text-sm tracking-tight">{link.label}</span>
                </>
              )}
            </NavLink>


          );
        })}
      </nav>

      {role !== 'student' && (
        <div className="p-4 border-t border-gray-50">
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all group font-medium"
          >
            <LogOut className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-transform group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      )}

    </aside>
  );
};

export default Sidebar;
