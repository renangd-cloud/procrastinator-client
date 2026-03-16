import React, { useState, useEffect } from 'react';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';
import useApi from '../hooks/useApi';
import './TaskModal.css';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const TaskModal = ({ task, onClose, onSave, onDelete }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        tags: [],
        subtasks: [],
        dependencies: [],
        isRecurring: false,
        recurrenceType: '',
        recurrenceDays: [],
        status: 'Pending',
        priority: 'Medium',
        active: true
    });
    const [newTag, setNewTag] = useState('');
    const [newSubtask, setNewSubtask] = useState('');
    const [editingSubtaskIndex, setEditingSubtaskIndex] = useState(null); // [NEW] Track edited subtask
    const { getTasks, getTags } = useApi(); // [NEW] Get getTags from hook
    const [availableTasks, setAvailableTasks] = useState([]);
    const [availableTags, setAvailableTags] = useState([]); // [NEW] Stores all available tags
    const [showTagDropdown, setShowTagDropdown] = useState(false); // [NEW] Controls tag dropdown visibility
    const [dependencySearch, setDependencySearch] = useState('');
    const [showDependencyDropdown, setShowDependencyDropdown] = useState(false);

    // Premium colors for tags
    const tagColors = [
        '#ef4444', '#f97316', '#f59e0b', '#10b981',
        '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
    ];

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                date: task.date ? task.date.split('T')[0] : '',
                tags: task.Tags ? task.Tags.map(t => ({ name: t.name, color: t.color || getRandomColor() })) : [],
                subtasks: task.Subtasks || [],
                dependencies: task.Prerequisites ? task.Prerequisites.map(p => p.id) : [],
                isRecurring: task.isRecurring || false,
                recurrenceType: task.recurrenceType || '',
                recurrenceDays: task.recurrenceDays || [],
                status: task.status || 'Pending',
                priority: task.priority || 'Medium',
                active: task.active !== undefined ? task.active : true
            });
        }

        getTasks().then(res => {
            // Filter out current task to avoid circular dependency
            const tasks = res.data.filter(t => !task || t.id !== task.id);
            setAvailableTasks(tasks);
        }).catch(err => console.error(err));

        // [NEW] Fetch tags
        getTags().then(res => {
            setAvailableTags(res.data);
        }).catch(err => console.error(err));
    }, [task]);

    const getRandomColor = () => {
        return tagColors[Math.floor(Math.random() * tagColors.length)];
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddTag = () => {
        if (newTag && !formData.tags.some(t => t.name.toLowerCase() === newTag.toLowerCase())) {
            if (formData.tags.length >= 10) {
                alert('Máximo de 10 tags permitido');
                return;
            }
            // Check if tag exists in availableTags to reuse color
            const existingTag = availableTags.find(t => t.name.toLowerCase() === newTag.toLowerCase());

            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, { name: existingTag ? existingTag.name : newTag, color: existingTag ? existingTag.color : getRandomColor() }]
            }));
            setNewTag('');
            setShowTagDropdown(false);
        }
    };

    // [NEW] Handle selecting an existing tag from dropdown
    const handleSelectTag = (tag) => {
        if (!formData.tags.some(t => t.name === tag.name)) {
            if (formData.tags.length >= 10) {
                alert('Máximo de 10 tags permitido');
                return;
            }
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, { name: tag.name, color: tag.color }]
            }));
            setNewTag('');
            setShowTagDropdown(false);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagName) => {
        setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t.name !== tagName) }));
    };

    const handleAddSubtask = () => {
        if (newSubtask) {
            setFormData(prev => ({
                ...prev,
                subtasks: [...prev.subtasks, { title: newSubtask, completed: false }]
            }));
            setNewSubtask('');
        }
    };

    const handleSubtaskKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddSubtask();
        }
    };

    const handleSubtaskEditChange = (idx, value) => {
        const newSubtasks = [...formData.subtasks];
        newSubtasks[idx].title = value;
        setFormData({ ...formData, subtasks: newSubtasks });
    };

    const handleSubtaskEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditingSubtaskIndex(null);
        }
    };

    const toggleSubtask = (index) => {
        const updated = [...formData.subtasks];
        updated[index].completed = !updated[index].completed;
        setFormData(prev => ({ ...prev, subtasks: updated }));
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(formData.subtasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setFormData(prev => ({ ...prev, subtasks: items }));
    };

    const removeSubtask = (index) => {
        const updated = [...formData.subtasks];
        updated.splice(index, 1);
        setFormData(prev => ({ ...prev, subtasks: updated }));
    };

    const addDependency = (taskId) => {
        if (!formData.dependencies.includes(taskId)) {
            setFormData(prev => ({ ...prev, dependencies: [...prev.dependencies, taskId] }));
        }
        setDependencySearch('');
        setShowDependencyDropdown(false);
    };

    const removeDependency = (taskId) => {
        setFormData(prev => ({ ...prev, dependencies: prev.dependencies.filter(id => id !== taskId) }));
    };

    const handleRecurringChange = (e) => {
        const isRecurring = e.target.checked;
        setFormData(prev => ({
            ...prev,
            isRecurring,
            recurrenceType: isRecurring ? 'Daily' : '',
            recurrenceDays: isRecurring ? [] : [],
            dueDate: isRecurring ? null : prev.dueDate // Clear dueDate if recurring
        }));
    };

    const handleRecurrenceTypeChange = (e) => {
        setFormData(prev => ({ ...prev, recurrenceType: e.target.value }));
    };

    const toggleRecurrenceDay = (day) => {
        const days = [...formData.recurrenceDays];
        if (days.includes(day)) {
            setFormData(prev => ({ ...prev, recurrenceDays: days.filter(d => d !== day) }));
        } else {
            setFormData(prev => ({ ...prev, recurrenceDays: [...days, day] }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payload = { ...formData };
        if (!payload.date) {
            payload.date = null;
        }
        if (!payload.isRecurring || !payload.recurrenceType) {
            payload.recurrenceType = null;
            payload.recurrenceDays = [];
        }
        onSave(payload);
    };

    // Custom Checkbox Component
    // Custom Checkbox Component
    const ModernCheckbox = ({ checked, onChange, label }) => (
        <label className="modern-checkbox-label">
            <div className={`modern-checkbox-box ${checked ? 'checked' : ''}`}>
                {checked && <span className="modern-checkbox-check">✓</span>}
            </div>
            <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
            {label && <span>{label}</span>}
        </label>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-panel custom-scrollbar task-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {task && task.id ? t('modals.editTask') : t('modals.newTask')}
                    </h2>
                    {formData.isRecurring && (
                        <div
                            className="active-toggle"
                            style={{ backgroundColor: formData.active ? '#10b981' : '#ef4444' }}
                            onClick={() => setFormData(prev => ({ ...prev, active: !prev.active }))}
                            title={formData.active ? "Clique para inativar" : "Clique para ativar"}
                        >
                            {formData.active ? "Ativa" : "Inativa"}
                        </div>
                    )}
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">{t('modals.title')}</label>
                        <input
                            type="text" name="title" value={formData.title} onChange={handleChange} required
                            placeholder={t('modals.titlePlaceholder')}
                            className="form-input"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('modals.description')}</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange}
                            placeholder={t('modals.descriptionPlaceholder')}
                            rows="6"
                            className="form-textarea"
                        />
                    </div>

                    {/* Recurrence Block Moved Here */}
                    {/* Recurrence Block Moved Here */}
                    <div className="recurrence-block">
                        <ModernCheckbox
                            checked={formData.isRecurring}
                            onChange={handleRecurringChange}
                            label={t('modals.recurrence')}
                        />

                        {formData.isRecurring && (
                            <div className="recurrence-options">
                                <label className="form-label">{t('modals.recurrenceType')}</label>
                                <select
                                    value={formData.recurrenceType}
                                    onChange={handleRecurrenceTypeChange}
                                    className="recurrence-type-select"
                                >
                                    <option value="Daily">{t('recurrenceTypes.daily')}</option>
                                    <option value="Weekly">{t('recurrenceTypes.weekly')}</option>
                                    <option value="Bi-weekly">{t('recurrenceTypes.biWeekly')}</option>
                                    <option value="Monthly">{t('recurrenceTypes.monthly')}</option>
                                </select>

                                {formData.recurrenceType === 'Daily' && (
                                    <div>
                                        <label className="form-label">{t('modals.selectDays')}</label>
                                        <div className="day-selector">
                                            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                                                <button
                                                    key={index}
                                                    type="button"
                                                    onClick={() => toggleRecurrenceDay(index)}
                                                    className={`day-button ${formData.recurrenceDays.includes(index) ? 'active' : 'inactive'}`}
                                                >
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {formData.recurrenceType === 'Weekly' && (
                                    <div className="recurrence-note">
                                        {t('recurrenceNotes.weekly')}
                                    </div>
                                )}

                                {formData.recurrenceType === 'Bi-weekly' && (
                                    <div className="recurrence-note">
                                        {t('recurrenceNotes.biWeekly')}
                                    </div>
                                )}

                                {formData.recurrenceType === 'Monthly' && (
                                    <div className="recurrence-note">
                                        {t('recurrenceNotes.monthly')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {task && task.id && (
                        <div className="form-group">
                            <label className="form-label">{t('modals.status')}</label>
                            <div className="status-selector">
                                {(() => {
                                    // Determine available statuses based on recurrence
                                    // Determine available statuses
                                    const availableStatuses = ['Pending', 'Completed'];

                                    return availableStatuses.map(status => {
                                        const isSelected = formData.status === status;
                                        let activeColor = '#9ca3af'; // Default Gray
                                        if (status === 'Completed') activeColor = '#10b981';

                                        let statusLabel = status;
                                        switch (status) {
                                            case 'Pending': statusLabel = t('status.pending'); break;
                                            case 'Completed': statusLabel = t('status.completed'); break;
                                        }

                                        return (
                                            <div
                                                key={status}
                                                onClick={() => setFormData(prev => ({ ...prev, status }))}
                                                className={`status-option ${isSelected ? 'selected' : 'unselected'}`}
                                                style={isSelected ? { background: activeColor } : {}}
                                            >
                                                {statusLabel}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="split-form-group">
                        {!formData.isRecurring && (
                            <div style={{ flex: 1 }}>
                                <label className="form-label">{t('modals.date')}</label>
                                <input
                                    type="date" name="date" value={formData.date} onChange={handleChange} lang="pt-BR"
                                    className="form-input"
                                />
                            </div>
                        )}
                        {!formData.isRecurring && (
                            <div style={{ flex: 1 }}>
                                <label className="form-label">{t('modals.dueDate')}</label>
                                <input
                                    type="date" name="dueDate" value={formData.dueDate || ''} onChange={handleChange} lang="pt-BR"
                                    className="form-input"
                                />
                            </div>
                        )}
                        <div style={{ flex: 1 }}>
                            <label className="form-label">{t('modals.priority')}</label>
                            <select
                                name="priority" value={formData.priority} onChange={handleChange}
                                className="form-select"
                            >
                                <option value="Low">{t('priority.low')}</option>
                                <option value="Medium">{t('priority.medium')}</option>
                                <option value="High">{t('priority.high')}</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('modals.tags')}</label>
                        <div className="tags-input-container">
                            <input
                                type="text"
                                value={newTag}
                                onChange={(e) => {
                                    setNewTag(e.target.value);
                                    setShowTagDropdown(true);
                                }}
                                onFocus={() => setShowTagDropdown(true)}
                                onKeyDown={handleTagKeyDown}
                                placeholder={t('modals.tagsPlaceholder')}
                                className="form-input"
                                style={{ marginBottom: '10px' }}
                            />
                            {/* [NEW] Tag Dropdown */}
                            {showTagDropdown && newTag && (
                                <div className="dropdown-list">
                                    {availableTags
                                        .filter(t => t.name.toLowerCase().startsWith(newTag.toLowerCase()) && !formData.tags.some(sel => sel.name === t.name))
                                        .map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => handleSelectTag(t)}
                                                className="dropdown-item"
                                                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                            >
                                                <span style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    backgroundColor: t.color
                                                }}></span>
                                                {t.name}
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="tag-list">
                            {formData.tags.map((tag, index) => (
                                <span key={index} className="tag-chip" style={{
                                    background: `${tag.color}22`,
                                    color: tag.color,
                                    border: `1px solid ${tag.color}44`,
                                }}>
                                    {tag.name}
                                    <span onClick={() => removeTag(tag.name)} className="tag-remove">&times;</span>
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">{t('modals.subtasks')}</label>
                        <input
                            type="text" value={newSubtask} onChange={(e) => setNewSubtask(e.target.value)}
                            onKeyDown={handleSubtaskKeyDown}
                            placeholder={t('modals.subtasksPlaceholder')}
                            className="form-input"
                            style={{ marginBottom: '10px' }}
                        />
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="subtasks-list">
                                {(provided) => (
                                    <ul
                                        className="subtask-list"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {formData.subtasks.map((sub, idx) => (
                                            <Draggable key={sub.id || `temp-${idx}`} draggableId={String(sub.id || `temp-${idx}`)} index={idx}>
                                                {(provided, snapshot) => {
                                                    const child = (
                                                        <li
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className="subtask-item"
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                background: snapshot.isDragging ? '#1e293b' : 'rgba(255, 255, 255, 0.03)',
                                                                boxShadow: snapshot.isDragging ? '0 10px 20px rgba(0,0,0,0.5)' : 'none',
                                                                borderRadius: '6px'
                                                            }}
                                                        >
                                                            <div {...provided.dragHandleProps} className="drag-handle" style={{ marginRight: '8px', cursor: 'grab', color: '#6b7280' }}>
                                                                ⋮⋮
                                                            </div>
                                                            <ModernCheckbox checked={sub.completed} onChange={() => toggleSubtask(idx)} />

                                                            {editingSubtaskIndex === idx ? (
                                                                <input
                                                                    type="text"
                                                                    value={sub.title}
                                                                    onChange={(e) => handleSubtaskEditChange(idx, e.target.value)}
                                                                    onKeyDown={handleSubtaskEditKeyDown}
                                                                    onBlur={() => setEditingSubtaskIndex(null)}
                                                                    autoFocus
                                                                    className="subtask-edit-input"
                                                                    style={{
                                                                        flex: 1,
                                                                        background: 'transparent',
                                                                        border: 'none',
                                                                        borderBottom: '1px solid #3b82f6',
                                                                        color: 'white',
                                                                        padding: '2px 0',
                                                                        outline: 'none',
                                                                        fontSize: '1rem'
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span className={`subtask-text ${sub.completed ? 'completed' : ''}`}>{sub.title}</span>
                                                            )}

                                                            <div style={{ display: 'flex', gap: '5px' }}>
                                                                <span
                                                                    onClick={() => setEditingSubtaskIndex(idx)}
                                                                    className="subtask-action"
                                                                    style={{ cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
                                                                    title={t('common.edit')}
                                                                >
                                                                    ✎
                                                                </span>
                                                                <span onClick={() => removeSubtask(idx)} className="subtask-remove" style={{ cursor: 'pointer', padding: '4px', color: '#ef4444' }}>&times;</span>
                                                            </div>
                                                        </li>
                                                    );

                                                    if (snapshot.isDragging) {
                                                        return createPortal(child, document.body);
                                                    }
                                                    return child;
                                                }}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </ul>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>



                    <div className="form-group" style={{ marginBottom: '25px' }}>
                        <label className="form-label">{t('modals.dependencies')}</label>
                        <div className="dependency-input-container">
                            <input
                                type="text"
                                value={dependencySearch}
                                onChange={(e) => {
                                    setDependencySearch(e.target.value);
                                    setShowDependencyDropdown(true);
                                }}
                                onFocus={() => setShowDependencyDropdown(true)}
                                placeholder={t('modals.dependenciesPlaceholder')}
                                className="form-input"
                            />
                            {showDependencyDropdown && dependencySearch && (
                                <div className="dropdown-list">
                                    {availableTasks
                                        .filter(t => t.title.toLowerCase().includes(dependencySearch.toLowerCase()) && !formData.dependencies.includes(t.id))
                                        .map(t => (
                                            <div
                                                key={t.id}
                                                onClick={() => addDependency(t.id)}
                                                className="dropdown-item"
                                            >
                                                {t.title} <span className="dropdown-item-meta">
                                                    ({t.date ? format(t.date.includes('T') ? new Date(t.date) : parse(t.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : 'Sem data'})
                                                </span>
                                            </div>
                                        ))}
                                    {availableTasks.filter(t => t.title.toLowerCase().includes(dependencySearch.toLowerCase()) && !formData.dependencies.includes(t.id)).length === 0 && (
                                        <div className="no-results">{t('modals.noTasksFound')}</div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Selected Dependencies List */}
                        <div className="selected-dependencies">
                            {formData.dependencies.map(depId => {
                                const task = availableTasks.find(t => t.id === depId) || { title: 'Tarefa Carregando...', id: depId };
                                return (
                                    <div key={depId} className="dependency-chip">
                                        <span>{task.title}</span>
                                        <span onClick={() => removeDependency(depId)} style={{ cursor: 'pointer', color: '#ef4444' }}>&times;</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-actions">
                        {task && task.id && (
                            <button type="button" onClick={() => {
                                if (window.confirm(t('modals.confirmDelete'))) {
                                    onDelete(task.id);
                                }
                            }} className="btn-delete">
                                {t('modals.delete')}
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="btn-cancel">
                            {t('modals.cancel')}
                        </button>
                        <button type="submit" className="btn-save">
                            {t('modals.save')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TaskModal;
