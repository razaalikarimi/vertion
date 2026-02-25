import { useState, useEffect } from 'react';
import { Key, Search, Shield, Mail, Lock, Edit } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface UserData {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  role: string;
  utype: string;
  school_id?: string;
  school_name?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

const Users: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role: 'Teacher',
    school_id: '',
    is_active: true
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      if (currentUser?.utype === 'admin') {
        fetchSchools();
      }
    }
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Failed to fetch schools', error);
    }
  };



  const handleToggleStatus = async (user: UserData) => {
    try {
      const res = await api.put(`/users/${user.id}/toggle-status`);
      toast.success(res.data.message);
      fetchUsers();
    } catch (error) {
      console.error('Toggle status failed', error);
      toast.error('Failed to update status');
    }
  };

  const handleResetPassword = async (user: UserData) => {
    if (!window.confirm(`Reset password for "${user.full_name || user.email}"? This will set a default password.`)) return;
    try {
      const res = await api.put(`/users/${user.id}/reset-password`);
      toast.success(res.data.message);
    } catch (error) {
      console.error('Reset password failed', error);
      toast.error('Failed to reset password');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/users/${editingId}`, {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          school_id: formData.school_id || null,
          is_active: formData.is_active
        });
        toast.success('Identity profile updated');
      } else {
        await api.post('/users', {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          school_id: formData.school_id || null
        });
        toast.success('New identity provisioned successfully');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Failed to authorize provisioning';
      toast.error(msg);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      role: 'Teacher',
      school_id: currentUser?.school_id || '',
      is_active: true
    });
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <Shield className="w-8 h-8 text-[#00B894]" />
            Institutional Identity Matrix
          </h1>
          <p className="text-gray-500 mt-1 font-medium italic">Administrative surveillance and network access provisioning protocols.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-6 py-3 bg-[#00B894] text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-teal-500/20 hover:bg-[#00A884] transition-all active:scale-95 text-xs uppercase tracking-widest"
        >
          <Shield className="w-4 h-4" />
          Authorize New Identity
        </button>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Network Directory</h2>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Global User Database</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <select
              className="px-5 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none font-bold text-gray-700 focus:ring-2 focus:ring-[#00B894] transition-all"
              value={formData.school_id}
              onChange={(e) => setFormData({ ...formData, school_id: e.target.value })}
            >
              <option value="">All Campuses</option>
              {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search identities..."
                  className="pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm outline-none w-[250px] font-medium focus:ring-2 focus:ring-[#00B894] transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button className="bg-[#00C853] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
            Active All
          </button>
          <button className="bg-[#00BCD4] text-white px-5 py-2 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm text-nowrap">
            Hold All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-gray-500 text-xs font-bold border-b border-gray-100">
              <tr>
                <th className="px-4 py-4">Name</th>
                <th className="px-4 py-4">User Name</th>
                <th className="px-4 py-4">School Name</th>
                <th className="px-4 py-4">User Type</th>
                <th className="px-4 py-4">Mobile / WhatsApp</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B894] mx-auto"></div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400 text-sm">
                    No users found for this selection.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center p-2">
                          <img src={`https://ui-avatars.com/api/?name=${user.full_name}&background=ffedd5&color=faaf00`} alt="" className="w-full h-full rounded" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.first_name + ' ' + user.last_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-5 font-bold uppercase text-[11px] text-[#2c3e50]">{user.email.split('@')[0]}</td>
                    <td className="px-4 py-5 text-sm text-gray-600 font-medium">{user.school_name || 'Global HQ'}</td>
                    <td className="px-4 py-5">
                      <span className={`text-[11px] font-black uppercase ${user.utype === 'admin' ? 'text-blue-600' :
                        user.utype === 'principal' ? 'text-purple-600' :
                          user.utype === 'teacher' ? 'text-emerald-600' : 'text-rose-500'
                        }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      {user.phone ? (
                        <span className="text-sm font-medium text-gray-700">{user.phone}</span>
                      ) : (
                        <span className="text-sm font-bold text-red-500 italic">Profile not updated yet..</span>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`px-6 py-1.5 rounded-lg text-xs font-black text-white ${user.is_active ? 'bg-[#00C853]' : 'bg-[#FF5252]'}`}
                      >
                        {user.is_active ? 'Active' : 'Hold'}
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(user.id);
                            setFormData({
                              first_name: user.first_name,
                              last_name: user.last_name,
                              email: user.email,
                              password: '', // Password is not sent on edit
                              role: user.role,
                              school_id: user.school_id || '',
                              is_active: user.is_active
                            });
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-[#00B894] hover:bg-teal-50 rounded-lg transition-all"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResetPassword(user)}
                          className="bg-amber-100 text-amber-700 p-2 rounded-lg hover:bg-amber-200 transition-all flex items-center gap-1.5"
                          title="Reset Password"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl animate-in zoom-in slide-in-from-bottom-8 duration-300 overflow-hidden">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">{editingId ? 'Modify Identity' : 'Provision Identity'}</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium italic">Official security protocol for network access</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center text-[#00B894]">
                <Shield className="w-6 h-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Access Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    disabled={!!editingId}
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-medium disabled:opacity-50"
                  />
                </div>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Ranking Level</label>
                  <select
                    required
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black"
                  >
                    {currentUser?.utype === 'admin' && <option value="SuperAdmin">Super Administrator</option>}
                    <option value="Principal">Principal / Head</option>
                    <option value="Teacher">Faculty Member</option>
                    <option value="Staff">Institutional Staff</option>
                    <option value="Student">Enrolled Student</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Campus Association</label>
                  <select
                    required={formData.role !== 'SuperAdmin'}
                    value={formData.school_id}
                    onChange={e => setFormData({ ...formData, school_id: e.target.value })}
                    disabled={currentUser?.utype !== 'admin'}
                    className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-[#00B894] transition-all outline-none font-black disabled:opacity-50"
                  >
                    <option value="">Global Network</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3.5 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 font-black transition-all active:scale-[0.98]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3.5 bg-[#00B894] text-white rounded-2xl hover:bg-[#00A884] font-black shadow-lg shadow-teal-100 transition-all active:scale-[0.98]"
                >
                  {editingId ? 'Refine Identity' : 'Authorize Provisioning'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
