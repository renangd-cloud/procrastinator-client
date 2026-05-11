import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
    // Determine the base styles based on variant
    const getVariantStyle = () => {
        switch (variant) {
            case 'danger':
                return {
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#fca5a5',
                    border: 'none',
                };
            case 'cancel':
            case 'secondary':
                return {
                    background: 'transparent',
                    color: 'white',
                    border: '1px solid #475569',
                };
            case 'save':
            case 'primary':
            default:
                return {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                };
        }
    };

    const baseStyle = {
        padding: '10px 24px',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        ...getVariantStyle(),
        ...props.style
    };

    return (
        <button
            type={type}
            onClick={onClick}
            style={baseStyle}
            className={`btn-${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
