import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '../services/api';

interface QuestionData {
  id: string;
  exam_id: string;
  exam_title?: string;
  grade_name?: string;
  module_name?: string;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  is_active: boolean;
}

interface Grade {
  id: string;
  grade_name: string;
}

interface Module {
  id: string;
  name: string;
  grade_id: string;
}

interface Exam {
  id: string;
  title: string;
  module_id: string;
}

const StaffModuleQuestions: React.FC = () => {
  const location = useLocation();
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredModules, setFilteredModules] = useState<Module[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (location.pathname.includes('/create')) {
      setView('create');
    } else {
      setView('list');
    }
  }, [location]);

  const [formData, setFormData] = useState({
    exam_id: '',
    grade_id: '',
    module_id: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_answer: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, gradesRes, modulesRes, examsRes] = await Promise.allSettled([
        api.get('/questions'),
        api.get('/grades'),
        api.get('/modules'),
        api.get('/exams')
      ]);

      if (questionsRes.status === 'fulfilled') {
        const data = questionsRes.value.data;
        setQuestions(Array.isArray(data) ? data : (data.value || []));
      }
      if (gradesRes.status === 'fulfilled') {
        const data = gradesRes.value.data;
        setGrades(Array.isArray(data) ? data : (data.value || []));
      }
      if (modulesRes.status === 'fulfilled') {
        const data = modulesRes.value.data;
        const mods = Array.isArray(data) ? data : (data.value || []);
        setModules(mods);
        setFilteredModules(mods);
      }
      if (examsRes.status === 'fulfilled') {
        const data = examsRes.value.data;
        const exms = Array.isArray(data) ? data : (data.value || []);
        setExams(exms);
        setFilteredExams(exms);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (gradeId: string) => {
    setFormData(prev => ({ ...prev, grade_id: gradeId, module_id: '', exam_id: '' }));
    setFilteredModules(modules.filter(m => m.grade_id === gradeId));
    setFilteredExams([]);
  };

  const handleModuleChange = (moduleId: string) => {
    setFormData(prev => ({ ...prev, module_id: moduleId, exam_id: '' }));
    setFilteredExams(exams.filter(e => e.module_id === moduleId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      toast.error('Please enter the question text');
      return;
    }
    if (!formData.correct_answer) {
      toast.error('Please select the correct answer');
      return;
    }

    const payload = {
      exam_id: formData.exam_id,
      question_text: formData.question_text,
      option_a: formData.option_a,
      option_b: formData.option_b,
      option_c: formData.option_c,
      option_d: formData.option_d,
      correct_answer: formData.correct_answer
    };

    if (!payload.exam_id) {
      toast.error('Please select an exam/module mapping');
      return;
    }

    try {
      if (editingId) {
        await api.put(`/questions/${editingId}`, { ...payload, is_active: true });
        toast.success('Question updated successfully');
      } else {
        await api.post('/questions', payload);
        toast.success('Question created successfully');
      }
      resetForm();
      setView('list');
      fetchData();
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Error saving question';
      toast.error(msg);
    }
  };

  const handleEdit = (q: QuestionData) => {
    // Find exam to get module and grade IDs
    const exam = exams.find(e => e.id === q.exam_id);
    const module = modules.find(m => m.id === exam?.module_id);
    const gradeId = module?.grade_id || '';
    const moduleId = module?.id || '';

    // Update filters for the UI
    if (gradeId) setFilteredModules(modules.filter(m => m.grade_id === gradeId));
    if (moduleId) setFilteredExams(exams.filter(e => e.module_id === moduleId));

    setEditingId(q.id);
    setFormData({
      exam_id: q.exam_id,
      grade_id: gradeId,
      module_id: moduleId,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_answer: q.correct_answer
    });
    setView('create');
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/questions/${id}`);
      toast.success('Question deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete question');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      exam_id: '',
      grade_id: '',
      module_id: '',
      question_text: '',
      option_a: '',
      option_b: '',
      option_c: '',
      option_d: '',
      correct_answer: ''
    });
  };

  const answerOptions = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
    { label: 'Option C', value: 'C' },
    { label: 'Option D', value: 'D' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Module Questions</h1>
      </div>

      {/* Breadcrumb */}
      <div className="text-sm text-gray-400 font-medium flex items-center gap-2">
        <span>Dashboard</span> →
        <button
          onClick={() => { resetForm(); setView('create'); }}
          className={`hover:text-[#00B894] ${view === 'create' ? 'text-[#00B894] font-bold' : ''}`}
        >
          New Module Question
        </button>
        →
        <button
          onClick={() => setView('list')}
          className={`hover:text-[#00B894] ${view === 'list' ? 'text-[#00B894] font-bold' : ''}`}
        >
          View Module Questions
        </button>
      </div>

      {view === 'list' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Module Questions</h2>
            <button
              onClick={() => { resetForm(); setView('create'); }}
              className="px-4 py-2 bg-[#00B894] text-white rounded-lg hover:bg-[#00A884] flex items-center gap-2 text-sm font-bold"
            >
              <Plus className="w-4 h-4" />
              New Question
            </button>
          </div>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00B894] mx-auto"></div>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="text-gray-500 text-xs font-bold border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="px-4 py-4">Grade</th>
                    <th className="px-4 py-4">Module</th>
                    <th className="px-4 py-4">Question</th>
                    <th className="px-4 py-4">Option 1</th>
                    <th className="px-4 py-4">Option 2</th>
                    <th className="px-4 py-4">Option 3</th>
                    <th className="px-4 py-4">Option 4</th>
                    <th className="px-4 py-4">Right Answer</th>
                    <th className="px-4 py-4 text-center">Update</th>
                    <th className="px-4 py-4 text-center">Delete</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-16 text-center text-gray-400">
                        <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No questions found. Create your first question!</p>
                      </td>
                    </tr>
                  ) : (
                    questions.map((q) => (
                      <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-600 text-xs">{q.grade_name || 'N/A'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{q.module_name || 'N/A'}</td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px]">
                          <div className="truncate" title={q.question_text}>{q.question_text}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px]">
                          <div className="truncate">{q.option_a}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px]">
                          <div className="truncate">{q.option_b}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px]">
                          <div className="truncate">{q.option_c}</div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[100px]">
                          <div className="truncate">{q.option_d}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100">
                            {q.correct_answer}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleEdit(q)}
                            className="w-8 h-8 bg-[#00B894] text-white rounded-lg flex items-center justify-center hover:bg-[#00A884] mx-auto"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="w-8 h-8 bg-red-500 text-white rounded-lg flex items-center justify-center hover:bg-red-600 mx-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">
              {editingId ? 'Update Module Question' : 'Create Module Question'}
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Grade + Module Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Grade</label>
                <select
                  value={formData.grade_id}
                  onChange={e => handleGradeChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select a grade</option>
                  {grades.map(g => (
                    <option key={g.id} value={g.id}>{g.grade_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Modules</label>
                <select
                  value={formData.module_id}
                  onChange={e => handleModuleChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select a module</option>
                  {filteredModules.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Exam Selection Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Exam Link *</label>
                <select
                  value={formData.exam_id}
                  onChange={e => setFormData(prev => ({ ...prev, exam_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select an exam</option>
                  {filteredExams.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Question - Full Width */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Question</label>
              <textarea
                rows={4}
                value={formData.question_text}
                onChange={e => setFormData(prev => ({ ...prev, question_text: e.target.value }))}
                placeholder="Enter the question..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none resize-none"
              />
            </div>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {(['option_a', 'option_b', 'option_c', 'option_d'] as const).map((key, idx) => (
                <div key={key}>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Option {idx + 1}
                  </label>
                  <textarea
                    rows={2}
                    value={formData[key]}
                    onChange={e => setFormData(prev => ({ ...prev, [key]: e.target.value }))}
                    placeholder={`Enter option ${idx + 1}...`}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none resize-none text-sm"
                  />
                </div>
              ))}
            </div>

            {/* Right Answer Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Right Answer</label>
                <select
                  value={formData.correct_answer}
                  onChange={e => setFormData(prev => ({ ...prev, correct_answer: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B894] outline-none"
                >
                  <option value="">Select Right Answer</option>
                  {answerOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { resetForm(); setView('list'); }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-[#00B894] text-white rounded-xl font-bold hover:bg-[#00A884]"
              >
                {editingId ? 'Update Question' : 'Create Question'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default StaffModuleQuestions;
