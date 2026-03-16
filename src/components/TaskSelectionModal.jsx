import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import useApi from '../hooks/useApi';

const TaskSelectionModal = ({ isOpen, onClose, selectedDate, onSelectExistingTask, onCreateNewTask }) => {
    const { t, i18n } = useTranslation();
    const [searchTerm, setSearchTerm] = useState('');
    const [allTasks, setAllTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const { getTasks } = useApi();

    const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

    useEffect(() => {
        if (isOpen) {
            fetchTasks();
        }
    }, [isOpen]);

    useEffect(() => {
        if (searchTerm.trim().length < 3) {
            setFilteredTasks([]);
        } else {
            const filtered = allTasks.filter(task =>
                task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (task.Tags && task.Tags.some(tag => tag.name.toLowerCase().includes(searchTerm.toLowerCase())))
            );
            setFilteredTasks(filtered);
        }
    }, [searchTerm, allTasks]);

    const fetchTasks = async () => {
        try {
            const res = await getTasks();
            setAllTasks(res.data);
            // setFilteredTasks(res.data); // Removed initial population
        } catch (err) {
            console.error('Erro ao buscar tarefas:', err);
        }
    };

    const handleSelectTask = (task) => {
        onSelectExistingTask(task.id, selectedDate);
        onClose();
    };

    const handleCreateNew = () => {
        onCreateNewTask(selectedDate);
        onClose();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#94a3b8';
            case 'Completed': return '#10b981';
            default: return '#94a3b8';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Pending': return t('status.pending');
            case 'Completed': return t('status.completed');
            default: return status;
        }
    };

    if (!isOpen) return null;

    const parsedDate = selectedDate ? parse(selectedDate, 'yyyy-MM-dd', new Date()) : new Date();

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            <div className="glass-panel custom-scrollbar" onClick={(e) => e.stopPropagation()} style={{
                width: '600px',
                maxHeight: '80vh',
                overflowY: 'auto',
                padding: '30px',
                backgroundColor: '#1e293b',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.8rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {t('modals.addTask')}
                    </h2>
                    <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
                        {format(parsedDate, "EEEE, d 'de' MMMM", { locale: dateLocale })}
                    </span>
                </div>

                <button
                    onClick={handleCreateNew}
                    style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        fontSize: '1rem',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                        transition: 'transform 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    {t('modals.createNew')}
                </button>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {t('modals.selectExisting')}
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('modals.searchPlaceholder')}
                        autoFocus
                        style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #334155',
                            background: '#0f172a',
                            color: 'white',
                            fontSize: '1rem',
                            marginBottom: '15px'
                        }}
                    />

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {filteredTasks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                                {searchTerm.trim().length >= 3 ? t('modals.noTasksFound') : t('modals.typeToSearch')}
                            </div>
                        ) : (
                            filteredTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => handleSelectTask(task)}
                                    style={{
                                        padding: '15px',
                                        marginBottom: '10px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        border: '1px solid rgba(255,255,255,0.05)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                                        e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.5)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                                        <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>{task.title}</h3>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            padding: '3px 8px',
                                            borderRadius: '12px',
                                            background: `${getStatusColor(task.status)}22`,
                                            color: getStatusColor(task.status),
                                            border: `1px solid ${getStatusColor(task.status)}44`,
                                            whiteSpace: 'nowrap',
                                            marginLeft: '10px'
                                        }}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p style={{ margin: '5px 0', fontSize: '0.85rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {task.description}
                                        </p>
                                    )}

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                            {task.Tags && task.Tags.slice(0, 3).map((tag, idx) => (
                                                <span key={idx} style={{
                                                    fontSize: '0.75rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: `${tag.color}22`,
                                                    color: tag.color,
                                                    border: `1px solid ${tag.color}44`
                                                }}>
                                                    {tag.name}
                                                </span>
                                            ))}
                                            {task.Tags && task.Tags.length > 3 && (
                                                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                    +{task.Tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                        {task.date && (
                                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                                {format(parse(task.date, 'yyyy-MM-dd', new Date()), 'd/MM/yyyy')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={onClose}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid #475569',
                            background: 'transparent',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.95rem'
                        }}
                    >
                        {t('modals.cancel')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskSelectionModal;
