import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Calendar, CheckCircle2, Trash2, Edit2, X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export default function MonthlyTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', targetMonth: new Date().toISOString().slice(0, 7) });

    const fetchMonthlyTasks = useCallback(async () => {
        try {
            await Promise.resolve();
            setLoading(true);
            const res = await api.get('/tasks/monthly');
            const allTasks = res.data?.data || res.data || [];
            const filtered = allTasks.filter((task) => {
                const monthKey = task.targetMonth || (task.date && new Date(task.date).toISOString().slice(0, 7));
                return !monthKey || monthKey === selectedMonth;
            });
            setTasks(filtered);
        } catch {
            toast.error('Failed to load monthly goals');
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchMonthlyTasks();
    }, [fetchMonthlyTasks]);

    const handleMonthChange = (offset) => {
        const [year, month] = selectedMonth.split('-').map(Number);
        const date = new Date(year, month - 1 + offset, 1);
        setSelectedMonth(date.toISOString().slice(0, 7));
    };

    const toggleGoalStatus = async (taskId, currentCompleted) => {
        try {
            await api.patch(`/tasks/monthly/${taskId}`, { completed: !currentCompleted });
            setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, completed: !currentCompleted } : t)));
            toast.success(currentCompleted ? 'Goal reopened' : 'Goal completed!');
        } catch {
            toast.error('Failed to update goal');
        }
    };

    const handleDeleteGoal = async (taskId) => {
        try {
            await api.delete(`/tasks/monthly/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            toast.success('Goal deleted');
        } catch {
            toast.error('Failed to delete goal');
        }
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                targetMonth: task.targetMonth || selectedMonth,
            });
        } else {
            setEditingTask(null);
            setFormData({ title: '', description: '', priority: 'medium', targetMonth: selectedMonth });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                const res = await api.put(`/tasks/monthly/${editingTask._id}`, formData);
                const updated = res.data?.data || res.data;
                setTasks((prev) => prev.map((t) => (t._id === editingTask._id ? updated : t)));
                toast.success('Goal updated');
            } else {
                const res = await api.post('/tasks/monthly', formData);
                const created = res.data?.data || res.data;
                if ((created.targetMonth || selectedMonth) === selectedMonth) setTasks((prev) => [created, ...prev]);
                toast.success('Goal created');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save goal');
        }
    };

    const completedCount = tasks.filter((t) => t.completed).length;
    const progressPercentage = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Monthly Goals</h1>
                    <p className="text-sm text-slate-400 mt-1">Track high-level targets and milestones</p>
                </div>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <Plus size={18} /> Add Monthly Goal
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                    <button onClick={() => handleMonthChange(-1)} className="p-1.5 text-slate-400"><ChevronLeft size={18} /></button>
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-indigo-400" />
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none" />
                    </div>
                    <button onClick={() => handleMonthChange(1)} className="p-1.5 text-slate-400"><ChevronRight size={18} /></button>
                </div>

                <div className="md:col-span-2 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                        <span>Progress: {completedCount} / {tasks.length} Goals</span>
                        <span>{progressPercentage}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                        <div className="h-full bg-gradient-to-r from-indigo-500 to-amber-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="py-16 text-center text-slate-400">Loading goals...</div>
            ) : tasks.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 p-12 text-center text-slate-400"><AlertCircle className="mx-auto mb-2" size={32} />No goals for this month.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map((goal) => (
                        <div key={goal._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                    <button onClick={() => toggleGoalStatus(goal._id, goal.completed)} className={`mt-0.5 w-5 h-5 rounded border ${goal.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-700'}`}>
                                        <CheckCircle2 size={14} />
                                    </button>
                                    <div>
                                        <h3 className={`text-sm font-semibold ${goal.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>{goal.title}</h3>
                                        {goal.description && <p className="text-xs text-slate-400 mt-1">{goal.description}</p>}
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(goal)} className="p-1.5 text-slate-400 hover:text-indigo-400"><Edit2 size={15} /></button>
                                    <button onClick={() => handleDeleteGoal(goal._id)} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h2 className="text-slate-100 font-bold">{editingTask ? 'Edit Goal' : 'New Goal'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Goal Title" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100" />
                            <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Description" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100" />
                            <div className="grid grid-cols-2 gap-4">
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                                <input type="month" value={formData.targetMonth} onChange={(e) => setFormData({ ...formData, targetMonth: e.target.value })} className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-sm text-slate-100" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 text-sm">Cancel</button>
                                <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}