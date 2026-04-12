'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Package, Plus, Trash2, Camera, Loader2, AlertTriangle, Search, X, Upload, Check, RefrigeratorIcon } from 'lucide-react';
import clsx from 'clsx';

interface InventoryItem {
  id: string;
  productName: string;
  quantity: number;
  unit: string;
  storageLocation: 'FRIDGE' | 'FREEZER' | 'PANTRY' | 'OTHER';
  expirationDate: string | null;
  status: 'ACTIVE' | 'DEPLETED' | 'EXPIRED';
  product?: { imageUrl?: string; categoryName?: string };
}

interface DetectedItem {
  name: string;
  quantity: number;
  unit: string;
  confidence: number;
}

const STORAGE_LABELS: Record<string, string> = {
  FRIDGE: 'Buzdolabı',
  FREEZER: 'Dondurucu',
  PANTRY: 'Kiler',
  OTHER: 'Diğer',
};

const STORAGE_FILTERS = ['ALL', 'FRIDGE', 'FREEZER', 'PANTRY', 'OTHER'] as const;

export default function InventoryPage() {
  const { isAuthenticated, user, init } = useAuthStore();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Add item
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addQty, setAddQty] = useState('1');
  const [addUnit, setAddUnit] = useState('adet');
  const [addStorage, setAddStorage] = useState<string>('FRIDGE');
  const [addExpiry, setAddExpiry] = useState('');
  const [adding, setAdding] = useState(false);

  // AI Detection
  const [showDetect, setShowDetect] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [detectionId, setDetectionId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { init(); }, [init]);

  const fetchItems = useCallback(async () => {
    try {
      const data = await api.get<InventoryItem[]>('/inventory');
      setItems(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchItems();
    else setLoading(false);
  }, [isAuthenticated, fetchItems]);

  const addItem = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      await api.post('/inventory', {
        productName: addName.trim(),
        quantity: parseFloat(addQty) || 1,
        unit: addUnit,
        storageLocation: addStorage,
        expirationDate: addExpiry || null,
      });
      setShowAdd(false);
      setAddName(''); setAddQty('1'); setAddUnit('adet'); setAddExpiry('');
      await fetchItems();
    } catch {}
    setAdding(false);
  };

  const deleteItem = async (id: string) => {
    try {
      await api.delete(`/inventory/${id}`);
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
  };

  // AI Photo Detection
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDetecting(true);
    setDetected([]);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const res = await api.post<{ id: string }>('/ai/inventory-detections', { imageBase64: base64 });
        setDetectionId(res.id);
        // Poll for results
        const poll = async () => {
          const status = await api.get<{ status: string; detectedItems?: DetectedItem[] }>(`/ai/inventory-detections/${res.id}`);
          if (status.status === 'DETECTED' && status.detectedItems) {
            setDetected(status.detectedItems);
            setDetecting(false);
          } else if (status.status === 'FAILED') {
            setDetecting(false);
            alert('Algılama başarısız oldu');
          } else {
            setTimeout(poll, 2000);
          }
        };
        poll();
      };
      reader.readAsDataURL(file);
    } catch {
      setDetecting(false);
    }
  };

  const applyDetected = async () => {
    if (!detectionId) return;
    try {
      await api.post(`/ai/inventory-detections/${detectionId}/apply`);
      setShowDetect(false);
      setDetected([]);
      setDetectionId(null);
      await fetchItems();
    } catch {}
  };

  // Expiry helpers
  const getExpiryStatus = (date: string | null) => {
    if (!date) return 'normal';
    const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (diff < 0) return 'expired';
    if (diff < 3) return 'warning';
    return 'normal';
  };

  const formatExpiry = (date: string | null) => {
    if (!date) return null;
    const d = new Date(date);
    const diff = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `${Math.abs(diff)} gün geçmiş`;
    if (diff === 0) return 'Bugün';
    if (diff === 1) return 'Yarın';
    return `${diff} gün kaldı`;
  };

  // Filter + search
  const filtered = items.filter(item => {
    if (filter !== 'ALL' && item.storageLocation !== filter) return false;
    if (searchQuery && !item.productName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const expiring = items.filter(i => getExpiryStatus(i.expirationDate) === 'warning');
  const expired = items.filter(i => getExpiryStatus(i.expirationDate) === 'expired');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-8 pt-32 pb-24">
      <div className="flex items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
            Mutfağım
          </span>
          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05]">Stoğum</h1>
          <p className="text-text-secondary text-lg mt-3">{items.length} ürün takip ediliyor.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowDetect(true)} className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-surface-container text-text font-heading font-bold text-xs uppercase tracking-[0.15em] hover:bg-surface-container-high transition-colors">
            <Camera className="w-4 h-4" /> Fotoğrafla
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary-container text-text font-heading font-extrabold text-xs uppercase tracking-[0.15em]">
            <Plus className="w-4 h-4" /> Ekle
          </button>
        </div>
      </div>

      {/* Expiry alerts */}
      {(expired.length > 0 || expiring.length > 0) && (
        <div className="mb-6 space-y-2">
          {expired.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-error/10 border border-error/20">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
              <span className="text-sm font-medium text-error">{expired.length} ürünün son kullanma tarihi geçmiş</span>
            </div>
          )}
          {expiring.length > 0 && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-warning/10 border border-warning/20">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
              <span className="text-sm font-medium text-warning">{expiring.length} ürünün tarihi yaklaşıyor</span>
            </div>
          )}
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Ürün ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {STORAGE_FILTERS.map(f => (
            <button
              key={f} onClick={() => setFilter(f)}
              className={clsx('flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-colors', filter === f ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}
            >
              {f === 'ALL' ? 'Tümü' : STORAGE_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Items grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(item => {
            const expStatus = getExpiryStatus(item.expirationDate);
            return (
              <div key={item.id} className={clsx('bg-card rounded-xl border p-4 flex items-start gap-3', expStatus === 'expired' ? 'border-error/30' : expStatus === 'warning' ? 'border-warning/30' : 'border-border-light')}>
                <div className="w-10 h-10 rounded-lg bg-surface-low flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-text-muted" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold truncate">{item.productName}</h3>
                  <p className="text-xs text-text-muted">{item.quantity} {item.unit} &middot; {STORAGE_LABELS[item.storageLocation] || item.storageLocation}</p>
                  {item.expirationDate && (
                    <p className={clsx('text-xs mt-1 font-medium', expStatus === 'expired' ? 'text-error' : expStatus === 'warning' ? 'text-warning' : 'text-text-muted')}>
                      {formatExpiry(item.expirationDate)}
                    </p>
                  )}
                </div>
                <button onClick={() => deleteItem(item.id)} className="p-1 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Stoğunuz Boş</h2>
          <p className="text-text-muted mb-6">Mutfağınızdaki malzemeleri ekleyerek başlayın</p>
          <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
            <Plus className="w-4 h-4" /> İlk Ürünü Ekle
          </button>
        </div>
      )}

      {/* Add item modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">Ürün Ekle</h2>
              <button onClick={() => setShowAdd(false)} className="p-1 rounded-full hover:bg-surface-low"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="Ürün adı" className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="flex gap-3">
                <input value={addQty} onChange={e => setAddQty(e.target.value)} type="number" placeholder="Miktar" className="flex-1 p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <input value={addUnit} onChange={e => setAddUnit(e.target.value)} placeholder="Birim" className="w-24 p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-text-muted">Depolama Yeri</label>
                <div className="flex gap-2">
                  {(['FRIDGE', 'FREEZER', 'PANTRY', 'OTHER'] as const).map(s => (
                    <button key={s} onClick={() => setAddStorage(s)} className={clsx('flex-1 py-2 rounded-lg text-xs font-medium transition-colors', addStorage === s ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
                      {STORAGE_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-text-muted">Son Kullanma Tarihi</label>
                <input value={addExpiry} onChange={e => setAddExpiry(e.target.value)} type="date" className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <button onClick={addItem} disabled={!addName.trim() || adding} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {adding ? <><Loader2 className="w-4 h-4 animate-spin" /> Ekleniyor...</> : <><Plus className="w-4 h-4" /> Ekle</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Detection modal */}
      {showDetect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">AI ile Tanı</h2>
              <button onClick={() => { setShowDetect(false); setDetected([]); setDetectionId(null); }} className="p-1 rounded-full hover:bg-surface-low"><X className="w-5 h-5" /></button>
            </div>

            {detected.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">{detected.length} ürün algılandı:</p>
                {detected.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-surface-low rounded-xl">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-sm font-medium">{item.name}</span>
                      <span className="text-xs text-text-muted ml-2">{item.quantity} {item.unit}</span>
                    </div>
                    <span className="text-[10px] text-text-muted">%{Math.round(item.confidence * 100)}</span>
                  </div>
                ))}
                <button onClick={applyDetected} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2">
                  <Package className="w-4 h-4" /> Stoğa Ekle
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                {detecting ? (
                  <div>
                    <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
                    <p className="text-sm text-text-muted">Fotoğraf analiz ediliyor...</p>
                  </div>
                ) : (
                  <>
                    <Camera className="w-12 h-12 text-text-muted/30 mx-auto mb-3" />
                    <p className="text-sm text-text-muted mb-4">Mutfağınızın veya buzdolabınızın fotoğrafını çekin</p>
                    <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                    <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
                      <Upload className="w-4 h-4" /> Fotoğraf Yükle
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
