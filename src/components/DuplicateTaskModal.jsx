import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './ui/Modal';
import Button from './ui/Button';

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
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title={t('modals.duplicateTask')}
            className="task-modal-content"
            style={{ maxWidth: '400px', height: 'auto', minHeight: 'auto', overflow: 'visible' }}
        >
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

                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '30px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                        <Button variant="cancel" onClick={onClose}>
                            {t('modals.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            disabled={!newTitle.trim() || isSubmitting}
                        >
                            {isSubmitting ? '...' : t('modals.duplicate')}
                        </Button>
                    </div>
                </form>
        </Modal>
    );
};

export default DuplicateTaskModal;
