import React, { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import api from '../services/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      let redirectPath = '/student/dashboard';
      if (user.utype === 'admin' || user.utype === 'superadmin') redirectPath = '/admin/dashboard';
      else if (user.utype === 'staff') redirectPath = '/staff/dashboard';
      else if (user.utype === 'teacher') redirectPath = '/teacher/dashboard';
      else if (user.utype === 'principal') redirectPath = '/principal/dashboard';
      else if (user.utype === 'student') redirectPath = '/student/dashboard';

      window.location.href = redirectPath;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-100/30 p-10 border border-gray-100">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#00B894] rounded-3xl shadow-lg shadow-teal-200 mb-6 rotate-3">
              <GraduationCap className="w-10 h-10 text-white -rotate-3" />
            </div>
            <h1 className="text-4xl font-black text-[#2c3e50] tracking-tight">Veriton</h1>
            <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">LMS Intelligence Portal</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-xs font-bold border border-rose-100 animate-in fade-in zoom-in duration-300">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@veriton.com"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-medium text-gray-700"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Security Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-medium text-gray-700"
              />
            </div>

            <div className="flex items-center justify-between pb-2">
              <label className="flex items-center cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 text-[#00B894] border-gray-200 rounded-lg focus:ring-[#00B894]" />
                <span className="ml-2 text-xs font-bold text-gray-500 group-hover:text-[#00B894] transition-colors">Remember identity</span>
              </label>
              <button type="button" className="text-xs font-bold text-[#00B894] hover:underline">Forgot?</button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00B894] text-white py-4 rounded-2xl hover:bg-[#00A884] shadow-lg shadow-teal-100 transition-all font-black text-sm uppercase tracking-widest active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : 'Secure Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center mt-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
          &copy; 2024 Veriton Educational Systems
        </p>
      </div>
    </div>
  );
};

export default Login;
