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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-7 h-7 text-primary fill-primary" />
        <h1 className="font-heading text-3xl font-extrabold">Favorilerim</h1>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl bg-surface-low aspect-[4/3]" />
          ))}
        </div>
      ) : recipes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
          <h2 className="font-heading text-xl font-bold mb-2">Henüz favori tarifin yok</h2>
          <p className="text-text-muted mb-6">Beğendiğin tarifleri kalp ikonuna tıklayarak favorilere ekle.</p>
          <Link href="/tarif" className="inline-flex px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
            Tariflere Göz At
          </Link>
        </div>
      )}
    </div>
  );
}
