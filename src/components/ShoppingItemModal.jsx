import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import useApi from '../hooks/useApi';
import './ShoppingItemModal.css';
import Modal from './ui/Modal';
import Button from './ui/Button';

const ShoppingItemModal = ({ item, onClose, onSave, onDelete }) => {
    const { t } = useTranslation();
    const { getShoppingSuggestions } = useApi();
    const [suggestions, setSuggestions] = useState({ categories: [], markets: [] });
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
    const [showMarketDropdown, setShowMarketDropdown] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        quantity: '',
        category: '',
        market: '',
        link: ''
    });

    useEffect(() => {
        if (item) {
            setFormData({
                name: item.name || '',
                quantity: item.quantity || '',
                category: item.category || '',
                market: item.market || '',
                link: item.link || ''
            });
        }
    }, [item]);

    useEffect(() => {
        const fetchSuggestions = async () => {
            try {
                const res = await getShoppingSuggestions();
                setSuggestions(res.data);
            } catch (err) {
                console.error("Error fetching suggestions:", err);
            }
        };
        fetchSuggestions();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title={item ? t('shoppingList.editItem') : t('shoppingList.addItem')}
            className="shopping-modal-content"
        >
            <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>{t('shoppingList.item')}</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{t('shoppingList.quantity')}</label>
                        <input
                            type="text"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group relative-group">
                        <label>{t('shoppingList.category')}</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => {
                                setFormData({ ...formData, category: e.target.value });
                                setShowCategoryDropdown(true);
                            }}
                            onFocus={() => setShowCategoryDropdown(true)}
                            onBlur={() => setTimeout(() => setShowCategoryDropdown(false), 200)}
                        />
                        {showCategoryDropdown && (
                            <div className="suggestion-dropdown">
                                {suggestions.categories
                                    .filter(c => c && c.toLowerCase().includes(formData.category.toLowerCase()))
                                    .map((category, idx) => (
                                        <div
                                            key={idx}
                                            className="suggestion-item"
                                            onClick={() => setFormData({ ...formData, category })}
                                        >
                                            {category}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                    <div className="form-group relative-group">
                        <label>{t('shoppingList.market')}</label>
                        <input
                            type="text"
                            value={formData.market}
                            onChange={(e) => {
                                setFormData({ ...formData, market: e.target.value });
                                setShowMarketDropdown(true);
                            }}
                            onFocus={() => setShowMarketDropdown(true)}
                            onBlur={() => setTimeout(() => setShowMarketDropdown(false), 200)}
                        />
                        {showMarketDropdown && (
                            <div className="suggestion-dropdown">
                                {suggestions.markets
                                    .filter(m => m && m.toLowerCase().includes(formData.market.toLowerCase()))
                                    .map((market, idx) => (
                                        <div
                                            key={idx}
                                            className="suggestion-item"
                                            onClick={() => setFormData({ ...formData, market })}
                                        >
                                            {market}
                                        </div>
                                    ))}
                            </div>
                        )}
                    </div>
                    <div className="form-group">
                        <label>{t('shoppingList.link')}</label>
                        <input
                            type="text"
                            value={formData.link}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            placeholder="https://..."
                        />
                    </div>
                    <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                        {item && onDelete && (
                            <Button variant="danger" onClick={() => onDelete(item.id)} style={{ marginRight: 'auto' }}>
                                {t('common.delete')}
                            </Button>
                        )}
                        <Button variant="cancel" onClick={onClose}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('common.save')}
                        </Button>
                    </div>
                </form>
        </Modal>
    );
};

export default ShoppingItemModal;
