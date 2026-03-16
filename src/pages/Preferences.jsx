import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';

const Preferences = () => {
    const { t, i18n } = useTranslation();
    const { user, setUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [currentLang, setCurrentLang] = useState(i18n.language);

    useEffect(() => {
        if (user?.preferences?.language) {
            setCurrentLang(user.preferences.language);
            if (i18n.language !== user.preferences.language) {
                i18n.changeLanguage(user.preferences.language);
            }
        }
    }, [user]); // Removed i18n dependency to prevent reverting state on language change

    const handleLanguageChange = (lang) => {
        setCurrentLang(lang);
        // Optional: Preview language change immediately or wait for save?
        // Let's preview it to give feedback, but user must save to persist.
        i18n.changeLanguage(lang);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    preferences: { ...user.preferences, language: currentLang }
                }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                alert(t('preferences.saved', 'Preferências salvas com sucesso!'));
            } else {
                console.error('Failed to update preferences');
                alert(t('preferences.error', 'Erro ao salvar preferências.'));
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
            alert(t('preferences.error', 'Erro ao salvar preferências.'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <h1 style={{ marginBottom: '30px' }}>{t('preferences', 'Preferências')}</h1>

            <div className="glass-panel" style={{ padding: '20px', maxWidth: '600px' }}>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                    {t('generalSettings', 'Configurações Gerais')}
                </h2>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '10px', fontSize: '0.9rem', color: '#ccc' }}>
                        {t('language', 'Idioma')}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            onClick={() => handleLanguageChange('pt')}
                            style={{
                                background: currentLang === 'pt' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            Português
                        </button>
                        <button
                            onClick={() => handleLanguageChange('en')}
                            style={{
                                background: currentLang === 'en' ? 'rgba(59, 130, 246, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                padding: '10px 20px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        >
                            English
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                border: 'none',
                                color: 'white',
                                padding: '10px 30px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                opacity: saving ? 0.7 : 1,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {saving ? t('saving', 'Salvando...') : t('save', 'Salvar Alterações')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
