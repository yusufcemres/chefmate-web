'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { MealPlan, MealPlanItem } from '@/lib/types';
import { Calendar, Plus, Sparkles, Trash2, Check, Loader2, ChefHat, ShoppingCart, X } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Kahvaltı',
  LUNCH: 'Öğle',
  DINNER: 'Akşam',
  SNACK: 'Atıştırmalık',
};

const MEAL_ORDER = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

export default function MealPlanPage() {
  const { isAuthenticated, init } = useAuthStore();
  const [plans, setPlans] = useState<MealPlan[]>([]);
  const [activePlan, setActivePlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerator, setShowGenerator] = useState(false);

  // AI Generate form
  const [days, setDays] = useState(7);
  const [dailyCalories, setDailyCalories] = useState(2000);
  const [servings, setServings] = useState(4);
  const [mealTypes, setMealTypes] = useState(['BREAKFAST', 'LUNCH', 'DINNER']);
  const [preferences, setPreferences] = useState('');

  useEffect(() => { init(); }, [init]);

  const fetchPlans = useCallback(async () => {
    try {
      const data = await api.get<MealPlan[]>('/meal-plans');
      const list = Array.isArray(data) ? data : [];
      setPlans(list);
      if (list.length > 0) setActivePlan(list[0]);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchPlans();
    else setLoading(false);
  }, [isAuthenticated, fetchPlans]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const plan = await api.post<MealPlan>('/meal-plans/ai-generate', {
        days,
        servingsPerMeal: servings,
        dailyCalorieTarget: dailyCalories,
        mealTypes,
        preferences: preferences || undefined,
        useInventory: false,
      });
      setShowGenerator(false);
      await fetchPlans();
      setActivePlan(plan);
    } catch (e: any) {
      alert(e.message || 'Plan oluşturulamadı');
    } finally {
      setGenerating(false);
    }
  };

  const toggleCooked = async (planId: string, itemId: string) => {
    try {
      await api.patch(`/meal-plans/${planId}/items/${itemId}/toggle`);
      if (activePlan) {
        setActivePlan({
          ...activePlan,
          items: activePlan.items.map(item =>
            item.id === itemId ? { ...item, isCooked: !item.isCooked } : item
          ),
        });
      }
    } catch {}
  };

  const deletePlan = async (planId: string) => {
    try {
      await api.delete(`/meal-plans/${planId}`);
      setPlans(prev => prev.filter(p => p.id !== planId));
      if (activePlan?.id === planId) setActivePlan(null);
    } catch {}
  };

  const generateShoppingList = async (planId: string) => {
    try {
      await api.post(`/meal-plans/${planId}/shopping-list`);
      alert('Alışveriş listesi oluşturuldu!');
    } catch (e: any) {
      alert(e.message || 'Liste oluşturulamadı');
    }
  };

  const toggleMealType = (type: string) => {
    setMealTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  // Group items by date
  const groupedItems = activePlan?.items?.reduce<Record<string, MealPlanItem[]>>((acc, item) => {
    const date = item.date?.split('T')[0] || 'unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {}) || {};

  const sortedDates = Object.keys(groupedItems).sort();

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Yemek Planı</h1>
          <p className="text-text-muted mt-1">Haftalık menünüzü AI ile planlayın</p>
        </div>
        <button
          onClick={() => setShowGenerator(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm hover:bg-primary-dark transition-all"
        >
          <Sparkles className="w-4 h-4" /> AI ile Planla
        </button>
      </div>

      {/* AI Generator Modal */}
      {showGenerator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-card rounded-2xl border border-border-light p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">AI Yemek Planı</h2>
              <button onClick={() => setShowGenerator(false)} className="p-1 rounded-full hover:bg-surface-low">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-sm font-semibold mb-2 block">Kaç Gün?</label>
                <div className="flex gap-2">
                  {[3, 5, 7, 14].map(d => (
                    <button key={d} onClick={() => setDays(d)} className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-colors', days === d ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
                      {d} gün
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Günlük Kalori Hedefi</label>
                <input
                  type="range" min={1200} max={3500} step={100} value={dailyCalories}
                  onChange={e => setDailyCalories(+e.target.value)}
                  className="w-full accent-primary"
                />
                <div className="text-center text-sm font-bold text-primary mt-1">{dailyCalories} kcal</div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Porsiyon</label>
                <div className="flex gap-2">
                  {[1, 2, 4, 6].map(s => (
                    <button key={s} onClick={() => setServings(s)} className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-colors', servings === s ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
                      {s} kişi
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Öğünler</label>
                <div className="flex flex-wrap gap-2">
                  {MEAL_ORDER.map(type => (
                    <button key={type} onClick={() => toggleMealType(type)} className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-colors', mealTypes.includes(type) ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
                      {MEAL_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block">Tercihler (opsiyonel)</label>
                <textarea
                  value={preferences} onChange={e => setPreferences(e.target.value)}
                  placeholder="Örn: Vejetaryen, az baharatlı, Akdeniz mutfağı..."
                  className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  rows={2}
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating || mealTypes.length === 0}
                className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? <><Loader2 className="w-4 h-4 animate-spin" /> Oluşturuluyor...</> : <><Sparkles className="w-4 h-4" /> Plan Oluştur</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan tabs */}
      {plans.length > 1 && (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {plans.map(plan => (
            <button
              key={plan.id}
              onClick={() => setActivePlan(plan)}
              className={clsx('flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors', activePlan?.id === plan.id ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}
            >
              {plan.name || formatDate(plan.startDate)}
            </button>
          ))}
        </div>
      )}

      {/* Active plan */}
      {activePlan ? (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-lg font-bold">{activePlan.name || 'Yemek Planı'}</h2>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => generateShoppingList(activePlan.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-low text-sm font-medium hover:bg-surface-high transition-colors">
                <ShoppingCart className="w-4 h-4" /> Alışveriş Listesi
              </button>
              <button onClick={() => deletePlan(activePlan.id)} className="p-2 rounded-full hover:bg-error/10 text-text-muted hover:text-error transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="bg-card rounded-2xl border border-border-light overflow-hidden">
                <div className="px-5 py-3 bg-surface-low border-b border-border-light">
                  <h3 className="font-heading font-bold text-sm capitalize">{formatDate(date)}</h3>
                </div>
                <div className="divide-y divide-border-light">
                  {groupedItems[date]
                    .sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType))
                    .map(item => (
                    <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                      <button
                        onClick={() => toggleCooked(activePlan.id, item.id)}
                        className={clsx('flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors', item.isCooked ? 'bg-primary border-primary' : 'border-border-light')}
                      >
                        {item.isCooked && <Check className="w-3 h-3 text-on-primary" />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] uppercase tracking-wider text-text-muted font-bold">{MEAL_LABELS[item.mealType] || item.mealType}</span>
                        <Link href={`/tarif/${item.recipe?.slug || item.recipe?.id}`} className={clsx('block text-sm font-semibold hover:text-primary transition-colors truncate', item.isCooked && 'line-through text-text-muted')}>
                          {item.recipe?.title || 'Tarif'}
                        </Link>
                      </div>
                      {item.recipe?.totalCalories && (
                        <span className="text-xs text-text-muted flex-shrink-0">{Math.round(item.recipe.totalCalories)} kcal</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Henüz Planınız Yok</h2>
          <p className="text-text-muted mb-6">AI ile haftalık yemek planınızı oluşturun</p>
          <button onClick={() => setShowGenerator(true)} className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
            <Sparkles className="w-4 h-4" /> İlk Planımı Oluştur
          </button>
        </div>
      )}
    </div>
  );
}
