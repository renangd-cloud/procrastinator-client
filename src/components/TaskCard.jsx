import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import './TaskCard.css';

const TaskCard = ({ task, index, onClick, onContextMenu, style, compact, ...props }) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={onClick}
                    onContextMenu={onContextMenu}
                    className={`glass-panel task-card ${compact ? 'compact' : ''} ${task.active === false ? 'inactive' : ''} ${props.className || ''}`}
                    style={{
                        ...provided.draggableProps.style,
                        ...style
                    }}
                >
                    <h4 className="task-title">
                        {task.title}
                    </h4>

                    {!compact && task.Tags && task.Tags.length > 0 && (
                        <div className="task-tags">
                            {task.Tags.map(tag => (
                                <span key={tag.id} className="task-tag" style={{
                                    backgroundColor: tag.color
                                }}>
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    )}

                    {!compact && task.Subtasks && task.Subtasks.length > 0 && (
                        <div className="task-subtasks">
                            {task.Subtasks.filter(s => s.completed).length}/{task.Subtasks.length} Subtasks
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

export default TaskCard;
