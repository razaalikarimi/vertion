import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Check
} from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface StudentAttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  status: 'Present' | 'Absent' | 'Late';
  remarks?: string;
  date: string;
}

interface Grade {
  id: string;
  grade_name: string;
}

const StudentAttendance: React.FC = () => {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [students, setStudents] = useState<StudentAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGrades();
  }, []);

  useEffect(() => {
    if (selectedGrade && date) {
      fetchAttendance();
    }
  }, [selectedGrade, date]);

  const fetchGrades = async () => {
    try {
      const res = await api.get('/grades');
      setGrades(res.data);
      if (res.data.length > 0) {
        setSelectedGrade(res.data[0].id);
      }
    } catch (error) {
      toast.error('Failed to load grades');
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/attendance/students?gradeId=${selectedGrade}&date=${date}`);
      setStudents(res.data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load student list');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late') => {
    setStudents(prev => prev.map(s =>
      s.studentId === studentId ? { ...s, status } : s
    ));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setStudents(prev => prev.map(s =>
      s.studentId === studentId ? { ...s, remarks } : s
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/attendance/save', students);
      toast.success('Attendance records synchronized successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAll = (status: 'Present' | 'Absent' | 'Late') => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
  };

  const filteredStudents = students.filter(s =>
    s.studentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-[2rem] border border-white/20">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-[#00B894]" />
            Student Attendance
          </h1>
          <p className="text-gray-500 font-medium italic">Operational oversight for classroom presence.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || students.length === 0}
            className="px-6 py-3 bg-[#00B894] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Sync Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Institutional Grade</label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl px-5 py-4 font-bold text-gray-700 focus:outline-none focus:border-[#00B894] transition-all"
          >
            {grades.map(g => (
              <option key={g.id} value={g.id}>{g.grade_name}</option>
            ))}
          </select>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col gap-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Execution Date</label>
          <div className="relative">
            <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-gray-50 border-2 border-gray-50 rounded-2xl pl-14 pr-5 py-4 font-bold text-gray-700 focus:outline-none focus:border-[#00B894] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-teal-100/20 border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Filter identifiers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-[#00B894] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => markAll('Present')}
              className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll('Absent')}
              className="px-4 py-2 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all border border-rose-100"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-50">
              <tr>
                <th className="px-8 py-4">Student Identity</th>
                <th className="px-8 py-4">Status Configuration</th>
                <th className="px-8 py-4">Contextual Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center">
                    <div className="inline-block w-8 h-8 border-4 border-teal-50 border-t-[#00B894] rounded-full animate-spin" />
                    <p className="mt-2 text-[10px] text-gray-400 font-black uppercase tracking-widest">Compiling Roster...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-8 py-12 text-center text-gray-400 text-sm italic">
                    No active targets identified in this vector.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.studentId} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-[#00B894] font-black text-xs ring-2 ring-white shadow-sm font-mono">
                          {s.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="text-sm font-black text-gray-900">{s.studentName}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-2xl w-fit">
                        {[
                          { val: 'Present', icon: CheckCircle2, color: 'emerald' },
                          { val: 'Late', icon: Clock, color: 'amber' },
                          { val: 'Absent', icon: XCircle, color: 'rose' }
                        ].map((status) => (
                          <button
                            key={status.val}
                            onClick={() => handleStatusChange(s.studentId, status.val as any)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${s.status === status.val
                                ? `bg-${status.color}-500 text-white shadow-lg shadow-${status.color}-500/20`
                                : `text-gray-400 hover:bg-white`
                              }`}
                          >
                            <status.icon className={`w-3.5 h-3.5 ${s.status === status.val ? 'text-white' : `text-${status.color}-400`}`} />
                            {status.val}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <input
                        type="text"
                        placeholder="Add operational notes..."
                        value={s.remarks || ''}
                        onChange={(e) => handleRemarksChange(s.studentId, e.target.value)}
                        className="bg-transparent border-b border-dashed border-gray-200 focus:border-[#00B894] focus:outline-none py-1 text-sm font-medium w-full text-gray-600 placeholder:text-gray-300 transition-colors"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
