import React from 'react';
import { useTranslation } from 'react-i18next';
import { format, differenceInHours, parse, endOfDay } from 'date-fns';
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

                // Extract only the YYYY-MM-DD part to avoid UTC offset shifting the date
                // e.g. "2026-05-13T00:00:00.000Z" parsed as UTC becomes "12/05 20:00" in UTC-4
                // By parsing as a local date and treating it as end-of-day, we respect the user's timezone
                const dateStr = typeof task.dueDate === 'string'
                    ? task.dueDate.substring(0, 10)
                    : format(task.dueDate, 'yyyy-MM-dd');
                const dueDate = endOfDay(parse(dateStr, 'yyyy-MM-dd', new Date()));

                const hoursLeft = differenceInHours(dueDate, new Date());
                const isOverdue = hoursLeft < 0;
                const formattedDate = format(dueDate, "dd/MM", { locale: dateLocale });

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
