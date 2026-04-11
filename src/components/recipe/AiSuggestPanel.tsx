'use client';

import { useState } from 'react';
import { Sparkles, Heart, Globe, Leaf, Wallet, Zap, Package, MessageSquare, Loader2, ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { SuggestionType, AiSuggestionResult } from '@/lib/types';
import clsx from 'clsx';
import Link from 'next/link';

const MODES: { type: SuggestionType; label: string; icon: typeof Heart; desc: string }[] = [
  { type: 'healthier', label: 'Daha Sağlıklı', icon: Heart, desc: 'Daha az kalori, daha çok lif' },
  { type: 'cuisine', label: 'Farklı Mutfak', icon: Globe, desc: 'Asya, İtalyan, Meksika...' },
  { type: 'dietary', label: 'Diyet Uyumlu', icon: Leaf, desc: 'Vegan, glutensiz, laktozsuz' },
  { type: 'budget', label: 'Bütçe Dostu', icon: Wallet, desc: 'Uygun fiyatlı alternatifler' },
  { type: 'quick', label: 'Daha Hızlı', icon: Zap, desc: 'Daha kısa sürede hazır' },
  { type: 'inventory', label: 'Stoğuma Göre', icon: Package, desc: 'Elindeki malzemelerle' },
  { type: 'custom', label: 'Özel İstek', icon: MessageSquare, desc: 'Kendi isteğini yaz' },
];

export function AiSuggestPanel({ recipeId, recipeTitle }: { recipeId: string; recipeTitle: string }) {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<SuggestionType | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiSuggestionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSuggest = async (type: SuggestionType) => {
    setSelectedType(type);
    if (type === 'custom' && !customPrompt.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body: any = { type };
      if (type === 'custom' && customPrompt.trim()) {
        body.customPrompt = customPrompt.trim();
      }
      const data = await api.post<AiSuggestionResult>(`/recipes/${recipeId}/ai-suggest`, body);
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="bg-card rounded-2xl border border-border-light p-6 mt-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-lg font-bold">AI ile Uyarla</h2>
        </div>
        <p className="text-sm text-text-muted mb-4">Bu tarifi sağlıklı, bütçe dostu veya diyet uyumlu hale getir.</p>
        <Link href="/giris" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border-light p-6 mt-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-heading text-lg font-bold">AI ile Uyarla</h2>
        </div>
        {open ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
      </button>

      {open && (
        <div className="mt-4">
          {/* Result view */}
          {result ? (
            <div className="space-y-4">
              <button onClick={() => { setResult(null); setSelectedType(null); }} className="flex items-center gap-1 text-sm text-text-muted hover:text-primary">
                <ArrowLeft className="w-4 h-4" /> Geri
              </button>

              <div className="bg-primary/5 rounded-xl p-4">
                <h3 className="font-heading font-bold text-base mb-1">{result.title}</h3>
                <p className="text-sm text-text-secondary">{result.description}</p>
              </div>

              <div className="bg-surface-low rounded-xl p-4">
                <h4 className="font-heading font-bold text-sm mb-2">Değişiklikler</h4>
                <p className="text-sm text-text-secondary">{result.changesSummary}</p>
              </div>

              {result.nutritionEstimate && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-surface-low rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-primary">{Math.round(result.nutritionEstimate.calories)}</div>
                    <div className="text-[10px] text-text-muted">kcal</div>
                  </div>
                  <div className="bg-surface-low rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-blue-500">{result.nutritionEstimate.protein.toFixed(1)}</div>
                    <div className="text-[10px] text-text-muted">Protein</div>
                  </div>
                  <div className="bg-surface-low rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-amber-500">{result.nutritionEstimate.carbs.toFixed(1)}</div>
                    <div className="text-[10px] text-text-muted">Karb</div>
                  </div>
                  <div className="bg-surface-low rounded-lg p-2 text-center">
                    <div className="text-sm font-bold text-rose-500">{result.nutritionEstimate.fat.toFixed(1)}</div>
                    <div className="text-[10px] text-text-muted">Yağ</div>
                  </div>
                </div>
              )}

              {/* Ingredients */}
              <div>
                <h4 className="font-heading font-bold text-sm mb-2">Malzemeler</h4>
                <ul className="space-y-1.5">
                  {result.ingredients.map((ing, i) => (
                    <li key={i} className={clsx('text-sm flex items-start gap-2', ing.changed && 'text-primary font-medium')}>
                      <span className={clsx('w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0', ing.changed ? 'bg-primary' : 'bg-border-light')} />
                      {ing.quantity} {ing.unit} {ing.name}
                      {ing.changed && <span className="text-[10px] bg-primary/10 px-1.5 py-0.5 rounded-full ml-auto">Değişti</span>}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div>
                <h4 className="font-heading font-bold text-sm mb-2">Yapılış</h4>
                <ol className="space-y-2">
                  {result.steps.map((step, i) => (
                    <li key={i} className={clsx('text-sm flex gap-3', step.changed && 'text-primary')}>
                      <span className={clsx('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold', step.changed ? 'bg-primary text-on-primary' : 'bg-surface-low text-text-muted')}>
                        {step.stepNumber}
                      </span>
                      <p className="flex-1 pt-0.5">{step.instruction}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : (
            <>
              {/* Mode grid */}
              <div className="grid grid-cols-1 gap-2">
                {MODES.map(mode => (
                  <button
                    key={mode.type}
                    onClick={() => mode.type === 'custom' ? setSelectedType('custom') : handleSuggest(mode.type)}
                    disabled={loading}
                    className={clsx(
                      'flex items-center gap-3 p-3 rounded-xl text-left transition-all',
                      loading && selectedType === mode.type ? 'bg-primary/10 border border-primary' : 'bg-surface-low hover:bg-surface-high',
                      loading && selectedType !== mode.type && 'opacity-50'
                    )}
                  >
                    <mode.icon className={clsx('w-5 h-5 flex-shrink-0', loading && selectedType === mode.type ? 'text-primary' : 'text-text-muted')} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{mode.label}</div>
                      <div className="text-xs text-text-muted">{mode.desc}</div>
                    </div>
                    {loading && selectedType === mode.type && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
                  </button>
                ))}
              </div>

              {/* Custom prompt input */}
              {selectedType === 'custom' && !loading && (
                <div className="mt-3 space-y-2">
                  <textarea
                    value={customPrompt}
                    onChange={e => setCustomPrompt(e.target.value)}
                    placeholder="Örn: Daha az tuzlu ve baharatlı yap..."
                    className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    rows={3}
                  />
                  <button
                    onClick={() => handleSuggest('custom')}
                    disabled={!customPrompt.trim()}
                    className="w-full py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50"
                  >
                    AI ile Uyarla
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-3 p-3 rounded-xl bg-error/10 text-error text-sm">{error}</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
