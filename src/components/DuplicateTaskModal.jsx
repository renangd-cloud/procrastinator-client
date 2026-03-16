import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './TaskModal.css'; // Reusing modal styles

const DuplicateTaskModal = ({ task, onClose, onConfirm }) => {
    const { t } = useTranslation();
    const [newTitle, setNewTitle] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newTitle.trim()) return;

        try {
            setIsSubmitting(true);
            setError(null);
            await onConfirm(task.id, newTitle);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="task-modal-content" style={{ maxWidth: '400px', height: 'auto', minHeight: 'auto', overflow: 'visible' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                    <h2 className="modal-title" style={{ margin: 0, fontSize: '1.5rem' }}>{t('modals.duplicateTask')}</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            padding: '0 5px',
                            lineHeight: 1
                        }}
                    >
                        &times;
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">
                            {t('modals.newTaskName')}
                        </label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            placeholder={t('modals.newTaskName')}
                            className="form-input"
                            autoFocus
                        />
                        {error && (
                            <div style={{
                                color: '#ef4444',
                                marginTop: '10px',
                                fontSize: '0.9rem',
                                background: 'rgba(239, 68, 68, 0.1)',
                                padding: '8px',
                                borderRadius: '4px'
                            }}>
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            {t('modals.cancel')}
                        </button>
                        <button
                            type="submit"
                            className="btn-save"
                            disabled={!newTitle.trim() || isSubmitting}
                        >
                            {isSubmitting ? '...' : t('modals.duplicate')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DuplicateTaskModal;
