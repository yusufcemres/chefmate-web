'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Recipe } from '@/lib/types';
import { Sparkles, Loader2, ChefHat, Clock, Flame, Package } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import clsx from 'clsx';

interface RecommendedRecipe extends Recipe {
  matchScore?: number;
  missingCount?: number;
  matchedIngredients?: string[];
}

export default function RecommendationsPage() {
  const { isAuthenticated, user, init } = useAuthStore();
  const [recipes, setRecipes] = useState<RecommendedRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [maxMissing, setMaxMissing] = useState(3);

  useEffect(() => { init(); }, [init]);

  const fetchRecommendations = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.post<RecommendedRecipe[]>(`/users/${user.id}/recipe-recommendations`, {
        maxMissing,
        limit: 20,
      });
      setRecipes(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch {}
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-3xl font-extrabold tracking-tight">Sana Özel Öneriler</h1>
          <p className="text-text-muted mt-1">Stoğuna ve tercihlerine göre AI önerileri</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-card rounded-2xl border border-border-light p-5 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-semibold mb-2 block">Maksimum Eksik Malzeme</label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 5].map(n => (
                <button key={n} onClick={() => setMaxMissing(n)} className={clsx('px-4 py-2 rounded-full text-sm font-medium transition-colors', maxMissing === n ? 'bg-primary text-on-primary' : 'bg-surface-low hover:bg-surface-high')}>
                  {n === 0 ? 'Tam eşleşme' : `${n} eksik`}
                </button>
              ))}
            </div>
          </div>
          <button onClick={fetchRecommendations} disabled={loading} className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50 flex-shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Hesaplanıyor...' : 'Önerileri Getir'}
          </button>
        </div>
      </div>

      {/* Results */}
      {fetched && recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map(recipe => (
            <Link key={recipe.id} href={`/tarif/${recipe.slug || recipe.id}`} className="group bg-card rounded-2xl border border-border-light overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5">
              <div className="relative aspect-[4/3]">
                {recipe.imageUrl ? (
                  <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
                ) : (
                  <div className="w-full h-full bg-surface-low flex items-center justify-center">
                    <ChefHat className="w-10 h-10 text-text-muted/20" />
                  </div>
                )}
                {recipe.missingCount != null && (
                  <div className={clsx('absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold', recipe.missingCount === 0 ? 'bg-primary text-on-primary' : 'bg-warning/90 text-white')}>
                    {recipe.missingCount === 0 ? 'Tam Eşleşme' : `${recipe.missingCount} eksik`}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-heading font-bold text-sm line-clamp-2 group-hover:text-primary transition-colors">{recipe.title}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                  {recipe.totalTimeMinutes > 0 && (
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.totalTimeMinutes} dk</span>
                  )}
                  {recipe.totalCalories && (
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {Math.round(recipe.totalCalories)} kcal</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : fetched ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Öneri Bulunamadı</h2>
          <p className="text-text-muted mb-4">Stoğunuza daha fazla ürün ekleyin veya eksik malzeme limitini artırın</p>
          <Link href="/stok" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
            <Package className="w-4 h-4" /> Stok Yönetimi
          </Link>
        </div>
      ) : (
        <div className="text-center py-16">
          <Sparkles className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Stoğunuza Göre Tarifler</h2>
          <p className="text-text-muted">Yukarıdaki "Önerileri Getir" butonuna basarak stoğunuzdaki malzemelere uygun tarifleri keşfedin</p>
        </div>
      )}
    </div>
  );
}
