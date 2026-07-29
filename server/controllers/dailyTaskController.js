import DailyTask from '../models/DailyTask.js';

export const getDailyTasks = async (req, res, next) => {
    try {
        const { date, priority, status } = req.query;
        let query = { user: req.user._id };

        if (date) query.date = date;
        if (priority) query.priority = priority;
        if (status) query.status = status;

        const tasks = await DailyTask.find(query).sort({ createdAt: -1 });
        res.json(tasks);
    } catch (error) {
        next(error);
    }
};

export const createDailyTask = async (req, res, next) => {
    try {
        const { title, description, date, priority, status } = req.body;
        const task = await DailyTask.create({
            user: req.user._id,
            title,
            description,
            date,
            priority,
            status,
        });
        res.status(201).json(task);
    } catch (error) {
        next(error);
    }
};

export const updateDailyTask = async (req, res, next) => {
    try {
        const task = await DailyTask.findOne({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });

        Object.assign(task, req.body);
        const updatedTask = await task.save();
        res.json(updatedTask);
    } catch (error) {
        next(error);
    }
};

export const deleteDailyTask = async (req, res, next) => {
    try {
        const task = await DailyTask.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!task) return res.status(404).json({ message: 'Task not found' });
        res.json({ message: 'Task deleted successfully' });
    } catch (error) {
        next(error);
    }
};