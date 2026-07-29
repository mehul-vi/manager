import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
    CheckCircle2, ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, Plus, Clock,
} from 'lucide-react';

const toDateStr = (d) => d.toISOString().split('T')[0];

export default function CalendarPage() {
    const [dailyTasks, setDailyTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const today = new Date();
    const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selected, setSelected] = useState(toDateStr(today));

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const res = await api.get('/tasks/daily');
                setDailyTasks(res.data?.data || res.data || []);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
    while (cells.length % 7 !== 0) cells.push(null);

    const tasksByDate = useMemo(() => {
        const map = {};
        dailyTasks.forEach((t) => {
            if (!t.date) return;
            const key = new Date(t.date).toISOString().split('T')[0];
            if (!map[key]) map[key] = [];
            map[key].push(t);
        });
        return map;
    }, [dailyTasks]);

    const selectedTasks = tasksByDate[selected] || [];
    const todayStr = toDateStr(today);

    const changeMonth = (offset) => setViewDate(new Date(year, month + offset, 1));

    const completedToday = selectedTasks.filter((t) => t.completed).length;
    const progressPct = selectedTasks.length ? Math.round((completedToday / selectedTasks.length) * 100) : 0;

    // Stats for current month view
    const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    const monthTasks = dailyTasks.filter((t) => t.date && t.date.startsWith(monthStr));
    const monthCompleted = monthTasks.filter((t) => t.completed).length;
    const activeDays = new Set(monthTasks.map((t) => t.date?.slice(0, 10))).size;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                        <CalendarIcon className="text-indigo-400" size={24} />
                        Task Calendar
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">View and track your daily tasks by date</p>
                </div>
            </div>

            {/* Month summary chips */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Tasks This Month', value: monthTasks.length, color: 'text-indigo-400' },
                    { label: 'Completed', value: monthCompleted, color: 'text-emerald-400' },
                    { label: 'Active Days', value: activeDays, color: 'text-amber-400' },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-center">
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Main grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* ── Calendar ── */}
                <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
                    {/* Nav */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-slate-100">
                            {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h2>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => changeMonth(-1)}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => { setViewDate(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(todayStr); }}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors border border-slate-700"
                            >
                                Today
                            </button>
                            <button
                                onClick={() => changeMonth(1)}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Weekday labels */}
                    <div className="grid grid-cols-7 mb-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                            <div key={d} className="text-center text-[11px] font-semibold text-slate-500 uppercase py-2">{d}</div>
                        ))}
                    </div>

                    {/* Day cells */}
                    <div className="grid grid-cols-7 gap-1.5">
                        {cells.map((day, idx) => {
                            if (!day) return <div key={`blank-${idx}`} className="aspect-square" />;

                            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const tasks = tasksByDate[dateStr] || [];
                            const done = tasks.filter((t) => t.completed).length;
                            const total = tasks.length;
                            const isToday = dateStr === todayStr;
                            const isSelected = dateStr === selected;
                            const allDone = total > 0 && done === total;

                            return (
                                <button
                                    key={dateStr}
                                    onClick={() => setSelected(dateStr)}
                                    className={`relative aspect-square flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-all duration-150
                                        ${isSelected
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                                            : isToday
                                                ? 'ring-2 ring-indigo-500/60 text-indigo-300 hover:bg-slate-800'
                                                : allDone
                                                    ? 'bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                                                    : total > 0
                                                        ? 'bg-slate-800/60 text-slate-200 hover:bg-slate-800'
                                                        : 'text-slate-500 hover:bg-slate-800/40'
                                        }`}
                                >
                                    <span>{day}</span>
                                    {total > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {tasks.slice(0, 4).map((t, i) => (
                                                <span
                                                    key={i}
                                                    className={`w-1 h-1 rounded-full ${t.completed ? 'bg-emerald-400' : 'bg-amber-400'} ${isSelected ? 'opacity-80' : ''}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-5 mt-5 pt-4 border-t border-slate-800">
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed task
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-amber-400" /> Pending task
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-3 h-3 rounded-sm bg-emerald-500/10 border border-emerald-500/30" /> All done
                        </span>
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <span className="w-3 h-3 rounded-sm ring-2 ring-indigo-500/60" /> Today
                        </span>
                    </div>
                </div>

                {/* ── Task Panel ── */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[420px]">
                    {/* Date heading */}
                    <div className="mb-4">
                        <h3 className="text-base font-semibold text-slate-100">
                            {new Date(selected + 'T12:00:00').toLocaleDateString('en-US', {
                                weekday: 'long', month: 'long', day: 'numeric',
                            })}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {selectedTasks.length === 0
                                ? 'No tasks logged'
                                : `${completedToday} of ${selectedTasks.length} completed`}
                        </p>

                        {/* Progress bar */}
                        {selectedTasks.length > 0 && (
                            <div className="mt-3">
                                <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                                    <span>Progress</span>
                                    <span>{progressPct}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-indigo-500 transition-all duration-500"
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : selectedTasks.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-8">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center">
                                <CalendarIcon size={22} className="text-slate-600" />
                            </div>
                            <p className="text-sm text-slate-500">No tasks on this day</p>
                            <p className="text-xs text-slate-600">Add tasks in the Daily Tasks page</p>
                        </div>
                    ) : (
                        <div className="flex-1 space-y-2.5 overflow-y-auto pr-1">
                            {selectedTasks.map((task) => (
                                <div
                                    key={task._id}
                                    className={`flex items-start gap-3 p-3.5 rounded-xl border transition-colors
                                        ${task.completed
                                            ? 'border-emerald-500/20 bg-emerald-500/5'
                                            : 'border-slate-700/50 bg-slate-800/30'}`}
                                >
                                    <CheckCircle2
                                        size={16}
                                        className={`mt-0.5 shrink-0 ${task.completed ? 'text-emerald-400' : 'text-slate-600'}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                                            {task.title}
                                        </p>
                                        {task.description && (
                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{task.description}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {task.priority && (
                                                <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded
                                                    ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400' :
                                                        task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-slate-700 text-slate-400'}`}>
                                                    {task.priority}
                                                </span>
                                            )}
                                            {task.completed && (
                                                <span className="text-[10px] text-emerald-500 font-medium">✓ Done</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Quick add note */}
                    <div className="mt-4 pt-4 border-t border-slate-800">
                        <p className="text-[11px] text-slate-600 flex items-center gap-1.5">
                            <Clock size={12} /> Tasks are managed in the Daily Tasks section
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
