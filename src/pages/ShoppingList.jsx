import React, { useState, useEffect } from 'react';
import useApi from '../hooks/useApi';
import { useTranslation } from 'react-i18next';
import { Plus, ShoppingCart, Trash2, Pencil, ExternalLink } from 'lucide-react';
import ShoppingItemModal from '../components/ShoppingItemModal';
import { stringToColor } from '../utils/colorUtils';
import './ShoppingList.css';

const ShoppingList = () => {
    const { t } = useTranslation();
    const { getShoppingItems, createShoppingItem, updateShoppingItem, deleteShoppingItem } = useApi();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, item: null });

    const fetchItems = async () => {
        setLoading(true);
        try {
            const res = await getShoppingItems();
            setItems(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    // Close context menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu({ ...contextMenu, show: false });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    const handleContextMenu = (e, item) => {
        e.preventDefault();
        setContextMenu({
            show: true,
            x: e.pageX,
            y: e.pageY,
            item: item
        });
    };

    const handleSave = async (formData) => {
        try {
            if (selectedItem) {
                await updateShoppingItem(selectedItem.id, formData);
            } else {
                await createShoppingItem(formData);
            }
            setIsModalOpen(false);
            setSelectedItem(null);
            fetchItems();
        } catch (err) {
            alert('Error saving item: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(t('common.confirmDelete'))) {
            try {
                await deleteShoppingItem(id);
                fetchItems();
                setIsModalOpen(false); // Close if open
            } catch (err) {
                alert('Error deleting item: ' + (err.response?.data?.message || err.message));
            }
        }
    };

    const handleDeleteFromMenu = async () => {
        if (!contextMenu.item) return;
        try {
            await deleteShoppingItem(contextMenu.item.id);
            fetchItems();
        } catch (err) {
            alert('Error deleting item: ' + (err.response?.data?.message || err.message));
        }
    };

    const handleEditFromMenu = () => {
        if (!contextMenu.item) return;
        setSelectedItem(contextMenu.item);
        setIsModalOpen(true);
    }

    const openCreateModal = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    // Group items by category (optional enhancement for visual appeal)
    // For now, simple grid

    return (
        <div className="shopping-container">
            <div className="shopping-header">
                <div className="header-title-group">
                    <h1>
                        <ShoppingCart className="header-icon" />
                        {t('shoppingList.title')}
                    </h1>
                    <button className="add-item-button" onClick={openCreateModal}>
                        <Plus size={20} />
                        {t('shoppingList.addItem')}
                    </button>
                </div>
            </div>

            <div className="shopping-list">
                {/* Header Row - Now without Market column */}
                <div className="list-header glass-panel" style={{ gridTemplateColumns: '2fr 1fr 1fr 1fr' }}>
                    <div className="header-cell">{t('shoppingList.item')}</div>
                    <div className="header-cell">{t('shoppingList.quantity')}</div>
                    <div className="header-cell">{t('shoppingList.category')}</div>
                    <div className="header-cell"></div>
                </div>

                <div className="list-body">
                    {items.length === 0 && !loading && (
                        <div className="empty-state">
                            <ShoppingCart size={48} className="empty-icon" />
                            <p>{t('shoppingList.emptyState')}</p>
                        </div>
                    )}

                    {Object.entries(items.reduce((acc, item) => {
                        const market = item.market || 'Outros';
                        if (!acc[market]) acc[market] = [];
                        acc[market].push(item);
                        return acc;
                    }, {})).sort((a, b) => {
                        if (a[0] === 'Outros') return 1;
                        if (b[0] === 'Outros') return -1;
                        return a[0].localeCompare(b[0]);
                    }).map(([market, groupItems]) => (
                        <div key={market} className="market-group glass-panel">
                            <div className="market-header">
                                <div
                                    className="market-header-label"
                                    style={{
                                        backgroundColor: stringToColor(market),
                                        color: '#ffffff'
                                    }}
                                >
                                    {market}
                                </div>
                            </div>
                            <div className="market-items">
                                {groupItems.map(item => (
                                    <div
                                        key={item.id}
                                        className="shopping-list-item"
                                        onContextMenu={(e) => handleContextMenu(e, item)}
                                        onClick={() => { setSelectedItem(item); setIsModalOpen(true); }}
                                    >
                                        <div className="list-cell item-name">
                                            {item.name}
                                        </div>
                                        <div className="list-cell item-quantity">{item.quantity}</div>
                                        <div className="list-cell item-category">
                                            {item.category && (
                                                <span
                                                    className="item-tag category-tag"
                                                    style={{
                                                        backgroundColor: stringToColor(item.category),
                                                        color: '#ffffff',
                                                        border: 'none'
                                                    }}
                                                >
                                                    {item.category}
                                                </span>
                                            )}
                                        </div>
                                        <div className="list-cell item-link">
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    style={{
                                                        color: '#6366f1',
                                                        fontSize: '0.85rem',
                                                        textDecoration: 'underline',
                                                        fontStyle: 'italic',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {t('shoppingList.viewProduct')}
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    className="context-menu glass-panel"
                    style={{
                        top: contextMenu.y,
                        left: contextMenu.x
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={handleEditFromMenu} className="context-menu-item">
                        <Pencil size={16} />
                        {t('common.edit')}
                    </button>
                    <button onClick={handleDeleteFromMenu} className="context-menu-item delete">
                        <Trash2 size={16} />
                        {t('common.delete')}
                    </button>
                </div>
            )}

            {isModalOpen && (
                <ShoppingItemModal
                    item={selectedItem}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    onDelete={handleDelete}
                />
            )}
        </div>
    );
};

export default ShoppingList;
