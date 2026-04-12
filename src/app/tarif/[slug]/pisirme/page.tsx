'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import type { Recipe } from '@/lib/types';
import { ArrowLeft, ArrowRight, Clock, Check, X, ChefHat, Play, Pause, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

export default function CookingModePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  const [timer, setTimer] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.init();
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://chefmate-api-production.up.railway.app/api/v1'}/recipes/${params.slug}`)
      .then(r => r.json())
      .then(json => {
        const data = json.data !== undefined ? json.data : json;
        setRecipe(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.slug]);

  // Timer
  useEffect(() => {
    if (!timerRunning || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          setTimerRunning(false);
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('ChefMate', { body: 'Süre doldu! ⏰' });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerRunning, timer]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setCurrentStep(prev => Math.min(prev + 1, (recipe?.steps?.length || 1) - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentStep(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        router.back();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recipe, router]);

  const toggleIngredient = useCallback((id: string) => {
    setCheckedIngredients(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const startStepTimer = useCallback((minutes: number) => {
    setTimer(minutes * 60);
    setTimerRunning(true);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <ChefHat className="w-12 h-12 text-primary mx-auto mb-3" />
          <p className="text-text-muted">Tarif yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl mb-2">😔</p>
          <p className="text-text-muted">Tarif bulunamadı</p>
          <button onClick={() => router.back()} className="mt-4 px-4 py-2 rounded-full bg-primary text-on-primary text-sm font-bold">
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  const steps = recipe.steps || [];
  const step = steps[currentStep];
  const progress = steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="fixed top-0 w-full z-50 glass border-b border-border-light/40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-[0.15em] text-text-muted hover:text-primary-dark">
            <X className="w-4 h-4" /> Çık
          </button>
          <span className="font-heading font-extrabold text-primary-dark text-sm tracking-[0.2em] uppercase truncate">
            ChefMate
          </span>
          <span className="text-xs font-heading font-bold tracking-[0.15em] uppercase text-text-secondary">
            Adım {String(currentStep + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}
          </span>
        </div>
        <div className="h-1 bg-surface-container-low">
          <div className="h-full bg-primary-container transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex-1 pt-16 pb-24 max-w-3xl mx-auto w-full px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Ingredients checklist */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-card rounded-2xl border border-border-light p-5">
              <h2 className="font-heading font-bold text-sm mb-4">
                Malzemeler ({checkedIngredients.size}/{recipe.ingredients?.length || 0})
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients?.map((ing) => (
                  <li key={ing.id}>
                    <button
                      onClick={() => toggleIngredient(ing.id)}
                      className={clsx(
                        'w-full flex items-start gap-2.5 text-left text-sm py-1.5 transition-colors',
                        checkedIngredients.has(ing.id) ? 'text-text-muted line-through' : 'text-text'
                      )}
                    >
                      <span className={clsx(
                        'flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center mt-0.5 transition-colors',
                        checkedIngredients.has(ing.id) ? 'bg-primary border-primary' : 'border-border-light'
                      )}>
                        {checkedIngredients.has(ing.id) && <Check className="w-3 h-3 text-on-primary" />}
                      </span>
                      <span>
                        <strong className="font-semibold">{ing.quantityDisplay} {ing.displayUnit}</strong>{' '}
                        {ing.ingredientNameSnapshot}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Current step */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {step && (
              <div className="bg-surface-container-low rounded-3xl p-10 min-h-[360px] flex flex-col editorial-shadow">
                <div className="flex items-baseline gap-6 mb-8">
                  <span className="font-heading text-7xl font-extrabold tracking-tighter text-primary-dark opacity-25 leading-none">
                    {String(step.stepNumber).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-primary-dark">Şimdi</span>
                </div>

                <p className="text-2xl leading-relaxed flex-1 text-text font-heading">{step.instruction}</p>

                {step.tip && (
                  <p className="mt-4 text-sm text-text-muted italic bg-surface-low rounded-lg p-3">
                    💡 {step.tip}
                  </p>
                )}

                {/* Step timer */}
                {step.stepDurationMinutes && (
                  <div className="mt-6 p-4 rounded-xl bg-surface-low">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">
                          {timerRunning ? formatTime(timer) : `${step.stepDurationMinutes} dakika`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {!timerRunning && timer === 0 && (
                          <button
                            onClick={() => startStepTimer(step.stepDurationMinutes!)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold"
                          >
                            <Play className="w-3 h-3" /> Başlat
                          </button>
                        )}
                        {timerRunning && (
                          <button
                            onClick={() => setTimerRunning(false)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-warning/20 text-warning text-xs font-bold"
                          >
                            <Pause className="w-3 h-3" /> Duraklat
                          </button>
                        )}
                        {!timerRunning && timer > 0 && (
                          <>
                            <button
                              onClick={() => setTimerRunning(true)}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary text-on-primary text-xs font-bold"
                            >
                              <Play className="w-3 h-3" /> Devam
                            </button>
                            <button
                              onClick={() => { setTimer(0); setTimerRunning(false); }}
                              className="p-1.5 rounded-full bg-surface-high text-text-muted"
                            >
                              <RotateCcw className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {(timerRunning || timer > 0) && (
                      <div className="mt-2 h-1.5 bg-border-light rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-1000"
                          style={{ width: `${step.stepDurationMinutes ? ((step.stepDurationMinutes * 60 - timer) / (step.stepDurationMinutes * 60)) * 100 : 0}%` }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step dots */}
            <div className="flex justify-center gap-1.5 mt-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={clsx(
                    'w-2.5 h-2.5 rounded-full transition-all',
                    i === currentStep ? 'bg-primary scale-125' : i < currentStep ? 'bg-primary/40' : 'bg-border-light'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="fixed bottom-0 w-full bg-card border-t border-border-light z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setCurrentStep(prev => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-full text-sm font-semibold disabled:opacity-30 hover:bg-surface-low transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Önceki
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={() => router.push(`/tarif/${params.slug}`)}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-text text-xs font-heading font-extrabold uppercase tracking-[0.15em]"
            >
              <Check className="w-4 h-4" /> Tamamla
            </button>
          ) : (
            <button
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
              className="flex items-center gap-2 px-8 py-4 rounded-xl bg-primary-container text-text text-xs font-heading font-extrabold uppercase tracking-[0.15em]"
            >
              Devam Et <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
