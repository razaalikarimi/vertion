import React, { useState, useEffect } from 'react';
import { Calendar, Inbox, CheckCircle2, XCircle, Clock } from 'lucide-react';
import api from '../services/api';
import { toast } from 'sonner';

interface AttendanceRecord {
  date: string;
  status: string;
  remarks?: string;
}

interface AttendanceReport {
  month: string;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  records: AttendanceRecord[];
}

const TeacherAttendance: React.FC = () => {
  const [month, setMonth] = useState(new Date().toISOString().substring(0, 7)); // yyyy-mm
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    if (!month) return;
    const [year, m] = month.split('-').map(Number);
    setIsLoading(true);
    try {
      const res = await api.get(`/attendance/teacher-report?month=${m}&year=${year}`);
      setReport(res.data);
    } catch (error) {
      console.error('Failed to fetch attendance report', error);
      toast.error('Could not load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <h2 className="text-xl font-bold text-gray-800">Teacher Attendance Report - Monthly</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="month"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="pl-11 pr-6 py-2.5 bg-gray-50 border border-teal-100 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none w-[220px] font-bold text-gray-600"
              />
            </div>
            <button
              onClick={fetchReport}
              className="bg-[#00B894] text-white px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm hover:opacity-90 transition-opacity"
            >
              Search
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#00B894] mx-auto"></div>
            <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Filtering Records...</p>
          </div>
        ) : report && report.records.length > 0 ? (
          <div className="p-8 space-y-8">
            {/* Stats Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Present Days</p>
                  <h4 className="text-3xl font-black text-emerald-700">{report.presentDays}</h4>
                </div>
                <CheckCircle2 className="w-10 h-10 text-emerald-200" />
              </div>
              <div className="bg-rose-50 rounded-2xl p-6 border border-rose-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Absent Days</p>
                  <h4 className="text-3xl font-black text-rose-700">{report.absentDays}</h4>
                </div>
                <XCircle className="w-10 h-10 text-rose-200" />
              </div>
              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Late Arrivals</p>
                  <h4 className="text-3xl font-black text-amber-700">{report.lateDays}</h4>
                </div>
                <Clock className="w-10 h-10 text-amber-200" />
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.records.map((record, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-gray-700">
                        {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                              'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'Present' ? 'bg-emerald-500' :
                              record.status === 'Absent' ? 'bg-rose-500' :
                                'bg-amber-500'
                            }`}></span>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 italic">
                        {record.remarks || '---'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-gray-400">
            <div className="max-w-md mx-auto space-y-4 opacity-40">
              <Inbox className="w-16 h-16 mx-auto text-gray-200" />
              <p className="text-sm font-medium italic">No attendance data available for the selected month.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendance;
