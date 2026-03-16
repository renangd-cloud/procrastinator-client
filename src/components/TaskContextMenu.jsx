import React from 'react';
import { useTranslation } from 'react-i18next';

const TaskContextMenu = ({ task, position, onClose, onStatusChange, onDelete, onReturnToBacklog, onDuplicate }) => {
    const { t } = useTranslation();

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return '✅';
            case 'Pending': return '⏳';
            default: return '📝';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return '#10b981'; // Green
            case 'Pending': return '#9ca3af'; // Gray
            default: return '#6b7280'; // Gray
        }
    };

    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1999
                }}
                onClick={onClose}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onClose();
                }}
            />
            <div
                style={{
                    position: 'fixed',
                    top: position.y,
                    left: position.x,
                    background: 'rgba(30, 41, 59, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    padding: '5px',
                    zIndex: 2000,
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
                    minWidth: '180px'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {['Pending', 'Completed'].map(status => (
                    <div
                        key={status}
                        onClick={() => {
                            onStatusChange(status);
                            onClose();
                        }}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: task.status === status ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                            transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                            if (task.status !== status) {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (task.status !== status) {
                                e.currentTarget.style.background = 'transparent';
                            }
                        }}
                    >
                        <span style={{ fontSize: '1.2rem' }}>{getStatusIcon(status)}</span>
                        <span>{t(`status.${status.toLowerCase()}`, status)}</span>
                        {task.status === status && (
                            <span style={{ marginLeft: 'auto', color: getStatusColor(status) }}>●</span>
                        )}
                    </div>
                ))}

                {onReturnToBacklog && task.date && !task.recurrenceRule && (
                    <>
                        <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '5px 0' }} />
                        <div
                            onClick={() => {
                                onReturnToBacklog();
                                onClose();
                            }}
                            style={{
                                padding: '8px 12px',
                                cursor: 'pointer',
                                borderRadius: '4px',
                                color: '#fbbf24', // Amber
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(251, 191, 36, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <span>🔙</span>
                            <span>{t('modals.returnToBacklog')}</span>
                        </div>
                    </>
                )}

                <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.1)', margin: '5px 0' }} />

                <div
                    onClick={() => {
                        onDuplicate && onDuplicate(task);
                        onClose();
                    }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <span>📋</span>
                    <span>{t('modals.duplicate')}</span>
                </div>

                <div
                    onClick={() => {
                        if (window.confirm(t('modals.confirmDelete'))) {
                            onDelete();
                            onClose();
                        }
                    }}
                    style={{
                        padding: '8px 12px',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        color: '#ef4444', // Red
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                    <span>🗑️</span>
                    <span>{t('modals.delete')}</span>
                </div>
            </div>
        </>
    );
};

export default TaskContextMenu;
