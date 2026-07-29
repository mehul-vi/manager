import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, Target, BarChart3 } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────
const toDateStr = (d) => d.toISOString().split('T')[0];
const toMonthStr = (d) => d.toISOString().slice(0, 7);

// ─── Custom Tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl text-xs">
            <p className="text-slate-300 font-semibold mb-1">{label}</p>
            {payload.map((p) => (
                <p key={p.dataKey} style={{ color: p.color }} className="mt-0.5">
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
}


// ─── Main Analytics Page ─────────────────────────────────────────────────────
export default function Analytics() {
    const [loading, setLoading] = useState(true);
    const [dailyTasks, setDailyTasks] = useState([]);
    const [monthlyTasks, setMonthlyTasks] = useState([]);
    const [activeTab, setActiveTab] = useState('daily'); // 'daily' | 'monthly'

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                const [dailyRes, monthlyRes] = await Promise.all([
                    api.get('/daily-tasks'),
                    api.get('/monthly-tasks'),
                ]);
                setDailyTasks(dailyRes.data?.data || dailyRes.data || []);
                setMonthlyTasks(monthlyRes.data?.data || monthlyRes.data || []);
            } catch (e) {
                console.error('Analytics fetch failed:', e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    // ── Daily: last 14 days time series ──────────────────────────────────────
    const dailyChartData = useMemo(() => {
        return Array.from({ length: 14 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (13 - i));
            const dateStr = toDateStr(d);
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const dayTasks = dailyTasks.filter((t) => t.date && new Date(t.date).toISOString().split('T')[0] === dateStr);
            const completed = dayTasks.filter((t) => t.completed).length;
            const pending = dayTasks.length - completed;
            return { date: label, Completed: completed, Pending: pending, Total: dayTasks.length };
        });
    }, [dailyTasks]);

    // ── Monthly: last 6 months time series ───────────────────────────────────
    const monthlyChartData = useMemo(() => {
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const monthStr = toMonthStr(d);
            const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
            const monthTasks = monthlyTasks.filter((t) => (t.targetMonth || '').startsWith(monthStr));
            const completed = monthTasks.filter((t) => t.completed).length;
            const pending = monthTasks.length - completed;
            return { month: label, Completed: completed, Pending: pending, Total: monthTasks.length };
        });
    }, [monthlyTasks]);

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalCompleted = dailyTasks.filter((t) => t.completed).length;
    const dailyRate = dailyTasks.length ? Math.round((totalCompleted / dailyTasks.length) * 100) : 0;
    const monthlyCompleted = monthlyTasks.filter((t) => t.completed).length;
    const monthlyRate = monthlyTasks.length ? Math.round((monthlyCompleted / monthlyTasks.length) * 100) : 0;
    const streak = useMemo(() => {
        let count = 0;
        const today = new Date();
        for (let i = 0; i < 30; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const ds = toDateStr(d);
            const dayTasks = dailyTasks.filter((t) => t.date && new Date(t.date).toISOString().split('T')[0] === ds);
            if (dayTasks.length > 0 && dayTasks.every((t) => t.completed)) count++;
            else if (i > 0) break;
        }
        return count;
    }, [dailyTasks]);

    const tabs = [
        { id: 'daily', label: 'Daily Tasks', icon: TrendingUp },
        { id: 'monthly', label: 'Monthly Goals', icon: Target },
    ];

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading analytics...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="text-indigo-400" size={24} /> Analytics & Insights
                </h1>
                <p className="text-sm text-slate-400 mt-1">Track your productivity over time</p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Daily Completion', value: `${dailyRate}%`, sub: `${totalCompleted} / ${dailyTasks.length} tasks`, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                    { label: 'Monthly Goal Rate', value: `${monthlyRate}%`, sub: `${monthlyCompleted} / ${monthlyTasks.length} goals`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                    { label: 'Perfect Day Streak', value: `${streak}d`, sub: 'consecutive days', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                    { label: 'Total Tasks Logged', value: dailyTasks.length + monthlyTasks.length, sub: 'across all time', color: 'text-sky-400', bg: 'bg-sky-500/10' },
                ].map((s) => (
                    <div key={s.label} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
                        <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                            <TrendingUp size={16} className={s.color} />
                        </div>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-900/60 border border-slate-800 rounded-xl p-1 w-fit">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
                    >
                        <Icon size={15} /> {label}
                    </button>
                ))}
            </div>

            {/* Tab: Daily Chart */}
            {activeTab === 'daily' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">Daily Task Completion — Last 14 Days</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Completed vs pending tasks per day</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={dailyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="date" stroke="#475569" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#475569" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                                <Line
                                    type="monotone" dataKey="Completed" stroke="#6366f1"
                                    strokeWidth={2.5} dot={{ fill: '#6366f1', r: 3 }} activeDot={{ r: 5 }}
                                />
                                <Line
                                    type="monotone" dataKey="Pending" stroke="#f59e0b"
                                    strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3 }} activeDot={{ r: 5 }}
                                    strokeDasharray="4 2"
                                />
                                <Line
                                    type="monotone" dataKey="Total" stroke="#334155"
                                    strokeWidth={1.5} dot={false} strokeDasharray="2 2"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Per-priority breakdown */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                        {['high', 'medium', 'low'].map((p) => {
                            const pTasks = dailyTasks.filter((t) => t.priority === p);
                            const pDone = pTasks.filter((t) => t.completed).length;
                            const colors = { high: 'text-rose-400', medium: 'text-amber-400', low: 'text-emerald-400' };
                            return (
                                <div key={p} className="text-center">
                                    <p className={`text-lg font-bold capitalize ${colors[p]}`}>{pDone}/{pTasks.length}</p>
                                    <p className="text-xs text-slate-500 capitalize">{p} priority</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tab: Monthly Chart */}
            {activeTab === 'monthly' && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-100">Monthly Goal Progress — Last 6 Months</h2>
                        <p className="text-xs text-slate-500 mt-0.5">Completed vs pending goals per month</p>
                    </div>
                    <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#475569" tick={{ fontSize: 11 }} allowDecimals={false} />
                                <Tooltip content={<ChartTooltip />} />
                                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
                                <Line
                                    type="monotone" dataKey="Completed" stroke="#10b981"
                                    strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} activeDot={{ r: 6 }}
                                />
                                <Line
                                    type="monotone" dataKey="Pending" stroke="#f59e0b"
                                    strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 4 }} activeDot={{ r: 6 }}
                                    strokeDasharray="4 2"
                                />
                                <Line
                                    type="monotone" dataKey="Total" stroke="#334155"
                                    strokeWidth={1.5} dot={false} strokeDasharray="2 2"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Monthly goal breakdown */}
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                        {['high', 'medium', 'low'].map((p) => {
                            const pTasks = monthlyTasks.filter((t) => t.priority === p);
                            const pDone = pTasks.filter((t) => t.completed).length;
                            const colors = { high: 'text-rose-400', medium: 'text-amber-400', low: 'text-emerald-400' };
                            return (
                                <div key={p} className="text-center">
                                    <p className={`text-lg font-bold capitalize ${colors[p]}`}>{pDone}/{pTasks.length}</p>
                                    <p className="text-xs text-slate-500 capitalize">{p} priority</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


        </div>
    );
}