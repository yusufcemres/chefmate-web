'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Loader2, Save, AlertTriangle, Leaf, ChefHat } from 'lucide-react';
import clsx from 'clsx';

const ALLERGENS = [
  'Gluten', 'Süt Ürünleri', 'Yumurta', 'Balık', 'Kabuklu Deniz Ürünleri',
  'Yer Fıstığı', 'Soya', 'Kereviz', 'Hardal', 'Susam',
];

const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: 'Vejetaryen' },
  { key: 'vegan', label: 'Vegan' },
  { key: 'glutenFree', label: 'Glutensiz' },
  { key: 'dairyFree', label: 'Laktozsuz' },
  { key: 'lowCarb', label: 'Düşük Karbonhidrat' },
];

const CUISINES = [
  'Türk', 'İtalyan', 'Asya', 'Meksika', 'Akdeniz',
  'Hint', 'Japon', 'Fransız', 'Ortadoğu', 'Amerikan', 'Çin', 'Kore',
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta' },
  { value: 'ADVANCED', label: 'İleri' },
];

interface Preferences {
  allergens: string[];
  dietaryProfile: Record<string, boolean>;
  cuisinePreferences: string[];
  cookingSkillLevel: string;
  servingSize: number;
}

export function UserPreferences() {
  const { user } = useAuthStore();
  const [prefs, setPrefs] = useState<Preferences>({
    allergens: [],
    dietaryProfile: {},
    cuisinePreferences: [],
    cookingSkillLevel: 'INTERMEDIATE',
    servingSize: 4,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get<any>('/auth/me')
      .then(data => {
        if (data.preferences) {
          setPrefs({
            allergens: data.preferences.allergens || [],
            dietaryProfile: data.preferences.dietaryProfile || {},
            cuisinePreferences: data.preferences.cuisinePreferences || [],
            cookingSkillLevel: data.preferences.cookingSkillLevel || 'INTERMEDIATE',
            servingSize: data.preferences.servingSize || 4,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleAllergen = (a: string) => {
    setPrefs(p => ({
      ...p,
      allergens: p.allergens.includes(a) ? p.allergens.filter(x => x !== a) : [...p.allergens, a],
    }));
  };

  const toggleDietary = (key: string) => {
    setPrefs(p => ({
      ...p,
      dietaryProfile: { ...p.dietaryProfile, [key]: !p.dietaryProfile[key] },
    }));
  };

  const toggleCuisine = (c: string) => {
    setPrefs(p => ({
      ...p,
      cuisinePreferences: p.cuisinePreferences.includes(c) ? p.cuisinePreferences.filter(x => x !== c) : [...p.cuisinePreferences, c],
    }));
  };

  const savePrefs = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await api.put(`/users/${user.id}/preferences`, prefs);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse h-60 rounded-2xl bg-surface-low" />;

  return (
    <div className="bg-card rounded-2xl border border-border-light p-6 space-y-6">
      <h2 className="font-heading font-bold text-lg">Tercihlerim</h2>

      {/* Allergens */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
          <AlertTriangle className="w-4 h-4 text-warning" /> Alerjenler
        </h3>
        <div className="flex flex-wrap gap-2">
          {ALLERGENS.map(a => (
            <button key={a} onClick={() => toggleAllergen(a)} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', prefs.allergens.includes(a) ? 'bg-error/10 text-error border border-error/30' : 'bg-surface-low hover:bg-surface-high')}>
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Dietary */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
          <Leaf className="w-4 h-4 text-primary" /> Diyet Profili
        </h3>
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map(d => (
            <button key={d.key} onClick={() => toggleDietary(d.key)} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', prefs.dietaryProfile[d.key] ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuisines */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Favori Mutfaklar</h3>
        <div className="flex flex-wrap gap-2">
          {CUISINES.map(c => (
            <button key={c} onClick={() => toggleCuisine(c)} className={clsx('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', prefs.cuisinePreferences.includes(c) ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Skill level */}
      <div>
        <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
          <ChefHat className="w-4 h-4 text-primary" /> Yemek Yapma Seviyem
        </h3>
        <div className="flex gap-2">
          {SKILL_LEVELS.map(s => (
            <button key={s.value} onClick={() => setPrefs(p => ({ ...p, cookingSkillLevel: s.value }))} className={clsx('flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors', prefs.cookingSkillLevel === s.value ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Serving size */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Varsayılan Porsiyon</h3>
        <div className="flex gap-2">
          {[1, 2, 4, 6, 8].map(s => (
            <button key={s} onClick={() => setPrefs(p => ({ ...p, servingSize: s }))} className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-colors', prefs.servingSize === s ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
              {s} kişi
            </button>
          ))}
        </div>
      </div>

      <button onClick={savePrefs} disabled={saving} className="w-full py-3 rounded-full bg-primary text-on-primary font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? '✓ Kaydedildi' : <><Save className="w-4 h-4" /> Kaydet</>}
      </button>
    </div>
  );
}
