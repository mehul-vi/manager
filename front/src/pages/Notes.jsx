import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { Plus, Search, Trash2, Edit2, X, AlertCircle } from 'lucide-react';

export default function Notes() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [formData, setFormData] = useState({ title: '', content: '' });

    const fetchNotes = useCallback(async () => {
        try {
            await Promise.resolve();
            setLoading(true);
            const res = await api.get('/notes');
            setNotes(res.data?.data || res.data || []);
        } catch {
            toast.error('Failed to load notes');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const handleDeleteNote = async (noteId) => {
        try {
            await api.delete(`/notes/${noteId}`);
            setNotes((prev) => prev.filter((n) => n._id !== noteId));
            toast.success('Note deleted');
        } catch {
            toast.error('Failed to delete note');
        }
    };

    const handleOpenModal = (note = null) => {
        if (note) {
            setEditingNote(note);
            setFormData({ title: note.title || '', content: note.content || '' });
        } else {
            setEditingNote(null);
            setFormData({ title: '', content: '' });
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingNote) {
                const res = await api.put(`/notes/${editingNote._id}`, formData);
                const updated = res.data?.data || res.data;
                setNotes((prev) => prev.map((n) => (n._id === editingNote._id ? updated : n)));
                toast.success('Note updated');
            } else {
                const res = await api.post('/notes', formData);
                const created = res.data?.data || res.data;
                setNotes((prev) => [created, ...prev]);
                toast.success('Note created');
            }
            setIsModalOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save note');
        }
    };

    const filteredNotes = notes.filter((n) => {
        const q = searchQuery.toLowerCase();
        return n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q);
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100">Quick Notes</h1>
                    <p className="text-sm text-slate-400 mt-1">Capture ideas and meeting notes</p>
                </div>
                <button onClick={() => handleOpenModal()} className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                    <Plus size={18} /> Create Note
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search notes..." className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none" />
            </div>

            {loading ? (
                <div className="py-16 text-center text-slate-400">Loading notes...</div>
            ) : filteredNotes.length === 0 ? (
                <div className="bg-slate-900/40 border border-slate-800 p-12 text-center text-slate-400"><AlertCircle className="mx-auto mb-2" size={32} />No notes found.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredNotes.map((note) => (
                        <div key={note._id} className="p-5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col justify-between min-h-[160px]">
                            <div className="space-y-2">
                                <h3 className="text-sm font-semibold text-slate-100 truncate">{note.title}</h3>
                                <p className="text-xs text-slate-400 line-clamp-4">{note.content}</p>
                            </div>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 text-slate-500 text-xs">
                                <span>{note.updatedAt ? new Date(note.updatedAt).toLocaleDateString() : ''}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal(note)} className="p-1 hover:text-indigo-400"><Edit2 size={15} /></button>
                                    <button onClick={() => handleDeleteNote(note._id)} className="p-1 hover:text-rose-400"><Trash2 size={15} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-950/80 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl p-6 space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                            <h2 className="text-slate-100 font-bold">{editingNote ? 'Edit Note' : 'New Note'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Title" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100" />
                            <textarea rows={6} required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} placeholder="Content..." className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100" />
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