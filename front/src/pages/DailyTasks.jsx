import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import {
    Plus,
    Calendar,
    CheckCircle2,
    Trash2,
    Edit2,
    Filter,
    X,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
} from 'lucide-react';

export default function DailyTasks() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    const [filterPriority, setFilterPriority] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
    });

    const fetchTasks = useCallback(async () => {
        try {
            await Promise.resolve();
            setLoading(true);
            const res = await api.get('/daily-tasks');
            const allTasks = res.data?.data || res.data || [];

            // Filter tasks matching selectedDate
            const filtered = allTasks.filter((task) => {
                if (!task.date) return true;
                return (
                    new Date(task.date).toISOString().split('T')[0] === selectedDate
                );
            });

            setTasks(filtered);
        } catch {
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const handleDateChange = (offsetDays) => {
        const current = new Date(selectedDate);
        current.setDate(current.getDate() + offsetDays);
        const newDateStr = current.toISOString().split('T')[0];
        setSelectedDate(newDateStr);
    };

    const toggleTaskStatus = async (taskId, currentCompleted) => {
        try {
            await api.patch(`/daily-tasks/${taskId}`, {
                completed: !currentCompleted,
            });
            setTasks((prev) =>
                prev.map((t) =>
                    t._id === taskId ? { ...t, completed: !currentCompleted } : t
                )
            );
            toast.success(currentCompleted ? 'Task reopened' : 'Task completed!');
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await api.delete(`/daily-tasks/${taskId}`);
            setTasks((prev) => prev.filter((t) => t._id !== taskId));
            toast.success('Task deleted');
        } catch {
            toast.error('Failed to delete task');
        }
    };

    const handleOpenModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title || '',
                description: task.description || '',
                priority: task.priority || 'medium',
                date: task.date
                    ? new Date(task.date).toISOString().split('T')[0]
                    : selectedDate,
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                date: selectedDate,
            });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                const res = await api.put(`/daily-tasks/${editingTask._id}`, formData);
                const updated = res.data?.data || res.data;
                setTasks((prev) =>
                    prev.map((t) => (t._id === editingTask._id ? updated : t))
                );
                toast.success('Task updated');
            } else {
                const res = await api.post('/daily-tasks', formData);
                const created = res.data?.data || res.data;
                if (formData.date === selectedDate) {
                    setTasks((prev) => [created, ...prev]);
                }
                toast.success('Task created');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to save task'
            );
        }
    };

    // Filter tasks locally by status & priority
    const displayedTasks = tasks.filter((task) => {
        const matchesPriority =
            filterPriority === 'all' || task.priority === filterPriority;
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'completed' && task.completed) ||
            (filterStatus === 'pending' && !task.completed);

        return matchesPriority && matchesStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header & Date Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Daily Tasks</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        Manage and track your day-to-day items
                    </p>
                </div>

                <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-lg shadow-indigo-600/20"
                >
                    <Plus size={18} />
                    Add Daily Task
                </button>
            </div>

            {/* Date Navigator Bar */}
            <div className="flex items-center justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                <button
                    onClick={() => handleDateChange(-1)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-indigo-400" />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-transparent text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
                    />
                </div>

                <button
                    onClick={() => handleDateChange(1)}
                    className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Filter size={14} />
                    <span>Filters:</span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {/* Priority Selector */}
                    <select
                        value={filterPriority}
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Priorities</option>
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                    </select>

                    {/* Status Selector */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="all">All Statuses</option>
                        <option value="pending">Pending Only</option>
                        <option value="completed">Completed Only</option>
                    </select>
                </div>
            </div>

            {/* Task Cards List */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-400">Fetching daily items...</p>
                </div>
            ) : displayedTasks.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
                    <AlertCircle className="mx-auto text-slate-600 mb-3" size={32} />
                    <h3 className="text-slate-300 font-semibold text-base">No tasks found</h3>
                    <p className="text-slate-500 text-xs mt-1">
                        No items matching your selected date and filters.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {displayedTasks.map((task) => (
                        <div
                            key={task._id}
                            className={`group flex items-start justify-between gap-4 p-4 rounded-xl border transition-all ${task.completed
                                    ? 'bg-slate-900/20 border-slate-800/50 opacity-70'
                                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                                }`}
                        >
                            <div className="flex items-start gap-3 min-w-0">
                                <button
                                    onClick={() => toggleTaskStatus(task._id, task.completed)}
                                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${task.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                                            : 'border-slate-700 hover:border-indigo-500 text-transparent'
                                        }`}
                                >
                                    <CheckCircle2 size={14} className="stroke-[3]" />
                                </button>

                                <div className="min-w-0 space-y-1">
                                    <p
                                        className={`text-sm font-medium ${task.completed
                                                ? 'line-through text-slate-500'
                                                : 'text-slate-100'
                                            }`}
                                    >
                                        {task.title}
                                    </p>

                                    {task.description && (
                                        <p className="text-xs text-slate-400 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 pt-1">
                                        <span
                                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${task.priority === 'high'
                                                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                                    : task.priority === 'medium'
                                                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        : 'bg-slate-800 text-slate-400'
                                                }`}
                                        >
                                            {task.priority || 'medium'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleOpenModal(task)}
                                    className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteTask(task._id)}
                                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Task Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 space-y-5 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                            <h2 className="text-lg font-bold text-slate-100">
                                {editingTask ? 'Edit Task' : 'New Task'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Task Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) =>
                                        setFormData({ ...formData, title: e.target.value })
                                    }
                                    placeholder="e.g. Complete API documentation"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-300 mb-1">
                                    Description (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, description: e.target.value })
                                    }
                                    placeholder="Additional context or sub-steps..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">
                                        Priority
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) =>
                                            setFormData({ ...formData, priority: e.target.value })
                                        }
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-300 mb-1">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) =>
                                            setFormData({ ...formData, date: e.target.value })
                                        }
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-md shadow-indigo-600/20"
                                >
                                    {editingTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}