import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';

const TagManager = ({ onClose }) => {
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState({ name: '', color: '#000000' });
    const { getTags, createTag, deleteTag } = useApi();

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await getTags();
            setTags(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await createTag(newTag);
            setNewTag({ name: '', color: '#000000' });
            fetchTags();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this tag?')) {
            try {
                await deleteTag(id);
                fetchTags();
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001
        }} onClick={onClose}>
            <div className="glass-panel" onClick={(e) => e.stopPropagation()} style={{ width: '400px', padding: '20px', backgroundColor: '#1e293b' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Manage Tags</h2>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                </div>

                <form onSubmit={handleCreate} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text" placeholder="Tag Name" value={newTag.name} onChange={(e) => setNewTag({ ...newTag, name: e.target.value })} required
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #475569', background: '#334155', color: 'white' }}
                    />
                    <input
                        type="color" value={newTag.color} onChange={(e) => setNewTag({ ...newTag, color: e.target.value })}
                        style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <button type="submit" className="btn-primary">Add</button>
                </form>

                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {tags.map(tag => (
                        <div key={tag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '15px', height: '15px', borderRadius: '50%', backgroundColor: tag.color }}></div>
                                <span>{tag.name}</span>
                            </div>
                            <button onClick={() => handleDelete(tag.id)} style={{ background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}>Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TagManager;
