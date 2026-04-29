import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { format, startOfWeek, addDays, parseISO, isAfter, startOfDay, isSameDay, isBefore } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import useApi from '../hooks/useApi';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import TaskSelectionModal from '../components/TaskSelectionModal';
import TaskContextMenu from '../components/TaskContextMenu';
import './Dashboard.css';


const Dashboard = () => {
    const { t, i18n } = useTranslation();
    const [tasks, setTasks] = useState([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [viewMode, setViewMode] = useState('week');
    const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(null);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, task: null, date: null });
    const { getTasks, createTask, updateTask, deleteTask } = useApi();

    const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

    useEffect(() => {
        const handleClick = () => setContextMenu({ ...contextMenu, show: false });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e, task, date = null) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.pageX,
            y: e.pageY,
            task: task,
            date: date
        });
    };

    const handleStatusChange = async (newStatus) => {
        if (!contextMenu.task) return;
        try {
            await updateTask(contextMenu.task.id, {
                ...contextMenu.task,
                status: newStatus,
                // For recurring input:
                lastCompletedDate: newStatus === 'Completed' && contextMenu.date ? contextMenu.date : null,
                // For regular task move-to-date (optional, but consistent with recurrence click behavior):
                date: contextMenu.date ? contextMenu.date : contextMenu.task.date
            });
            fetchTasks();
        } catch (err) {
            alert('Error updating status: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleReturnToBacklog = async () => {
        if (!contextMenu.task) return;
        try {
            await updateTask(contextMenu.task.id, { ...contextMenu.task, date: null });
            fetchTasks();
        } catch (err) {
            alert('Error returning task to backlog: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDeleteFromMenu = async () => {
        if (!contextMenu.task) return;
        try {
            await deleteTask(contextMenu.task.id);
            fetchTasks();
        } catch (err) {
            alert('Error deleting task: ' + (err.response?.data?.message || err.message));
        }
    };

    const fetchTasks = async () => {
        try {
            const res = await getTasks();
            setTasks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const onDragEnd = async (result) => {
        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId) return;

        const task = tasks.find(t => t.id === draggableId);
        const newDate = destination.droppableId;

        const updatedTasks = tasks.map(t => {
            if (t.id === draggableId) return { ...t, date: newDate };
            return t;
        });
        setTasks(updatedTasks);

        try {
            await updateTask(draggableId, { ...task, date: newDate });
        } catch (err) {
            console.error(err);
            fetchTasks();
        }
    };

    const handleTaskClick = (task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const handleAddTaskToDay = (dateStr) => {
        setSelectedDate(dateStr);
        setIsSelectionModalOpen(true);
    };

    const handleSelectExistingTask = async (taskId, newDate) => {
        try {
            const task = tasks.find(t => t.id === taskId);
            await updateTask(taskId, { ...task, date: newDate });
            fetchTasks();
        } catch (err) {
            console.error('Erro ao atualizar tarefa:', err);
            alert('Erro ao adicionar tarefa ao dia: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleCreateNewTaskForDay = (date) => {
        setSelectedTask({ date });
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            if (selectedTask && selectedTask.id) {
                await updateTask(selectedTask.id, formData);
            } else {
                await createTask(formData);
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar tarefa: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza?')) {
            try {
                await deleteTask(id);
                setIsModalOpen(false);
                fetchTasks();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        weekDays.push(addDays(currentWeekStart, i));
    }

    const renderMonthView = () => {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 0 }), 6);

        const days = [];
        let day = startDate;
        while (day <= endDate) {
            days.push(day);
            day = addDays(day, 1);
        }

        return (
            <div className="month-view-grid">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                    <div key={d} className="month-day-header">{d}</div>
                ))}
                {days.map(d => {
                    const dateStr = format(d, 'yyyy-MM-dd');
                    const dayTasks = tasks.filter(t => t.date && t.date.startsWith(dateStr) && t.active !== false);
                    const isCurrentMonth = d.getMonth() === now.getMonth();

                    return (
                        <div key={dateStr}
                            className={`glass-panel month-day-cell ${isCurrentMonth ? 'current-month' : 'other-month'}`}
                        >
                            <div className="month-day-number">{format(d, 'd')}</div>
                            {dayTasks.map(task => (
                                <div key={task.id}
                                    onClick={(e) => { e.stopPropagation(); handleTaskClick(task); }}
                                    onContextMenu={(e) => { e.stopPropagation(); handleContextMenu(e, task, d); }}
                                    className="month-task-item"
                                >
                                    {task.title}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div className="dashboard-title-group">
                    <h1>{t('dashboard.title')}</h1>
                    <div className="glass-panel view-switcher">
                        <button
                            onClick={() => setViewMode('week')}
                            className={`view-switcher-button ${viewMode === 'week' ? 'active' : ''}`}
                        >{t('dashboard.week')}</button>
                        <button
                            onClick={() => setViewMode('month')}
                            className={`view-switcher-button ${viewMode === 'month' ? 'active' : ''}`}
                        >{t('dashboard.month')}</button>
                    </div>
                </div>

                {viewMode === 'week' && (
                    <div className="week-navigation glass-panel">
                        <button
                            onClick={() => setCurrentWeekStart(prev => addDays(prev, -7))}
                            className="nav-button"
                        >
                            {'<'}
                        </button>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', alignSelf: 'center' }}>
                            {format(currentWeekStart, "d 'de' MMM", { locale: dateLocale })} - {format(addDays(currentWeekStart, 6), "d 'de' MMM", { locale: dateLocale })}
                        </span>
                        <button
                            onClick={() => setCurrentWeekStart(prev => addDays(prev, 7))}
                            className="nav-button"
                        >
                            {'>'}
                        </button>
                    </div>
                )}
            </div>

            {viewMode === 'week' ? (
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="week-view-grid">
                        {weekDays.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            // Helper to check if task should be shown on this date
                            const shouldShowTaskOnDate = (task, dateObj) => {
                                if (task.active === false) return false;
                                const dateStr = format(dateObj, 'yyyy-MM-dd');

                                // 1. Direct date match (specific occurrence or non-recurring)
                                if (task.date && task.date.startsWith(dateStr)) return true;

                                // 2. Recurring logic
                                if (task.isRecurring) {

                                    // Logic to show recurring task on its scheduled days
                                    // Even if status is 'Completed' (which means it was completed TODAY), 
                                    // we want to show it on future dates as Pending.

                                    const taskStartDate = task.date ? parseISO(task.date) : null;

                                    // Don't show before start date (ignore time for start comparison)
                                    if (taskStartDate && isAfter(startOfDay(taskStartDate), dateObj) && !isSameDay(taskStartDate, dateObj)) {
                                        return false;
                                    }

                                    // Don't show before creation date
                                    const createdProp = task.createdAt || task.createDate;
                                    if (createdProp) {
                                        const createdDate = startOfDay(parseISO(createdProp));
                                        if (isBefore(dateObj, createdDate)) {
                                            return false;
                                        }
                                    }

                                    const dayOfWeek = dateObj.getDay(); // 0-6 (Sun-Sat)
                                    let shouldShow = false;

                                    if (task.recurrenceType === 'Daily') {
                                        if (!task.recurrenceDays || task.recurrenceDays.length === 0 || task.recurrenceDays.length === 7) {
                                            shouldShow = true;
                                        } else {
                                            shouldShow = task.recurrenceDays.includes(dayOfWeek);
                                        }
                                    } else if (task.recurrenceType === 'Weekly') {
                                        if (taskStartDate) {
                                            shouldShow = taskStartDate.getDay() === dayOfWeek;
                                        }
                                    } else if (task.recurrenceType === 'Bi-weekly') {
                                        if (taskStartDate) {
                                            shouldShow = taskStartDate.getDay() === dayOfWeek;
                                        }
                                    } else if (task.recurrenceType === 'Monthly') {
                                        if (taskStartDate) {
                                            shouldShow = taskStartDate.getDate() === dateObj.getDate();
                                        }
                                    }

                                    return shouldShow;
                                }

                                return false;
                            };

                            const dayTasks = tasks
                                .filter(t => shouldShowTaskOnDate(t, day))
                                .map(t => {
                                    if (t.isRecurring) {
                                        // Current Day Context
                                        const currentDayStr = format(day, 'yyyy-MM-dd');

                                        // Find Execution for this day
                                        const execution = t.Executions ? t.Executions.find(e => e.date === currentDayStr) : null;

                                        let effectiveStatus = 'Pending';
                                        let effectiveSubtasks = t.Subtasks || [];

                                        if (execution) {
                                            effectiveStatus = execution.status;

                                            // Merge Subtasks
                                            if (t.Subtasks && execution.SubtaskExecutions) {
                                                effectiveSubtasks = t.Subtasks.map(sub => {
                                                    const subExec = execution.SubtaskExecutions.find(se => se.subtaskId === sub.id);
                                                    return {
                                                        ...sub,
                                                        completed: subExec ? subExec.completed : false
                                                        // Note: If no execution record for subtask, it's not completed for this day.
                                                    };
                                                });
                                            }
                                        }

                                        // Fallback for Legacy/Migrated Data (check lastCompletedDate if no Execution logic found?)
                                        // If we rely purely on Executions now, we might lose legacy "lastCompletedDate" checks if migration didn't happen.
                                        // But assuming we want to move forward:
                                        if (!execution && t.lastCompletedDate && isSameDay(parseISO(t.lastCompletedDate), day)) {
                                            effectiveStatus = 'Completed';
                                        }

                                        return {
                                            ...t,
                                            status: effectiveStatus,
                                            date: currentDayStr, // Inject the occurrence date so TaskModal/Backend knows which instance we are touching
                                            Subtasks: effectiveSubtasks,
                                            subtasks: effectiveSubtasks // Provide both to be safe
                                        };
                                    }
                                    return t;
                                })
                                .sort((a, b) => {
                                    // 1. Status: Completed tasks go to the bottom
                                    const aCompleted = a.status === 'Completed' ? 1 : 0;
                                    const bCompleted = b.status === 'Completed' ? 1 : 0;
                                    if (aCompleted !== bCompleted) return aCompleted - bCompleted;

                                    // 2. Priority: High > Medium > Low
                                    const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };
                                    const aPriority = priorityMap[a.priority] || 1; // Default to Low if undefined
                                    const bPriority = priorityMap[b.priority] || 1;
                                    return bPriority - aPriority;
                                });

                            const isToday = isSameDay(day, new Date());

                            return (
                                <Droppable key={dateStr} droppableId={dateStr}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`day-column ${isToday ? 'today-highlight' : ''} ${isBefore(day, startOfDay(new Date())) ? 'past-day' : ''}`}
                                        >
                                            <h3 className="day-header">
                                                {format(day, 'EEEE', { locale: dateLocale })} <br />
                                                <span className="day-date">{format(day, 'd/MM', { locale: dateLocale })}</span>
                                            </h3>
                                            <button
                                                onClick={() => handleAddTaskToDay(dateStr)}
                                                className="add-task-button"
                                            >
                                                {t('dashboard.addTask')}
                                            </button>
                                            <div className="tasks-container">
                                                {/* Recurring Tasks Section */}
                                                {dayTasks.filter(t => t.isRecurring).map((task, index) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        index={index}
                                                        onClick={() => handleTaskClick(task)}
                                                        onContextMenu={(e) => handleContextMenu(e, task, day)}
                                                        compact={task.status === 'Completed'}
                                                        className="recurring-task-card"
                                                        style={{
                                                            borderLeft: `3px solid ${task.status === 'Completed' ? '#10b981' : '#9ca3af'}`,
                                                            backgroundColor: 'rgba(245, 158, 11, 0.1)'
                                                        }}
                                                    />
                                                ))}

                                                {/* Separator if both types exist */}
                                                {dayTasks.some(t => t.isRecurring) && dayTasks.some(t => !t.isRecurring) && (
                                                    <div className="task-separator"></div>
                                                )}

                                                {/* Regular Tasks Section */}
                                                {dayTasks.filter(t => !t.isRecurring).map((task, index) => (
                                                    <TaskCard
                                                        key={task.id}
                                                        task={task}
                                                        index={index}
                                                        onClick={() => handleTaskClick(task)}
                                                        onContextMenu={(e) => handleContextMenu(e, task, day)}
                                                        compact={task.status === 'Completed'}
                                                        style={task.status === 'Completed' ? {
                                                            opacity: 0.7,
                                                            backgroundColor: 'rgba(107, 114, 128, 0.2)',
                                                            borderLeft: '3px solid #10b981'
                                                        } : {}}
                                                    />
                                                ))}
                                                {provided.placeholder}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </DragDropContext>
            ) : (
                renderMonthView()
            )}

            {isModalOpen && (
                <TaskModal
                    task={selectedTask}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}

            {isSelectionModalOpen && (
                <TaskSelectionModal
                    isOpen={isSelectionModalOpen}
                    onClose={() => setIsSelectionModalOpen(false)}
                    selectedDate={selectedDate}
                    onSelectExistingTask={handleSelectExistingTask}
                    onCreateNewTask={handleCreateNewTaskForDay}
                />
            )}

            {contextMenu.show && (
                <TaskContextMenu
                    task={contextMenu.task}
                    position={{ x: contextMenu.x, y: contextMenu.y }}
                    onClose={() => setContextMenu({ ...contextMenu, show: false })}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteFromMenu}
                    onReturnToBacklog={handleReturnToBacklog}
                />
            )}
        </div>
    );
};

export default Dashboard;
