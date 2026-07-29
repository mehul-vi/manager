import Note from '../models/Note.js';

export const getNotes = async (req, res, next) => {
    try {
        const { search } = req.query;
        let query = { user: req.user._id };

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
            ];
        }

        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        next(error);
    }
};

export const createNote = async (req, res, next) => {
    try {
        const { title, content } = req.body;
        const note = await Note.create({ user: req.user._id, title, content });
        res.status(201).json(note);
    } catch (error) {
        next(error);
    }
};

export const updateNote = async (req, res, next) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: 'Note not found' });

        note.title = req.body.title ?? note.title;
        note.content = req.body.content ?? note.content;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (error) {
        next(error);
    }
};

export const deleteNote = async (req, res, next) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        next(error);
    }
};