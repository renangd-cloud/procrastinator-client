import React from 'react';
import { useTranslation } from 'react-i18next';
import ModernCheckbox from '../ui/ModernCheckbox';

const TaskBasicInfo = ({ formData, handleChange, updateField, isEditMode }) => {
    const { t } = useTranslation();

    const handleRecurringChange = (e) => {
        updateField('isRecurring', e.target.checked);
        if (e.target.checked && !formData.recurrenceType) {
            updateField('recurrenceType', 'Daily');
        }
    };

    const handleRecurrenceTypeChange = (e) => {
        updateField('recurrenceType', e.target.value);
        if (e.target.value !== 'Daily') {
            updateField('recurrenceDays', []);
        }
    };

    const toggleRecurrenceDay = (dayIndex) => {
        const days = formData.recurrenceDays.includes(dayIndex)
            ? formData.recurrenceDays.filter(d => d !== dayIndex)
            : [...formData.recurrenceDays, dayIndex];
        updateField('recurrenceDays', days);
    };

    return (
        <>
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
                            <div className="recurrence-note">{t('recurrenceNotes.weekly')}</div>
                        )}

                        {formData.recurrenceType === 'Bi-weekly' && (
                            <div className="recurrence-note">{t('recurrenceNotes.biWeekly')}</div>
                        )}

                        {formData.recurrenceType === 'Monthly' && (
                            <div className="recurrence-note">{t('recurrenceNotes.monthly')}</div>
                        )}
                    </div>
                )}
            </div>

            {isEditMode && (
                <div className="form-group">
                    <label className="form-label">{t('modals.status')}</label>
                    <div className="status-selector">
                        {['Pending', 'Completed'].map(status => {
                            const isSelected = formData.status === status;
                            let activeColor = '#9ca3af'; // Default Gray
                            if (status === 'Completed') activeColor = '#10b981';

                            let statusLabel = status === 'Pending' ? t('status.pending') : t('status.completed');

                            return (
                                <div
                                    key={status}
                                    onClick={() => updateField('status', status)}
                                    className={`status-option ${isSelected ? 'selected' : 'unselected'}`}
                                    style={isSelected ? { background: activeColor } : {}}
                                >
                                    {statusLabel}
                                </div>
                            );
                        })}
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
        </>
    );
};

export default TaskBasicInfo;
