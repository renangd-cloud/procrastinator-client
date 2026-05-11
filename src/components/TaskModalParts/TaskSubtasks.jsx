import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import ModernCheckbox from '../ui/ModernCheckbox';

const TaskSubtasks = ({ subtasks, updateField }) => {
    const { t } = useTranslation();
    const [newSubtask, setNewSubtask] = useState('');
    const [editingSubtaskIndex, setEditingSubtaskIndex] = useState(null);

    const handleAddSubtask = () => {
        if (newSubtask) {
            updateField('subtasks', [...subtasks, { title: newSubtask, completed: false }]);
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
        const newSubtasks = [...subtasks];
        newSubtasks[idx].title = value;
        updateField('subtasks', newSubtasks);
    };

    const handleSubtaskEditKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setEditingSubtaskIndex(null);
        }
    };

    const toggleSubtask = (index) => {
        const updated = [...subtasks];
        updated[index].completed = !updated[index].completed;
        updateField('subtasks', updated);
    };

    const removeSubtask = (index) => {
        const updated = [...subtasks];
        updated.splice(index, 1);
        updateField('subtasks', updated);
    };

    const onDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(subtasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        updateField('subtasks', items);
    };

    return (
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
                            {subtasks.map((sub, idx) => (
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
    );
};

export default TaskSubtasks;
