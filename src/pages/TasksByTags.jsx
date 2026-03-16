import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import TaskModal from '../components/TaskModal';
import TaskContextMenu from '../components/TaskContextMenu';
import DuplicateTaskModal from '../components/DuplicateTaskModal';
import { useTranslation } from 'react-i18next';
import './TasksByTags.css';


const TasksByTags = () => {
    const { t, i18n } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [duplicateModal, setDuplicateModal] = useState(null);
    const [error, setError] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const [collapsedTags, setCollapsedTags] = useState({});
    const [viewMode, setViewMode] = useState('None'); // 'None', 'Tags', 'Priority', 'Completed'
    const [showInactive, setShowInactive] = useState(false); // Default inactive hidden
    const { getTasks, createTask, updateTask, duplicateTask } = useApi();

    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, task: null });

    useEffect(() => {
        const handleClick = () => setContextMenu({ ...contextMenu, show: false });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e, task) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.pageX,
            y: e.pageY,
            task: task
        });
    };



    const toggleCollapse = (groupName) => {
        setCollapsedTags(prev => ({
            ...prev,
            [groupName]: !prev[groupName]
        }));
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setLoading(true);
            const response = await getTasks({ includeBlocked: 'true' });

            // Process recurring tasks status
            const processedTasks = response.data.map(task => {
                if (task.isRecurring) {
                    // Check if completed today
                    const isCompletedToday = task.lastCompletedDate &&
                        new Date(task.lastCompletedDate).toDateString() === new Date().toDateString();

                    if (isCompletedToday) {
                        return { ...task, status: 'Completed' };
                    } else {
                        // Ensure it shows as Pending if not completed today (even if DB allows other states, though we enforce Pending)
                        return { ...task, status: 'Pending' };
                    }
                }
                return task;
            });

            setTasks(processedTasks);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const groupTasksByTags = (tasks) => {
        const grouped = {};
        tasks.forEach(task => {
            if (task.Tags && task.Tags.length > 0) {
                task.Tags.forEach(tag => {
                    if (!grouped[tag.name]) {
                        grouped[tag.name] = {
                            color: tag.color,
                            tasks: []
                        };
                    }
                    grouped[tag.name].tasks.push(task);
                });
            } else {
                if (!grouped[t('tasksByTags.untagged')]) {
                    grouped[t('tasksByTags.untagged')] = {
                        color: '#666666',
                        tasks: []
                    };
                }
                grouped[t('tasksByTags.untagged')].tasks.push(task);
            }
        });
        return grouped;
    };

    const groupTasksByPriority = (tasks) => {
        const grouped = {
            [t('priority.high')]: { color: '#ef4444', tasks: [] },
            [t('priority.medium')]: { color: '#f59e0b', tasks: [] },
            [t('priority.low')]: { color: '#10b981', tasks: [] }
        };

        tasks.forEach(task => {
            const priority = task.priority || 'Medium';
            let priorityLabel = t(`priority.${priority.toLowerCase()}`);
            if (!priorityLabel) priorityLabel = priority; // Fallback

            if (grouped[priorityLabel]) {
                grouped[priorityLabel].tasks.push(task);
            } else {
                // Fallback for any other priority values
                if (!grouped[t('tasksByTags.other')]) grouped[t('tasksByTags.other')] = { color: '#6b7280', tasks: [] };
                grouped[t('tasksByTags.other')].tasks.push(task);
            }
        });

        // Remove empty groups
        Object.keys(grouped).forEach(key => {
            if (grouped[key].tasks.length === 0) delete grouped[key];
        });

        return grouped;
    };

    const filteredTasks = tasks.filter(task => {
        // [NEW] Inactive Filter Toggle
        // If showInactive is false, hide inactive tasks.
        if (!showInactive && task.active === false) {
            return false;
        }

        if (viewMode === 'Completed') {
            return task.status === 'Completed';
        }
        // Show all non-completed tasks OR completed recurring tasks
        return task.status !== 'Completed' || task.isRecurring;
    });

    const getRenderData = () => {
        if (viewMode === 'Tags') {
            return groupTasksByTags(filteredTasks);
        } else if (viewMode === 'Priority') {
            return groupTasksByPriority(filteredTasks);
        }
        return {}; // For 'None' and 'Completed', we use raw filteredTasks
    };

    const handleStatusChange = async (newStatus) => {
        if (!contextMenu.task) return;
        try {
            await updateTask(contextMenu.task.id, { ...contextMenu.task, status: newStatus });
            fetchTasks();
        } catch (err) {
            alert(t('tasksByTags.errorUpdatingStatus') + (err.response?.data?.message || err.message));
        }
    };

    const handleSave = async (formData) => {
        try {
            if (selectedTask) {
                await updateTask(selectedTask.id, formData);
            } else {
                await createTask(formData);
            }
            setShowModal(false);
            setSelectedTask(null);
            fetchTasks();
        } catch (err) {
            alert(t('tasksByTags.errorSaving') + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await useApi().deleteTask(taskId);
            setShowModal(false);
            setSelectedTask(null);
            fetchTasks();
        } catch (err) {
            alert(t('tasksByTags.errorDeleting') + (err.response?.data?.message || err.message));
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedTask(null);
    };

    // Reusable Task Card Component
    const TaskCard = ({ task }) => {
        const isBlocked = task.Prerequisites && task.Prerequisites.some(p => p.status !== 'Finalized');

        return (
            <div
                onClick={() => handleTaskClick(task)}
                onContextMenu={(e) => handleContextMenu(e, task)}
                className={`tbt-card ${!task.active ? 'inactive' : ''}`}
                style={{
                    borderLeft: `3px solid ${task.status === 'Completed' ? '#10b981' : '#9ca3af'}`,
                    position: 'relative'
                }}
            >
                <div className="tbt-card-header">
                    <span className="tbt-card-status-icon">
                        {task.status === 'Completed' ? '✅' : '⏳'}
                    </span>
                    <h3 className="tbt-card-title">
                        {task.title}
                    </h3>
                </div>

                {task.description && (
                    <p className="tbt-card-desc">
                        {task.description}
                    </p>
                )}

                <div className="tbt-card-meta">
                    <span style={{
                        padding: '3px 8px',
                        background: (task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981') + '33',
                        color: (task.priority === 'High' ? '#ef4444' : task.priority === 'Medium' ? '#f59e0b' : '#10b981'),
                        borderRadius: '4px',
                        fontWeight: 'bold'
                    }}>
                        {t(`priority.${task.priority.toLowerCase()}`) || task.priority}
                    </span>
                    <span className="meta-badge-neutral">
                        {task.isRecurring ? (
                            `🔄 ${task.recurrenceType === 'Daily' ? (
                                (!task.recurrenceDays || task.recurrenceDays.length === 0 || task.recurrenceDays.length === 7)
                                    ? t('recurrenceTypes.daily')
                                    : task.recurrenceDays.slice().sort().map(d => {
                                        const days = [t('days.sun'), t('days.mon'), t('days.tue'), t('days.wed'), t('days.thu'), t('days.fri'), t('days.sat')];
                                        return days[d];
                                    }).join(', ')
                            ) :
                                task.recurrenceType === 'Weekly' ? t('recurrenceTypes.weekly') :
                                    task.recurrenceType === 'Bi-weekly' ? t('recurrenceTypes.biWeekly') :
                                        task.recurrenceType === 'Monthly' ? t('recurrenceTypes.monthly') :
                                            task.recurrenceType
                            }`
                        ) : (
                            task.date ? `📅 ${(() => {
                                const [year, month, day] = task.date.split('T')[0].split('-');
                                return `${day}/${month}/${year}`;
                            })()}` : `📅 ${t('tasksByTags.noDate')}`
                        )}
                    </span>
                    {task.Subtasks && task.Subtasks.length > 0 && (
                        <span className="meta-badge-neutral">
                            ✓ {task.Subtasks.filter(s => s.completed).length}/{task.Subtasks.length}
                        </span>
                    )}
                </div>

                {/* Show tags if not in Tags view */}
                {viewMode !== 'Tags' && task.Tags && task.Tags.length > 0 && (
                    <div className="tbt-card-tags">
                        {task.Tags.map(tag => (
                            <span
                                key={tag.id}
                                style={{
                                    padding: '2px 8px',
                                    fontSize: '0.7rem',
                                    background: `${tag.color}33`,
                                    color: tag.color,
                                    borderRadius: '10px',
                                    border: `1px solid ${tag.color}66`
                                }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}

                {/* Blocked Icon */}
                {isBlocked && (
                    <div
                        style={{
                            position: 'absolute',
                            bottom: '10px',
                            right: '10px',
                            fontSize: '1.2rem',
                            color: '#ef4444',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                            zIndex: 10
                        }}
                        title={t('tasksByTags.blockedByDependencies')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="loading-container">
                {t('tasksByTags.loading')}
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                {t('tasksByTags.errorLoading')} {error}
            </div>
        );
    }

    const renderData = getRenderData();

    return (
        <div className="tasks-page">
            <div className="tasks-header">
                <h1 className="tasks-title">
                    {t('tasksByTags.title')}
                </h1>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                    {/* [NEW] Inactive Toggle */}
                    <div className="toggle-container">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                className="toggle-input"
                                checked={showInactive}
                                onChange={(e) => setShowInactive(e.target.checked)}
                            />
                            <span className="toggle-slider"></span>
                        </label>
                        <span className="toggle-label">{t('tasksByTags.showInactive')}</span>
                    </div>

                    {/* View Switcher */}
                    <div className="view-switcher">
                        {['None', 'Tags', 'Priority', 'Completed'].map(mode => (
                            <button
                                key={mode}
                                onClick={() => setViewMode(mode)}
                                className={`view-btn ${viewMode === mode ? 'active' : ''}`}
                            >
                                {mode === 'None' ? t('tasksByTags.viewAll') :
                                    mode === 'Tags' ? t('tasksByTags.viewTags') :
                                        mode === 'Priority' ? t('tasksByTags.viewPriority') :
                                            t('tasksByTags.viewCompleted')}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {filteredTasks.length === 0 ? (
                <div className="glass-panel empty-state-panel">
                    <p className="empty-state-text">
                        {viewMode === 'Completed' ? t('tasksByTags.noTasksCompleted') : t('tasksByTags.noTasksFound')}
                    </p>
                </div>
            ) : (
                <>
                    {viewMode === 'None' ? (
                        <div className="tasks-grid">
                            {/* Recurring Tasks Section */}
                            {(() => {
                                const recurringTasks = filteredTasks.filter(t => t.isRecurring);
                                const regularTasks = filteredTasks.filter(t => !t.isRecurring);

                                return (
                                    <>
                                        {recurringTasks.length > 0 && (
                                            <>
                                                <h3 className="section-header">{t('tasksByTags.recurringTasks')}</h3>
                                                {recurringTasks.map(task => (
                                                    <TaskCard key={task.id} task={task} />
                                                ))}
                                            </>
                                        )}

                                        {recurringTasks.length > 0 && regularTasks.length > 0 && (
                                            <div className="tasks-list-separator"></div>
                                        )}

                                        {regularTasks.length > 0 && (
                                            <>
                                                {recurringTasks.length > 0 && (
                                                    <h3 className="section-header">{t('tasksByTags.oneTimeTasks')}</h3>
                                                )}
                                                {regularTasks.map(task => (
                                                    <TaskCard key={task.id} task={task} />
                                                ))}
                                            </>
                                        )}
                                    </>
                                );
                            })()}
                        </div>
                    ) : viewMode === 'Completed' ? (
                        <div className="tasks-grid">
                            {filteredTasks.map(task => (
                                <TaskCard key={task.id} task={task} />
                            ))}
                        </div>
                    ) : (
                        <div className="custom-scrollbar grouped-view-container">
                            {Object.entries(renderData).map(([groupName, groupData]) => (
                                <div
                                    key={groupName}
                                    className="glass-panel group-panel"
                                >
                                    {/* Group Header */}
                                    <div
                                        onClick={() => toggleCollapse(groupName)}
                                        className="group-header"
                                        style={{
                                            background: `linear-gradient(135deg, ${groupData.color}33 0%, ${groupData.color}22 100%)`,
                                            borderBottom: `2px solid ${groupData.color}`,
                                        }}
                                    >
                                        <div className="group-indicator" style={{
                                            backgroundColor: groupData.color,
                                            boxShadow: `0 0 10px ${groupData.color}88`
                                        }}></div>
                                        <h2 className="group-title">
                                            {groupName}
                                        </h2>
                                        <span className={`group-collapse-icon ${collapsedTags[groupName] ? 'collapsed' : ''}`}>
                                            ▼
                                        </span>
                                        <span className="group-count">
                                            {groupData.tasks.length}
                                        </span>
                                    </div>

                                    {/* Tasks List */}
                                    {!collapsedTags[groupName] && (
                                        <div className="group-tasks-list">
                                            {groupData.tasks.map((task) => (
                                                <TaskCard key={task.id} task={task} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Floating Action Button */}
            {/* Floating Action Button */}
            <button
                onClick={() => setShowModal(true)}
                className="fab-btn"
                title={t('tasksByTags.createTask')}
            >
                +
            </button>

            {/* Create Task Modal */}
            {showModal && (
                <TaskModal
                    onClose={handleCloseModal}
                    onSave={handleSave}
                    onDelete={handleDeleteTask}
                    task={selectedTask}
                />
            )}

            {/* Context Menu */}
            {contextMenu.show && (
                <TaskContextMenu
                    task={contextMenu.task}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onClose={() => setContextMenu({ ...contextMenu, show: false })}
                    onStatusChange={handleStatusChange}
                    onDelete={() => handleDeleteTask(contextMenu.task.id)}
                    onDuplicate={(task) => setDuplicateModal(task)}
                />
            )}

            {/* Duplicate Task Modal */}
            {duplicateModal && (
                <DuplicateTaskModal
                    task={duplicateModal}
                    onClose={() => setDuplicateModal(null)}
                    onConfirm={async (id, newTitle) => {
                        await duplicateTask(id, newTitle);
                        fetchTasks();
                    }}
                />
            )}
        </div>
    );
};

export default TasksByTags;
