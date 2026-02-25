import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, SplitSquareHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface Division {
  id: string;
  name: string;
  count?: number;
}

// Divisions are stored as grades with section only
const StaffDivisions: React.FC = () => {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [divisionName, setDivisionName] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
    fetchDivisions();
  }, []);

  // Divisions are stored in localStorage as a simple list (no backend entity)
  const fetchDivisions = async () => {
    setLoading(true);
    try {
      // 1. Fetch real sections from API
      const gradesRes = await api.get('/grades');
      const grades = Array.isArray(gradesRes.data) ? gradesRes.data : (gradesRes.data.value || []);

      const realSectionsMap: Record<string, number> = {};
      grades.forEach((g: any) => {
        if (g.section) {
          realSectionsMap[g.section] = (realSectionsMap[g.section] || 0) + 1;
        }
      });

      // 2. Fetch virtual divisions from localStorage
      const stored = localStorage.getItem('lms_divisions');
      let virtualDivs: Division[] = [];
      if (stored) {
        virtualDivs = JSON.parse(stored);
      } else {
        virtualDivs = [
          { id: 'v-a', name: 'A' }, { id: 'v-b', name: 'B' }, { id: 'v-c', name: 'C' }
        ];
        localStorage.setItem('lms_divisions', JSON.stringify(virtualDivs));
      }

      // 3. Merge
      const allDivs: Division[] = [...virtualDivs];
      Object.entries(realSectionsMap).forEach(([name, count]) => {
        const existing = allDivs.find(d => d.name === name);
        if (existing) {
          existing.count = count;
        } else {
          allDivs.push({ id: `r-${name}`, name, count });
        }
      });

      setDivisions(allDivs);
    } catch (e) {
      console.error(e);
      toast.error('Failed to sync divisions with grades');
    } finally {
      setLoading(false);
    }
  };

  const saveDivisions = (list: Division[]) => {
    localStorage.setItem('lms_divisions', JSON.stringify(list));
    setDivisions(list);
  };

  const handleCreate = () => {
    if (!divisionName.trim()) {
      toast.error('Please enter a division name');
      return;
    }
    if (editingId) {
      const updated = divisions.map(d => d.id === editingId ? { ...d, name: divisionName } : d);
      saveDivisions(updated);
      toast.success('Division updated successfully');
    } else {
      const newDiv: Division = {
        id: `div-${Date.now()}`,
        name: divisionName.trim()
      };
      saveDivisions([...divisions, newDiv]);
      toast.success('Division created successfully');
    }
    setShowModal(false);
    setDivisionName('');
    setEditingId(null);
  };

  const handleEdit = (div: Division) => {
    setEditingId(div.id);
    setDivisionName(div.name);
    setShowModal(true);
  };

  const handleDelete = (div: Division) => {
    if (!window.confirm(`Delete division "${div.name}"?`)) return;
    const updated = divisions.filter(d => d.id !== div.id);
    saveDivisions(updated);
    toast.success('Division deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Divisions</h1>
          <p className="text-gray-500 mt-1 font-medium italic">Manage class divisions and sections</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 font-medium">
        Dashboard → <span className="cursor-pointer hover:text-[#00B894]">New Division</span> → <span className="text-[#00B894] font-bold">View Divisions</span>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 flex items-center justify-between border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">Division List</h2>
          <button
            onClick={() => { setEditingId(null); setDivisionName(''); setShowModal(true); }}
            className="px-4 py-2 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            New Division
          </button>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B894] mx-auto"></div>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-gray-500 text-xs font-bold border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4">Division Name</th>
                  <th className="px-6 py-4 text-center">Update</th>
                  <th className="px-6 py-4 text-center">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {divisions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center text-gray-400">
                      <SplitSquareHorizontal className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No divisions found</p>
                    </td>
                  </tr>
                ) : (
                  divisions.map((div) => (
                    <tr key={div.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 flex items-center justify-between font-semibold text-gray-800">
                        <span>{div.name}</span>
                        {div.count && (
                          <span className="text-[10px] bg-teal-50 text-[#00B894] px-2 py-1 rounded-full border border-teal-100 uppercase font-black">
                            {div.count} active grades
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleEdit(div)}
                          className="w-9 h-9 bg-[#00B894] text-white rounded-lg flex items-center justify-center hover:bg-[#00A884] mx-auto transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(div)}
                          className="w-9 h-9 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 mx-auto transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">{editingId ? 'Update Division' : 'Create Division'}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Division Name</label>
                <input
                  type="text"
                  value={divisionName}
                  onChange={e => setDivisionName(e.target.value)}
                  placeholder="Enter Division Name"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-[#00B894] text-white rounded-xl font-bold hover:bg-[#00A884]"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDivisions;
