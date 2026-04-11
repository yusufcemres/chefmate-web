'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { ShoppingList, ShoppingListItem } from '@/lib/types';
import { ShoppingCart, Plus, Trash2, Check, Loader2, Package, X } from 'lucide-react';
import clsx from 'clsx';

export default function ShoppingListPage() {
  const { isAuthenticated, init } = useAuthStore();
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [activeList, setActiveList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  useEffect(() => { init(); }, [init]);

  const fetchLists = useCallback(async () => {
    try {
      const data = await api.get<ShoppingList[]>('/shopping-lists');
      const list = Array.isArray(data) ? data : [];
      setLists(list);
      if (list.length > 0 && !activeList) setActiveList(list[0]);
    } catch {}
    setLoading(false);
  }, [activeList]);

  const fetchDetail = useCallback(async (id: string) => {
    try {
      const data = await api.get<ShoppingList>(`/shopping-lists/${id}`);
      setActiveList(data);
    } catch {}
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchLists();
    else setLoading(false);
  }, [isAuthenticated, fetchLists]);

  const createList = async () => {
    if (!newName.trim()) return;
    try {
      const list = await api.post<ShoppingList>('/shopping-lists', { name: newName.trim() });
      setShowCreate(false);
      setNewName('');
      await fetchLists();
      setActiveList(list);
    } catch {}
  };

  const deleteList = async (id: string) => {
    try {
      await api.delete(`/shopping-lists/${id}`);
      setLists(prev => prev.filter(l => l.id !== id));
      if (activeList?.id === id) setActiveList(null);
    } catch {}
  };

  const addItem = async () => {
    if (!activeList || !newItemName.trim()) return;
    try {
      await api.post(`/shopping-lists/${activeList.id}/items`, {
        name: newItemName.trim(),
        quantity: newItemQty ? parseFloat(newItemQty) : null,
        unit: newItemUnit || null,
      });
      setNewItemName('');
      setNewItemQty('');
      setNewItemUnit('');
      await fetchDetail(activeList.id);
    } catch {}
  };

  const toggleItem = async (itemId: string) => {
    if (!activeList) return;
    try {
      await api.patch(`/shopping-lists/${activeList.id}/items/${itemId}`);
      setActiveList(prev => prev ? {
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId ? { ...item, isChecked: !item.isChecked } : item
        ),
      } : null);
    } catch {}
  };

  const deleteItem = async (itemId: string) => {
    if (!activeList) return;
    try {
      await api.delete(`/shopping-lists/${activeList.id}/items/${itemId}`);
      setActiveList(prev => prev ? {
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
      } : null);
    } catch {}
  };

  const checkedCount = activeList?.items?.filter(i => i.isChecked).length || 0;
  const totalCount = activeList?.items?.length || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Alışveriş Listesi</h1>
          <p className="text-text-muted mt-1">Eksik malzemelerinizi takip edin</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm"
        >
          <Plus className="w-4 h-4" /> Yeni Liste
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading text-lg font-bold">Yeni Liste</h2>
              <button onClick={() => setShowCreate(false)} className="p-1 rounded-full hover:bg-surface-low">
                <X className="w-5 h-5" />
              </button>
            </div>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Liste adı..."
              className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
              onKeyDown={e => e.key === 'Enter' && createList()}
            />
            <button onClick={createList} disabled={!newName.trim()} className="w-full py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50">
              Oluştur
            </button>
          </div>
        </div>
      )}

      {/* List tabs */}
      {lists.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {lists.map(list => (
            <button
              key={list.id}
              onClick={() => { setActiveList(list); fetchDetail(list.id); }}
              className={clsx('flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors', activeList?.id === list.id ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}
            >
              {list.name}
            </button>
          ))}
        </div>
      )}

      {activeList ? (
        <div className="bg-card rounded-2xl border border-border-light overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold">{activeList.name}</h2>
              <p className="text-xs text-text-muted mt-0.5">{checkedCount}/{totalCount} tamamlandı</p>
            </div>
            <button onClick={() => deleteList(activeList.id)} className="p-2 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Progress */}
          {totalCount > 0 && (
            <div className="h-1 bg-surface-low">
              <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(checkedCount / totalCount) * 100}%` }} />
            </div>
          )}

          {/* Add item */}
          <div className="px-5 py-3 border-b border-border-light">
            <div className="flex gap-2">
              <input
                value={newItemName} onChange={e => setNewItemName(e.target.value)}
                placeholder="Malzeme adı..."
                className="flex-1 p-2.5 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={e => e.key === 'Enter' && addItem()}
              />
              <input
                value={newItemQty} onChange={e => setNewItemQty(e.target.value)}
                placeholder="Miktar"
                type="number"
                className="w-20 p-2.5 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <input
                value={newItemUnit} onChange={e => setNewItemUnit(e.target.value)}
                placeholder="Birim"
                className="w-20 p-2.5 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button onClick={addItem} disabled={!newItemName.trim()} className="p-2.5 rounded-xl bg-primary text-on-primary disabled:opacity-50">
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Items */}
          <div className="divide-y divide-border-light">
            {/* Unchecked first */}
            {activeList.items
              ?.sort((a, b) => Number(a.isChecked) - Number(b.isChecked))
              .map(item => (
              <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={clsx('flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', item.isChecked ? 'bg-primary border-primary' : 'border-border-light')}
                >
                  {item.isChecked && <Check className="w-3 h-3 text-on-primary" />}
                </button>
                <div className={clsx('flex-1 min-w-0', item.isChecked && 'line-through text-text-muted')}>
                  <span className="text-sm font-medium">{item.name}</span>
                  {(item.quantity || item.unit) && (
                    <span className="text-xs text-text-muted ml-2">
                      {item.quantity} {item.unit}
                    </span>
                  )}
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-1 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {totalCount === 0 && (
            <div className="text-center py-8 text-text-muted text-sm">
              Henüz madde eklenmedi
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Henüz Listeniz Yok</h2>
          <p className="text-text-muted mb-6">Yeni bir alışveriş listesi oluşturun veya tariflerden otomatik ekleyin</p>
          <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
            <Plus className="w-4 h-4" /> İlk Listemi Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
