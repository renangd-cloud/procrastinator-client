import React from 'react';

const ModernCheckbox = ({ checked, onChange, label }) => (
    <label className="modern-checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
        <div 
            className={`modern-checkbox-box ${checked ? 'checked' : ''}`}
            style={{
                width: '20px', height: '20px', borderRadius: '6px',
                border: checked ? 'none' : '2px solid #64748b',
                background: checked ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s ease'
            }}
        >
            {checked && <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>}
        </div>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ display: 'none' }} />
        {label && <span>{label}</span>}
    </label>
);

export default ModernCheckbox;
