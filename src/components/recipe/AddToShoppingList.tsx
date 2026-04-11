'use client';

import { useState } from 'react';
import { ShoppingCart, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';

export function AddToShoppingList({ recipeId }: { recipeId: string }) {
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (!isAuthenticated) return null;

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post('/shopping-lists/from-recipe', { recipeId });
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch {}
    setLoading(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading || done}
      className="flex items-center justify-center gap-2 w-full mt-2 py-2.5 rounded-full bg-surface-low text-sm font-semibold hover:bg-surface-high transition-colors disabled:opacity-70"
    >
      {loading ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Ekleniyor...</>
      ) : done ? (
        <><Check className="w-4 h-4 text-primary" /> Listeye Eklendi</>
      ) : (
        <><ShoppingCart className="w-4 h-4" /> Alışveriş Listesine Ekle</>
      )}
    </button>
  );
}
