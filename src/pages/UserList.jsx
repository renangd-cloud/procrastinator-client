import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { useTranslation } from 'react-i18next';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import './UserList.css';

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
        <div className="user-list-container">
            <div className="user-list-header">
                <h1>{t('userList.title')}</h1>
            </div>

            {error ? (
                <div className="glass-panel error-panel">
                    <div className="error-icon">🚫</div>
                    <h2 className="error-title">{t('userList.accessDenied')}</h2>
                    <p className="error-message">{error}</p>
                </div>
            ) : (
                <div className="glass-panel table-container">
                    <table className="user-table">
                        <thead>
                            <tr>
                                <th>{t('userList.name')}</th>
                                <th>{t('userList.email')}</th>
                                <th>{t('userList.role')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} onClick={() => setSelectedUser(user)} className="user-row">
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal 
                isOpen={!!selectedUser} 
                onClose={() => setSelectedUser(null)} 
                title={t('userList.userDetails')}
                style={{ width: '400px', padding: '30px', backgroundColor: '#1e293b' }}
            >
                {selectedUser && (
                    <>
                        <div className="user-details-group">
                            <label className="user-details-label">{t('userList.name')}</label>
                            <div className="user-details-value">{selectedUser.name}</div>
                        </div>
                        <div className="user-details-group">
                            <label className="user-details-label">{t('userList.email')}</label>
                            <div className="user-details-value">{selectedUser.email}</div>
                        </div>
                        <div className="user-details-group">
                            <label className="user-details-label">{t('userList.role')}</label>
                            <div className="user-details-value">{selectedUser.role}</div>
                        </div>
                        <div className="user-details-group" style={{ marginBottom: '20px' }}>
                            <label className="user-details-label">{t('userList.joined')}</label>
                            <div className="user-details-value">{new Date(selectedUser.createDate).toLocaleDateString(i18n.language)}</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <Button variant="primary" onClick={() => setSelectedUser(null)}>{t('userList.close')}</Button>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default UserList;
