'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { Recipe } from '@/lib/types';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Heart, ChefHat } from 'lucide-react';
import Link from 'next/link';

export default function FavoritesPage() {
  const { isAuthenticated, init } = useAuthStore();
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { init(); }, [init]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/giris');
      return;
    }
    api.get<{ items: Recipe[] }>('/users/me/favorites?limit=50')
      .then(data => setRecipes(data.items || []))
      .catch(() => setRecipes([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-screen-2xl mx-auto px-8 pt-32 pb-24">
      <div className="mb-12 max-w-3xl">
        <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4 flex items-center gap-2">
          <Heart className="w-3.5 h-3.5 fill-primary-dark" /> Koleksiyonum
        </span>
        <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-4">Favorilerim</h1>
        <p className="text-text-secondary text-lg">Beğendiğin tarifleri burada topla.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-surface-container-low aspect-[4/5]" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-extrabold mb-2">Henüz favori tarifin yok</h2>
          <p className="text-text-muted mb-6">Beğendiğin tarifleri kalp ikonuna tıklayarak favorilere ekle.</p>
          <Link href="/tarif" className="inline-flex px-8 py-4 rounded-xl bg-primary-container text-text font-heading font-extrabold text-sm uppercase tracking-[0.15em]">
            Tariflere Göz At
          </Link>
        </div>
      )}
    </div>
  );
}
