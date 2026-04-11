'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import clsx from 'clsx';

export function FavoriteButton({ recipeId }: { recipeId: string }) {
  const { isAuthenticated } = useAuthStore();
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get<{ isFavorite: boolean }>(`/users/me/favorites/${recipeId}/check`)
      .then(data => setIsFav(data.isFavorite))
      .catch(() => {});
  }, [isAuthenticated, recipeId]);

  const toggle = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      if (isFav) {
        await api.delete(`/users/me/favorites/${recipeId}`);
        setIsFav(false);
      } else {
        await api.post(`/users/me/favorites/${recipeId}`);
        setIsFav(true);
      }
    } catch {}
    setLoading(false);
  };

  if (!isAuthenticated) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={clsx(
        'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all',
        isFav
          ? 'bg-primary/10 text-primary'
          : 'bg-surface-low text-text-muted hover:text-primary hover:bg-primary/5'
      )}
    >
      <Heart className={clsx('w-4 h-4', isFav && 'fill-current')} />
      {isFav ? 'Favorilerde' : 'Favorilere Ekle'}
    </button>
  );
}
