import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useApi from '../hooks/useApi';
import useTaskForm from '../hooks/useTaskForm';

import Modal from './ui/Modal';
import Button from './ui/Button';

import TaskBasicInfo from './TaskModalParts/TaskBasicInfo';
import TaskTags from './TaskModalParts/TaskTags';
import TaskSubtasks from './TaskModalParts/TaskSubtasks';
import TaskDependencies from './TaskModalParts/TaskDependencies';
import TaskHistory from './TaskModalParts/TaskHistory';

import './TaskModal.css';

const TaskModal = ({ task, onClose, onSave, onDelete }) => {
    const { t } = useTranslation();
    const { getTasks, getTags } = useApi();
    
    const { formData, setFormData, handleChange, updateField } = useTaskForm(task);
    
    const [availableTasks, setAvailableTasks] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    
    const [showReasonModal, setShowReasonModal] = useState(false);
    const [inactivationReason, setInactivationReason] = useState('');

    useEffect(() => {
        getTasks().then(res => {
            const tasks = res.data.filter(t => !task || t.id !== task.id);
            setAvailableTasks(tasks);
        }).catch(err => console.error(err));

        getTags().then(res => {
            setAvailableTags(res.data);
        }).catch(err => console.error(err));
    }, [task]);

    const handleSubmit = (e) => {
        if (e) e.preventDefault();

        // Check if task is being inactivated and there is no reason
        if (task && task.active && !formData.active && !inactivationReason) {
            setShowReasonModal(true);
            return;
        }

        const dataToSave = { ...formData };
        if (task && task.active && !formData.active) {
            dataToSave.inactivationReason = inactivationReason;
        }

        onSave(dataToSave);
        setShowReasonModal(false);
        setInactivationReason('');
    };

    return (
        <>
            <Modal 
                isOpen={true} 
                onClose={onClose} 
                className="task-modal-content"
            >
                <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'flex-start', marginBottom: '25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <h2 className="modal-title" style={{ margin: 0, fontSize: '1.8rem' }}>
                            {task && task.id ? t('modals.editTask') : t('modals.newTask')}
                        </h2>
                        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                            {formData.isRecurring && (
                                <div
                                    className="active-toggle"
                                    style={{ backgroundColor: formData.active ? '#10b981' : '#ef4444' }}
                                    onClick={() => updateField('active', !formData.active)}
                                    title={formData.active ? "Clique para inativar" : "Clique para ativar"}
                                >
                                    {formData.active ? "Ativa" : "Inativa"}
                                </div>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    background: 'transparent', border: 'none', color: '#94a3b8',
                                    fontSize: '1.8rem', cursor: 'pointer', padding: '0 5px', lineHeight: 1
                                }}
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <TaskBasicInfo 
                        formData={formData} 
                        handleChange={handleChange} 
                        updateField={updateField} 
                        isEditMode={!!(task && task.id)}
                    />

                    <TaskTags 
                        tags={formData.tags} 
                        availableTags={availableTags} 
                        updateField={updateField} 
                    />

                    <TaskSubtasks 
                        subtasks={formData.subtasks} 
                        updateField={updateField} 
                    />

                    <TaskDependencies 
                        dependencies={formData.dependencies} 
                        availableTasks={availableTasks} 
                        updateField={updateField} 
                    />

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
                        {task && task.id && (
                            <Button 
                                variant="danger" 
                                onClick={() => {
                                    if (window.confirm(t('modals.confirmDelete'))) {
                                        onDelete(task.id);
                                    }
                                }} 
                                style={{ marginRight: 'auto' }}
                            >
                                {t('modals.delete')}
                            </Button>
                        )}
                        <Button variant="cancel" onClick={onClose}>
                            {t('modals.cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('modals.save')}
                        </Button>
                    </div>
                </form>

                {task && task.id && (
                    <TaskHistory taskId={task.id} />
                )}
            </Modal>

            {/* Inactivation Reason Modal */}
            <Modal 
                isOpen={showReasonModal} 
                onClose={() => setShowReasonModal(false)}
                title="Motivo da Inativação"
                className=""
                style={{ maxWidth: '400px', width: '100%', padding: '30px' }}
            >
                <p style={{ marginBottom: '20px', color: '#9ca3af', fontSize: '0.9rem' }}>
                    Por favor, informe o motivo pelo qual você está inativando esta tarefa. Esta informação ficará salva no histórico.
                </p>
                <textarea
                    value={inactivationReason}
                    onChange={(e) => setInactivationReason(e.target.value)}
                    className="form-textarea"
                    rows="4"
                    placeholder="Motivo (obrigatório)"
                    required
                ></textarea>
                <div className="modal-actions" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    <Button variant="cancel" onClick={() => setShowReasonModal(false)}>Cancelar</Button>
                    <Button variant="primary" onClick={handleSubmit}>Confirmar Inativação</Button>
                </div>
            </Modal>
        </>
    );
};

export default TaskModal;
