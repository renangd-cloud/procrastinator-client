import { useState, useEffect } from 'react';

const useTaskForm = (initialTask) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        dueDate: '',
        tags: [],
        subtasks: [],
        dependencies: [],
        isRecurring: false,
        recurrenceType: '',
        recurrenceDays: [],
        status: 'Pending',
        priority: 'Medium',
        active: true
    });

    useEffect(() => {
        if (initialTask) {
            setFormData({
                title: initialTask.title || '',
                description: initialTask.description || '',
                date: initialTask.date ? initialTask.date.split('T')[0] : '',
                dueDate: initialTask.dueDate ? initialTask.dueDate.split('T')[0] : '',
                tags: initialTask.Tags ? initialTask.Tags.map(t => ({ name: t.name, color: t.color || '#3b82f6' })) : [],
                subtasks: initialTask.Subtasks || [],
                dependencies: initialTask.Prerequisites ? initialTask.Prerequisites.map(p => p.id) : [],
                isRecurring: initialTask.isRecurring || false,
                recurrenceType: initialTask.recurrenceType || '',
                recurrenceDays: initialTask.recurrenceDays || [],
                status: initialTask.status || 'Pending',
                priority: initialTask.priority || 'Medium',
                active: initialTask.active !== undefined ? initialTask.active : true
            });
        }
    }, [initialTask]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return {
        formData,
        setFormData,
        handleChange,
        updateField
    };
};

export default useTaskForm;
