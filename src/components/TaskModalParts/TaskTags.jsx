import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Premium colors for tags
const tagColors = [
    '#ef4444', '#f97316', '#f59e0b', '#10b981',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'
];

const getRandomColor = () => {
    return tagColors[Math.floor(Math.random() * tagColors.length)];
};

const TaskTags = ({ tags, availableTags, updateField }) => {
    const { t } = useTranslation();
    const [newTag, setNewTag] = useState('');
    const [showTagDropdown, setShowTagDropdown] = useState(false);

    const handleAddTag = () => {
        if (newTag && !tags.some(t => t.name.toLowerCase() === newTag.toLowerCase())) {
            if (tags.length >= 10) {
                alert('Máximo de 10 tags permitido');
                return;
            }
            const existingTag = availableTags.find(t => t.name.toLowerCase() === newTag.toLowerCase());

            updateField('tags', [...tags, { name: existingTag ? existingTag.name : newTag, color: existingTag ? existingTag.color : getRandomColor() }]);
            setNewTag('');
            setShowTagDropdown(false);
        }
    };

    const handleSelectTag = (tag) => {
        if (!tags.some(t => t.name === tag.name)) {
            if (tags.length >= 10) {
                alert('Máximo de 10 tags permitido');
                return;
            }
            updateField('tags', [...tags, { name: tag.name, color: tag.color }]);
            setNewTag('');
            setShowTagDropdown(false);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTag();
        }
    };

    const removeTag = (tagName) => {
        updateField('tags', tags.filter(t => t.name !== tagName));
    };

    return (
        <div className="form-group">
            <label className="form-label">{t('modals.tags')}</label>
            <div className="tags-input-container">
                <input
                    type="text"
                    value={newTag}
                    onChange={(e) => {
                        setNewTag(e.target.value);
                        setShowTagDropdown(true);
                    }}
                    onFocus={() => setShowTagDropdown(true)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t('modals.tagsPlaceholder')}
                    className="form-input"
                    style={{ marginBottom: '10px' }}
                />
                {showTagDropdown && newTag && (
                    <div className="dropdown-list">
                        {availableTags
                            .filter(t => t.name.toLowerCase().startsWith(newTag.toLowerCase()) && !tags.some(sel => sel.name === t.name))
                            .map(t => (
                                <div
                                    key={t.id}
                                    onClick={() => handleSelectTag(t)}
                                    className="dropdown-item"
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
                                >
                                    <span style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: t.color
                                    }}></span>
                                    {t.name}
                                </div>
                            ))}
                    </div>
                )}
            </div>
            <div className="tag-list">
                {tags.map((tag, index) => (
                    <span key={index} className="tag-chip" style={{
                        background: `${tag.color}22`,
                        color: tag.color,
                        border: `1px solid ${tag.color}44`,
                    }}>
                        {tag.name}
                        <span onClick={() => removeTag(tag.name)} className="tag-remove">&times;</span>
                    </span>
                ))}
            </div>
        </div>
    );
};

export default TaskTags;
