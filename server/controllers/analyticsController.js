import DailyTask from '../models/DailyTask.js';
import MonthlyTask from '../models/MonthlyTask.js';
import { format, subDays } from 'date-fns';

export const getDailyAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const today = format(new Date(), 'yyyy-MM-dd');

        // Today's summary
        const todayTasks = await DailyTask.find({ user: userId, date: today });
        const completedToday = todayTasks.filter((t) => t.status === 'Completed').length;
        const pendingToday = todayTasks.filter((t) => t.status === 'Pending').length;

        // Last 7 days breakdown
        const last7DaysData = [];
        for (let i = 6; i >= 0; i--) {
            const d = format(subDays(new Date(), i), 'yyyy-MM-dd');
            const dayTasks = await DailyTask.find({ user: userId, date: d });
            const comp = dayTasks.filter((t) => t.status === 'Completed').length;
            const pend = dayTasks.filter((t) => t.status === 'Pending').length;
            last7DaysData.push({
                date: format(subDays(new Date(), i), 'MMM dd'),
                completed: comp,
                pending: pend,
                total: dayTasks.length,
            });
        }

        res.json({
            today: {
                total: todayTasks.length,
                completed: completedToday,
                pending: pendingToday,
                percentage: todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0,
            },
            weeklyTrend: last7DaysData,
        });
    } catch (error) {
        next(error);
    }
};

export const getMonthlyAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const currentMonth = format(new Date(), 'yyyy-MM');

        const monthlyTasks = await MonthlyTask.find({ user: userId, month: currentMonth });
        const completed = monthlyTasks.filter((t) => t.status === 'Completed').length;
        const pending = monthlyTasks.filter((t) => t.status === 'Pending').length;

        res.json({
            month: currentMonth,
            total: monthlyTasks.length,
            completed,
            pending,
            percentage: monthlyTasks.length ? Math.round((completed / monthlyTasks.length) * 100) : 0,
        });
    } catch (error) {
        next(error);
    }
};