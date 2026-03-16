import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

import { LayoutDashboard, Users, ListTodo, Settings, ShoppingCart } from 'lucide-react';

const Layout = () => {
    const location = useLocation();
    const { user } = useAuth();
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleLogout = () => {
        window.location.href = 'http://localhost:3000/api/auth/logout';
    };

    return (
        <div className="layout">
            {/* Backdrop overlay when sidebar is expanded */}
            {!isCollapsed && (
                <div
                    onClick={() => setIsCollapsed(true)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 999,
                        transition: 'opacity 0.3s ease',
                        opacity: 1
                    }}
                />
            )}

            <div
                className="sidebar glass-panel"
                style={{
                    position: 'fixed',
                    left: '0',
                    top: '0',
                    height: '100vh',
                    width: isCollapsed ? '80px' : '250px',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                    zIndex: 1000,
                    borderRadius: '0'
                }}
            >
                {/* Logo Toggle Button */}
                <div
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        cursor: 'pointer',
                        padding: '15px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '20px',
                        borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                >
                    <img
                        src="/logo.svg"
                        alt="Procrastinator"
                        style={{
                            width: '40px',
                            height: '40px',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <Link
                        to="/"
                        className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontSize: isCollapsed ? '1.5rem' : '1rem',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                        title="Dashboard"
                    >
                        <LayoutDashboard size={24} />
                        {!isCollapsed && <span>Dashboard</span>}
                    </Link>
                    <Link
                        to="/users"
                        className={`nav-link ${location.pathname === '/users' ? 'active' : ''}`}
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontSize: isCollapsed ? '1.5rem' : '1rem',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                        title="Users"
                    >
                        <Users size={24} />
                        {!isCollapsed && <span>Users</span>}
                    </Link>
                    <Link
                        to="/tasks"
                        className={`nav-link ${location.pathname === '/tasks' ? 'active' : ''}`}
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontSize: isCollapsed ? '1.5rem' : '1rem',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                        title="Tasks"
                    >
                        <ListTodo size={24} />
                        {!isCollapsed && <span>Tasks</span>}
                    </Link>
                    <Link
                        to="/shopping"
                        className={`nav-link ${location.pathname === '/shopping' ? 'active' : ''}`}
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontSize: isCollapsed ? '1.5rem' : '1rem',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                        title="Shopping List"
                    >
                        <ShoppingCart size={24} />
                        {!isCollapsed && <span>Shopping List</span>}
                    </Link>
                    <Link
                        to="/preferences"
                        className={`nav-link ${location.pathname === '/preferences' ? 'active' : ''}`}
                        onClick={() => setIsCollapsed(true)}
                        style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            fontSize: isCollapsed ? '1.5rem' : '1rem',
                            gap: isCollapsed ? '0' : '12px'
                        }}
                        title="Preferences"
                    >
                        <Settings size={24} />
                        {!isCollapsed && <span>{user && user.preferences && user.preferences.language === 'pt' ? 'Preferências' : 'Preferences'}</span>}
                    </Link>
                </nav>

                {!isCollapsed && (
                    <div style={{ width: '100%' }}>
                        {user && (
                            <div style={{
                                padding: '0 15px 10px 15px',
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.9rem',
                                textAlign: 'center',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}>
                                {user.name || user.username || user.email}
                            </div>
                        )}
                        <button
                            onClick={handleLogout}
                            style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fca5a5',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                width: '100%'
                            }}
                            title="Logout"
                        >
                            Logout
                        </button>
                    </div>
                )}
            </div>
            <div className="content" style={{ marginLeft: '120px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
