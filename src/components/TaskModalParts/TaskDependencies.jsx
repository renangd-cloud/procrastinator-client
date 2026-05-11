import React, { useState } from 'react';
import { format, parse } from 'date-fns';
import { useTranslation } from 'react-i18next';

const TaskDependencies = ({ dependencies, availableTasks, updateField }) => {
    const { t } = useTranslation();
    const [dependencySearch, setDependencySearch] = useState('');
    const [showDependencyDropdown, setShowDependencyDropdown] = useState(false);

    const addDependency = (taskId) => {
        if (!dependencies.includes(taskId)) {
            updateField('dependencies', [...dependencies, taskId]);
        }
        setDependencySearch('');
        setShowDependencyDropdown(false);
    };

    const removeDependency = (taskId) => {
        updateField('dependencies', dependencies.filter(id => id !== taskId));
    };

    return (
        <div className="form-group" style={{ marginBottom: '25px' }}>
            <label className="form-label">{t('modals.dependencies')}</label>
            <div className="dependency-input-container">
                <input
                    type="text"
                    value={dependencySearch}
                    onChange={(e) => {
                        setDependencySearch(e.target.value);
                        setShowDependencyDropdown(true);
                    }}
                    onFocus={() => setShowDependencyDropdown(true)}
                    placeholder={t('modals.dependenciesPlaceholder')}
                    className="form-input"
                />
                {showDependencyDropdown && dependencySearch && (
                    <div className="dropdown-list">
                        {availableTasks
                            .filter(task => task.title.toLowerCase().includes(dependencySearch.toLowerCase()) && !dependencies.includes(task.id))
                            .map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => addDependency(task.id)}
                                    className="dropdown-item"
                                >
                                    {task.title} <span className="dropdown-item-meta">
                                        ({task.date ? format(task.date.includes('T') ? new Date(task.date) : parse(task.date, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : 'Sem data'})
                                    </span>
                                </div>
                            ))}
                        {availableTasks.filter(task => task.title.toLowerCase().includes(dependencySearch.toLowerCase()) && !dependencies.includes(task.id)).length === 0 && (
                            <div className="no-results">{t('modals.noTasksFound')}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Selected Dependencies List */}
            <div className="selected-dependencies">
                {dependencies.map(depId => {
                    const task = availableTasks.find(t => t.id === depId) || { title: 'Tarefa Carregando...', id: depId };
                    return (
                        <div key={depId} className="dependency-chip">
                            <span>{task.title}</span>
                            <span onClick={() => removeDependency(depId)} style={{ cursor: 'pointer', color: '#ef4444' }}>&times;</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TaskDependencies;
