import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../App';
import Button from '../components/ui/Button';
import './Preferences.css';

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
    }, [user]);

    const handleLanguageChange = (lang) => {
        setCurrentLang(lang);
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
        <div className="preferences-container">
            <h1 className="preferences-title">{t('preferences', 'Preferências')}</h1>

            <div className="glass-panel preferences-panel">
                <h2 className="preferences-section-title">
                    {t('generalSettings', 'Configurações Gerais')}
                </h2>

                <div className="preferences-group">
                    <label className="preferences-label">
                        {t('language', 'Idioma')}
                    </label>
                    <div className="language-selector">
                        <button
                            onClick={() => handleLanguageChange('pt')}
                            className={`language-btn ${currentLang === 'pt' ? 'active' : ''}`}
                        >
                            Português
                        </button>
                        <button
                            onClick={() => handleLanguageChange('en')}
                            className={`language-btn ${currentLang === 'en' ? 'active' : ''}`}
                        >
                            English
                        </button>
                    </div>

                    <div className="preferences-actions">
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{ opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? t('saving', 'Salvando...') : t('save', 'Salvar Alterações')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Preferences;
