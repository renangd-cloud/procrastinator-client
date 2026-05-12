import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ptBR, enUS } from 'date-fns/locale';
import './ReminderBanner.css';

const ReminderBanner = ({ reminders, dismissedIds, onDismiss }) => {
    const { t, i18n } = useTranslation();
    const dateLocale = i18n.language === 'pt' ? ptBR : enUS;

    const visibleReminders = reminders.filter(r => !dismissedIds.includes(r.id));

    if (visibleReminders.length === 0) return null;

    return (
        <div className="reminder-banner-container">
            {visibleReminders.map(task => {
                if (!task.dueDate) return null;

                const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
                const hoursLeft = differenceInHours(dueDate, new Date());
                const isOverdue = hoursLeft < 0;
                const formattedDate = format(dueDate, "dd/MM 'às' HH:mm", { locale: dateLocale });

                return (
                    <div
                        key={task.id}
                        className={`reminder-banner-item ${isOverdue ? 'overdue' : 'upcoming'}`}
                    >
                        <span className="reminder-banner-icon">
                            {isOverdue ? '🚨' : '⏰'}
                        </span>
                        <div className="reminder-banner-content">
                            <strong className="reminder-banner-title">{task.title}</strong>
                            <span className="reminder-banner-time">
                                {isOverdue
                                    ? t('reminders.overdue', { date: formattedDate })
                                    : t('reminders.dueIn', { hours: hoursLeft, date: formattedDate })
                                }
                            </span>
                        </div>
                        <button
                            className="reminder-banner-dismiss"
                            onClick={() => onDismiss(task.id)}
                            title={t('reminders.dismiss')}
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ReminderBanner;
