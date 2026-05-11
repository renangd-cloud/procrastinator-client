import React from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, title, children, className = '', style = {} }) => {
    if (!isOpen) return null;

    return createPortal(
        <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
            <div 
                className={`glass-panel custom-scrollbar ${className}`} 
                onClick={(e) => e.stopPropagation()}
                style={style}
            >
                {title && (
                    <div className="modal-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 className="modal-title" style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>
                            {title}
                        </h2>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    background: 'transparent', border: 'none', color: '#94a3b8',
                                    fontSize: '1.5rem', cursor: 'pointer', padding: '0 5px', lineHeight: 1
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </div>
                )}
                {children}
            </div>
        </div>,
        document.body
    );
};

export default Modal;
