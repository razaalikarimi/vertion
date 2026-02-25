import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Sidebar from './layout/Sidebar';
import Header from './layout/Header';
import Dashboard from './pages/Dashboard';
import Schools from './pages/Schools';
import Teachers from './pages/Teachers';
import Students from './pages/Students';
import Grades from './pages/Grades';
import Users from './pages/Users';
import Modules from './pages/Modules';
import Lessons from './pages/Lessons';
import Exams from './pages/Exams';
import Login from './pages/Login';
import CreatePrincipal from './pages/CreatePrincipal';
import CreateStaff from './pages/CreateStaff';
import CreateTeacher from './pages/CreateTeacher';
import PendingTeachers from './pages/PendingTeachers';
import TeacherAttendance from './pages/TeacherAttendance';
import UpdateProfile from './pages/UpdateProfile';
import StaffDashboard from './pages/StaffDashboard';
import StaffDivisions from './pages/StaffDivisions';
import StaffModuleQuestions from './pages/StaffModuleQuestions';
import StaffScheduler from './pages/StaffScheduler';
import ChangePassword from './pages/ChangePassword';
import StudentAttendance from './pages/StudentAttendance';
import TeacherFees from './pages/TeacherFees';
import type { User } from './types/index';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && token !== 'null' && savedUser && savedUser !== 'null') {
        try {
          const parsedUser = JSON.parse(savedUser);
          if (parsedUser && typeof parsedUser === 'object') {
            setIsAuthenticated(true);
            setUser(parsedUser);
          }
        } catch (e) {
          console.error("Auth parsing error", e);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  const isStaff = user?.utype === 'staff';
  const isTeacher = user?.utype === 'teacher';
  const isStudent = user?.utype === 'student';
  const isAdmin = user?.utype === 'admin' || user?.utype === 'superadmin';
  const isPrincipal = user?.utype === 'principal';

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={
          isAdmin ? "/admin/dashboard" :
            isPrincipal ? "/principal/dashboard" :
              isStaff ? "/staff/dashboard" :
                isTeacher ? "/teacher/dashboard" :
                  "/student/dashboard"
        } />} />

        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <div className="min-h-screen bg-gray-50 flex">
                <Sidebar role={user?.utype || 'student'} />
                <div className="flex-1 flex flex-col">
                  {!isStudent && <Header user={user} />}
                  <main className={`ml-64 p-6 flex-1 overflow-y-auto ${isStudent ? 'mt-0' : 'mt-16'}`}>
                    <Routes>

                      {/* ─── Default Root Route (Already handled at top level, but keeping for safety) ─── */}
                      <Route
                        path="/"
                        element={
                          <Navigate to="/login" replace />
                        }
                      />

                      {/* ─── Dashboard Routes ─── */}
                      <Route path="/admin/dashboard" element={<Dashboard />} />
                      <Route path="/principal/dashboard" element={<Dashboard />} />
                      <Route path="/student/dashboard" element={<Dashboard />} />

                      {/* ─── Common Routes ─── */}
                      <Route path="/schools" element={<Schools />} />
                      <Route path="/teachers" element={<Teachers />} />
                      <Route path="/students" element={<Students />} />
                      <Route path="/grades" element={<Grades />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/modules" element={<Modules />} />
                      <Route path="/lessons" element={<Lessons />} />
                      <Route path="/exams" element={<Exams />} />
                      <Route path="/create-principal" element={<CreatePrincipal />} />
                      <Route path="/create-staff" element={<CreateStaff />} />
                      <Route path="/create-teacher" element={<CreateTeacher />} />
                      <Route path="/teachers-pending" element={<PendingTeachers />} />
                      <Route path="/teacher-attendance" element={<TeacherAttendance />} />
                      <Route path="/update-profile" element={<UpdateProfile />} />
                      <Route path="/change-password" element={<ChangePassword />} />

                      {/* ─── Staff-Specific Routes ─── */}
                      <Route path="/staff/dashboard" element={<StaffDashboard />} />

                      {/* Staff → Schools */}
                      <Route path="/staff/schools/" element={<Schools />} />
                      <Route path="/staff/schools/create/" element={<Schools />} />

                      {/* Staff → Grades */}
                      <Route path="/staff/grades/" element={<Grades />} />
                      <Route path="/staff/grades/create/" element={<Grades />} />

                      {/* Staff → Divisions */}
                      <Route path="/staff/divisions/" element={<StaffDivisions />} />
                      <Route path="/staff/divisions/create/" element={<StaffDivisions />} />

                      {/* Staff → Modules */}
                      <Route path="/staff/modules/" element={<Modules />} />
                      <Route path="/staff/modules/create/" element={<Modules />} />

                      {/* Staff → Lessons */}
                      <Route path="/staff/lessons/" element={<Lessons />} />
                      <Route path="/staff/lessons/create/" element={<Lessons />} />

                      {/* Staff → Exams */}
                      <Route path="/staff/exams/" element={<Exams />} />
                      <Route path="/staff/exam/create/" element={<Exams />} />

                      {/* Staff → Module Questions */}
                      <Route path="/staff/modulequestion/" element={<StaffModuleQuestions />} />
                      <Route path="/staff/modulequestion/create/" element={<StaffModuleQuestions />} />

                      {/* Staff → Scheduler */}
                      <Route path="/staff/scheduler/list/" element={<StaffScheduler />} />
                      <Route path="/staff/scheduler/calender/" element={<StaffScheduler />} />
                      <Route path="/staff/scheduler/create/" element={<StaffScheduler />} />

                      {/* Teacher Routes */}
                      <Route path="/teacher/dashboard" element={<Dashboard />} />
                      <Route path="/teacher/student-list" element={<Students />} />
                      <Route path="/teacher/pending-student-list" element={<Students />} />
                      <Route path="/teacher/student-attendance" element={<StudentAttendance />} />
                      <Route path="/teacher/create-student" element={<Students />} />
                      <Route path="/teacher/uploadstud/" element={<Students />} />
                      <Route path="/teacher/exams/" element={<Exams />} />
                      <Route path="/teacher/exams/create/" element={<Exams />} />
                      <Route path="/teacher/examquestion/" element={<StaffModuleQuestions />} />
                      <Route path="/teacher/examquestion/create/" element={<StaffModuleQuestions />} />
                      <Route path="/teacher/teacher-attendance-report-monthwise/" element={<TeacherAttendance />} />
                      <Route path="/teacher/schedulerstatus/" element={<StaffScheduler />} />
                      <Route path="/teacher/schedulerstatus/create/" element={<StaffScheduler />} />
                      <Route path="/teacher/teacher-calender/" element={<StaffScheduler />} />

                      {/* Teacher → Fee Management */}
                      <Route path="/teacher/fee-setting" element={<TeacherFees />} />
                      <Route path="/teacher/fee-paid-list" element={<TeacherFees />} />
                      <Route path="/teacher/student-fee-report" element={<TeacherFees />} />
                      <Route path="/teacher/create-fee-paid" element={<TeacherFees />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to={
                        isAdmin ? "/admin/dashboard" :
                          isPrincipal ? "/principal/dashboard" :
                            isStaff ? "/staff/dashboard" :
                              isTeacher ? "/teacher/dashboard" :
                                "/student/dashboard"
                      } />} />

                    </Routes>
                  </main>
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
