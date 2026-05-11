import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import Button from '../ui/Button';

const TaskHistory = ({ taskId }) => {
    const { getTaskLogs, addTaskComment } = useApi();
    const [taskLogs, setTaskLogs] = useState([]);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        if (taskId) {
            getTaskLogs(taskId)
                .then(res => setTaskLogs(res.data))
                .catch(err => console.error(err));
        }
    }, [taskId]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        addTaskComment(taskId, newComment)
            .then(res => {
                setTaskLogs([res.data, ...taskLogs]);
                setNewComment('');
            })
            .catch(err => alert(err.response?.data?.message || 'Erro ao adicionar comentário'));
    };

    if (!taskId) return null;

    return (
        <div className="history-section" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ marginBottom: '20px', color: '#fff', fontSize: '1.2rem' }}>Histórico e Comentários</h3>
            <div className="add-comment-section" style={{ marginBottom: '20px' }}>
                <textarea 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    placeholder="Adicionar um comentário..." 
                    className="form-textarea"
                    rows="2"
                    style={{ width: '100%' }}
                ></textarea>
                <Button type="button" variant="primary" onClick={handleAddComment} style={{ marginTop: '10px' }}>
                    Adicionar Comentário
                </Button>
            </div>
            <div className="logs-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {taskLogs.map(log => (
                    <div key={log.id} className="log-item" style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: '#9ca3af' }}>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <span style={{ 
                                    background: log.actionType === 'INACTIVATION' ? '#ef444433' : log.actionType === 'UPDATE' ? '#f59e0b33' : log.actionType === 'CREATION' ? '#10b98133' : '#3b82f633',
                                    color: log.actionType === 'INACTIVATION' ? '#ef4444' : log.actionType === 'UPDATE' ? '#f59e0b' : log.actionType === 'CREATION' ? '#10b981' : '#3b82f6',
                                    padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold'
                                }}>{log.actionType === 'COMMENT' ? 'COMENTÁRIO' : log.actionType === 'UPDATE' ? 'ATUALIZAÇÃO' : log.actionType === 'INACTIVATION' ? 'INATIVAÇÃO' : log.actionType === 'CREATION' ? 'CRIAÇÃO' : log.actionType}</span>
                                {log.User && log.User.name && <span style={{ color: '#cbd5e1' }}>{log.User.name}</span>}
                            </div>
                            <span>{new Date(log.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        {log.comment && (
                            <div style={{ marginBottom: log.changes ? '10px' : '0', color: '#fff', fontSize: '0.95rem' }}>
                                {log.comment}
                            </div>
                        )}
                        {log.changes && (
                            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '6px' }}>
                                {Object.keys(log.changes).map(field => (
                                    <div key={field} style={{ marginBottom: '4px' }}>
                                        <strong style={{ color: '#94a3b8' }}>{field}:</strong> {String(log.changes[field].old || 'N/A')} <span style={{ color: '#3b82f6' }}>➔</span> {String(log.changes[field].new || 'N/A')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                {taskLogs.length === 0 && <p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '20px' }}>Nenhum histórico encontrado.</p>}
            </div>
        </div>
    );
};

export default TaskHistory;
