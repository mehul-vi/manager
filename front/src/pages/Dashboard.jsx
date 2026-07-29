import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Calendar, FileText, TrendingUp, ArrowRight, Plus, AlertCircle, Sparkles } from 'lucide-react';

export default function Dashboard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ todayCompleted: 0, todayTotal: 0, monthlyGoalProgress: 0, totalNotes: 0 });
    const [todaysTasks, setTodaysTasks] = useState([]);
    const [recentNotes, setRecentNotes] = useState([]);

    const fetchDashboardData = async () => {
        try {
            await Promise.resolve();
            setLoading(true);
            const todayStr = new Date().toISOString().split('T')[0];

            const [dailyRes, monthlyRes, notesRes] = await Promise.all([
                api.get('/tasks/daily'),
                api.get('/tasks/monthly'),
                api.get('/notes'),
            ]);

            const dailyTasks = dailyRes.data?.data || dailyRes.data || [];
            const monthlyTasks = monthlyRes.data?.data || monthlyRes.data || [];
            const notes = notesRes.data?.data || notesRes.data || [];

            const filteredToday = dailyTasks.filter((task) => {
                if (!task.date) return true;
                return new Date(task.date).toISOString().split('T')[0] === todayStr;
            });

            const todayCompleted = filteredToday.filter((t) => t.completed).length;
            const completedMonthly = monthlyTasks.filter((m) => m.completed).length;
            const monthlyPct = monthlyTasks.length ? Math.round((completedMonthly / monthlyTasks.length) * 100) : 0;

            setStats({ todayCompleted, todayTotal: filteredToday.length, monthlyGoalProgress: monthlyPct, totalNotes: notes.length });
            setTodaysTasks(filteredToday.slice(0, 5));
            setRecentNotes(notes.slice(0, 3));
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const toggleTaskStatus = async (taskId, currentStatus) => {
        try {
            await api.patch(`/tasks/daily/${taskId}`, { completed: !currentStatus });
            fetchDashboardData();
        } catch (error) {
            console.error('Failed to update task:', error);
        }
    };

    const completionRate = stats.todayTotal ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) : 0;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading summary...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-3">
                            <Sparkles size={14} /> Daily Focus
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
                        <p className="text-sm text-slate-400 mt-1 max-w-xl">
                            {stats.todayTotal === 0 ? 'No tasks scheduled for today.' : `Completed ${stats.todayCompleted} of ${stats.todayTotal} tasks.`}
                        </p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 min-w-[240px]">
                        <div className="flex items-center justify-between text-xs font-medium mb-2">
                            <span className="text-slate-400">Today's Progress</span>
                            <span className="text-indigo-400">{completionRate}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 transition-all duration-500 ease-out" style={{ width: `${completionRate}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Daily Tasks</span>
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-3">{stats.todayCompleted} / {stats.todayTotal}</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Completion Rate</span>
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><TrendingUp size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-3">{completionRate}%</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Monthly Target</span>
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Calendar size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-3">{stats.monthlyGoalProgress}%</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-400">Saved Notes</span>
                        <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg"><FileText size={18} /></div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100 mt-3">{stats.totalNotes}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><Clock className="text-indigo-400" size={18} /><h2 className="text-lg font-semibold text-slate-100">Today's Priorities</h2></div>
                        <Link to="/daily-tasks" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">View All <ArrowRight size={14} /></Link>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl divide-y divide-slate-800/60">
                        {todaysTasks.length === 0 ? (
                            <div className="p-8 text-center space-y-3">
                                <AlertCircle className="mx-auto text-slate-600" size={28} />
                                <p className="text-sm text-slate-400">No tasks logged for today.</p>
                                <Link to="/daily-tasks" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium"><Plus size={14} /> Add First Task</Link>
                            </div>
                        ) : (
                            todaysTasks.map((task) => (
                                <div key={task._id} className="p-4 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button onClick={() => toggleTaskStatus(task._id, task.completed)} className={`w-5 h-5 rounded-md border flex items-center justify-center ${task.completed ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'}`}>
                                            <CheckCircle2 size={14} />
                                        </button>
                                        <span className={`text-sm truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{task.title}</span>
                                    </div>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase bg-slate-800 text-slate-400">{task.priority || 'normal'}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2"><FileText className="text-sky-400" size={18} /><h2 className="text-lg font-semibold text-slate-100">Recent Notes</h2></div>
                        <Link to="/notes" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1">All Notes <ArrowRight size={14} /></Link>
                    </div>
                    <div className="space-y-3">
                        {recentNotes.length === 0 ? (
                            <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-xl text-center"><p className="text-xs text-slate-400">No recent notes found.</p></div>
                        ) : (
                            recentNotes.map((note) => (
                                <div key={note._id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
                                    <h3 className="text-sm font-medium text-slate-200 truncate">{note.title}</h3>
                                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{note.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}