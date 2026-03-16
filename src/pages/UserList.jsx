import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { useTranslation } from 'react-i18next';


const UserList = () => {
    const { t, i18n } = useTranslation();
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const { getUsers } = useApi();
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        getUsers()
            .then(res => setUsers(res.data))
            .catch(err => {
                if (err.response?.status === 403) {
                    setError(t('userList.accessDeniedMessage'));
                } else if (err.response?.status === 401) {
                    setError(t('userList.unauthorizedMessage'));
                } else {
                    setError(t('userList.loadFailed'));
                }
                console.error(err);
            });
    }, [t]);

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1>{t('userList.title')}</h1>

            </div>

            {error ? (
                <div className="glass-panel" style={{
                    padding: '40px',
                    textAlign: 'center',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)'
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🚫</div>
                    <h2 style={{ color: '#fca5a5', marginBottom: '10px' }}>{t('userList.accessDenied')}</h2>
                    <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>{error}</p>
                </div>
            ) : (
                <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'white' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <th style={{ textAlign: 'left', padding: '10px' }}>{t('userList.name')}</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>{t('userList.email')}</th>
                                <th style={{ textAlign: 'left', padding: '10px' }}>{t('userList.role')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} onClick={() => setSelectedUser(user)}
                                    style={{ cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '10px' }}>{user.name}</td>
                                    <td style={{ padding: '10px' }}>{user.email}</td>
                                    <td style={{ padding: '10px' }}>{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {selectedUser && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                }} onClick={() => setSelectedUser(null)}>
                    <div className="glass-panel" style={{ padding: '30px', width: '400px', backgroundColor: '#1e293b' }} onClick={e => e.stopPropagation()}>
                        <h2 style={{ marginTop: 0 }}>{t('userList.userDetails')}</h2>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('userList.name')}</label>
                            <div style={{ fontSize: '1.1rem' }}>{selectedUser.name}</div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('userList.email')}</label>
                            <div style={{ fontSize: '1.1rem' }}>{selectedUser.email}</div>
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('userList.role')}</label>
                            <div style={{ fontSize: '1.1rem' }}>{selectedUser.role}</div>
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{t('userList.joined')}</label>
                            <div style={{ fontSize: '1.1rem' }}>{new Date(selectedUser.createDate).toLocaleDateString(i18n.language)}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-primary" onClick={() => setSelectedUser(null)}>{t('userList.close')}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserList;
