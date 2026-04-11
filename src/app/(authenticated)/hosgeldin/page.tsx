'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { ChefHat, ArrowRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';

const CUISINES = [
  'Türk', 'İtalyan', 'Asya', 'Meksika', 'Akdeniz',
  'Hint', 'Japon', 'Fransız', 'Ortadoğu', 'Kore',
];

const DIETARY_OPTIONS = [
  { key: 'vegetarian', label: 'Vejetaryen', emoji: '🥬' },
  { key: 'vegan', label: 'Vegan', emoji: '🌱' },
  { key: 'glutenFree', label: 'Glutensiz', emoji: '🌾' },
  { key: 'dairyFree', label: 'Laktozsuz', emoji: '🥛' },
  { key: 'lowCarb', label: 'Düşük Karb', emoji: '🥩' },
];

const ALLERGENS = [
  'Gluten', 'Süt Ürünleri', 'Yumurta', 'Balık', 'Kabuklu Deniz Ürünleri',
  'Yer Fıstığı', 'Soya', 'Susam',
];

const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Yeni Başlıyorum', emoji: '🌱' },
  { value: 'INTERMEDIATE', label: 'Orta Seviye', emoji: '👨‍🍳' },
  { value: 'ADVANCED', label: 'İleri Seviye', emoji: '⭐' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { init } = useAuthStore();
  const [step, setStep] = useState(0);
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [dietary, setDietary] = useState<Record<string, boolean>>({});
  const [allergens, setAllergens] = useState<string[]>([]);
  const [skill, setSkill] = useState('INTERMEDIATE');
  const [saving, setSaving] = useState(false);

  const toggleCuisine = (c: string) => setCuisines(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);
  const toggleDietary = (key: string) => setDietary(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleAllergen = (a: string) => setAllergens(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);

  const handleFinish = async () => {
    setSaving(true);
    try {
      await api.patch('/users/me/preferences', {
        cuisinePreferences: cuisines,
        dietaryProfile: dietary,
        allergens,
        cookingSkillLevel: skill,
        servingSize: 4,
      });
    } catch {}
    setSaving(false);
    router.push('/');
  };

  const steps = [
    // Step 0: Cuisines
    <div key="cuisines" className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-extrabold">Hangi mutfakları seviyorsun?</h2>
        <p className="text-text-muted mt-2">Sana özel tarifler önerelim</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {CUISINES.map(c => (
          <button key={c} onClick={() => toggleCuisine(c)} className={clsx('px-5 py-2.5 rounded-full text-sm font-semibold transition-all', cuisines.includes(c) ? 'bg-primary text-on-primary scale-105' : 'bg-surface-low hover:bg-surface-high')}>
            {c}
          </button>
        ))}
      </div>
    </div>,

    // Step 1: Dietary + Allergens
    <div key="dietary" className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-extrabold">Diyet tercihin var mı?</h2>
        <p className="text-text-muted mt-2">Uygun olmayan tarifleri filtreleyelim</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {DIETARY_OPTIONS.map(d => (
          <button key={d.key} onClick={() => toggleDietary(d.key)} className={clsx('px-5 py-2.5 rounded-full text-sm font-semibold transition-all', dietary[d.key] ? 'bg-primary text-on-primary scale-105' : 'bg-surface-low hover:bg-surface-high')}>
            {d.emoji} {d.label}
          </button>
        ))}
      </div>
      <div>
        <h3 className="font-heading font-bold text-sm text-center mb-3">Alerjin var mı?</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {ALLERGENS.map(a => (
            <button key={a} onClick={() => toggleAllergen(a)} className={clsx('px-4 py-2 rounded-full text-xs font-medium transition-all', allergens.includes(a) ? 'bg-error/10 text-error border border-error/30' : 'bg-surface-low hover:bg-surface-high')}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>,

    // Step 2: Skill
    <div key="skill" className="space-y-6">
      <div className="text-center">
        <h2 className="font-heading text-2xl font-extrabold">Yemek yapma seviyen?</h2>
        <p className="text-text-muted mt-2">Zorluk seviyeni ayarlayalım</p>
      </div>
      <div className="flex flex-col gap-3 max-w-xs mx-auto">
        {SKILL_LEVELS.map(s => (
          <button key={s.value} onClick={() => setSkill(s.value)} className={clsx('flex items-center gap-3 p-4 rounded-2xl text-left transition-all', skill === s.value ? 'bg-primary text-on-primary scale-[1.02]' : 'bg-surface-low hover:bg-surface-high')}>
            <span className="text-2xl">{s.emoji}</span>
            <span className="font-semibold">{s.label}</span>
          </button>
        ))}
      </div>
    </div>,
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        <ChefHat className="w-8 h-8 text-primary" />
        <span className="font-heading font-extrabold text-primary text-lg">ChefMate</span>
      </div>
      <div className="flex gap-2 mb-10">
        {steps.map((_, i) => (
          <div key={i} className={clsx('w-16 h-1.5 rounded-full transition-colors', i <= step ? 'bg-primary' : 'bg-border-light')} />
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-lg">{steps[step]}</div>

      {/* Navigation */}
      <div className="flex items-center gap-4 mt-10">
        {step < steps.length - 1 ? (
          <>
            <button onClick={() => { handleFinish(); }} className="text-sm text-text-muted hover:text-primary transition-colors">
              Atla
            </button>
            <button onClick={() => setStep(s => s + 1)} className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-bold text-sm">
              Devam <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button onClick={handleFinish} disabled={saving} className="flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50">
            {saving ? 'Kaydediliyor...' : <><Sparkles className="w-4 h-4" /> Başlayalım</>}
          </button>
        )}
      </div>
    </div>
  );
}
