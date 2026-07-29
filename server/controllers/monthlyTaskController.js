import MonthlyTask from '../models/MonthlyTask.js';

export const getMonthlyTasks = async (req, res, next) => {
    try {
        const { month, priority } = req.query;
        let query = { user: req.user._id };

        if (month) query.targetMonth = month;
        if (priority) query.priority = priority;

        const tasks = await MonthlyTask.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const createMonthlyTask = async (req, res, next) => {
    try {
        const { title, description, targetMonth, priority } = req.body;
        const task = await MonthlyTask.create({
            user: req.user._id,
            title,
            description,
            targetMonth,
            priority,
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const updateMonthlyTask = async (req, res, next) => {
    try {
        const task = await MonthlyTask.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Goal not found' });

        Object.assign(task, req.body);
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteMonthlyTask = async (req, res, next) => {
    try {
        const task = await MonthlyTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Goal not found' });
        res.json({ message: 'Monthly goal deleted successfully' });
    } catch (error) {
        next(error);
    }
};