'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Star, Loader2, Send, ChefHat } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  madeRecipe: boolean;
  user: { displayName: string };
  createdAt: string;
}

export function RecipeReviews({ recipeId }: { recipeId: string }) {
  const { isAuthenticated } = useAuthStore();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Form
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [madeRecipe, setMadeRecipe] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const fetchReviews = useCallback(async (cursorParam?: string) => {
    try {
      const url = cursorParam
        ? `/recipes/${recipeId}/reviews?cursor=${cursorParam}&limit=5`
        : `/recipes/${recipeId}/reviews?limit=5`;
      const data = await api.get<{ items: Review[]; nextCursor: string | null; hasMore: boolean }>(url);
      if (cursorParam) {
        setReviews(prev => [...prev, ...data.items]);
      } else {
        setReviews(data.items || []);
      }
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {}
    setLoading(false);
  }, [recipeId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const submitReview = async () => {
    if (rating === 0) return;
    setSubmitting(true);
    try {
      await api.post(`/recipes/${recipeId}/reviews`, {
        rating,
        comment: comment.trim() || null,
        madeRecipe,
      });
      setSubmitted(true);
      setRating(0);
      setComment('');
      setMadeRecipe(false);
      await fetchReviews();
    } catch {}
    setSubmitting(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

  const StarRow = ({ value, onChange, onHover, size = 'w-6 h-6' }: { value: number; onChange?: (v: number) => void; onHover?: (v: number) => void; size?: string }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => onHover?.(i)}
          onMouseLeave={() => onHover?.(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          type="button"
        >
          <Star className={clsx(size, i <= (hoverRating || value) ? 'text-warning fill-warning' : 'text-border-light')} />
        </button>
      ))}
    </div>
  );

  return (
    <div className="mt-10">
      <h2 className="font-heading text-lg font-bold mb-6">Yorumlar</h2>

      {/* Write review */}
      {isAuthenticated && !submitted ? (
        <div className="bg-card rounded-2xl border border-border-light p-5 mb-6">
          <h3 className="font-heading font-bold text-sm mb-3">Yorum Yaz</h3>
          <div className="mb-3">
            <StarRow value={rating} onChange={setRating} onHover={setHoverRating} />
          </div>
          <textarea
            value={comment} onChange={e => setComment(e.target.value)}
            placeholder="Tarif hakkında ne düşünüyorsunuz?"
            className="w-full p-3 rounded-xl bg-surface-low border border-border-light text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-3"
            rows={3}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={madeRecipe} onChange={e => setMadeRecipe(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
              <span className="flex items-center gap-1 text-text-muted"><ChefHat className="w-3.5 h-3.5" /> Bu tarifi yaptım</span>
            </label>
            <button onClick={submitReview} disabled={rating === 0 || submitting} className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-primary text-on-primary font-bold text-sm disabled:opacity-50">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Gönder
            </button>
          </div>
        </div>
      ) : submitted ? (
        <div className="bg-primary/5 rounded-xl p-4 mb-6 text-sm text-primary font-medium text-center">
          Yorumunuz gönderildi!
        </div>
      ) : (
        <div className="bg-surface-low rounded-xl p-4 mb-6 text-sm text-text-muted text-center">
          Yorum yazmak için <Link href="/giris" className="text-primary font-semibold">giriş yapın</Link>.
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map(review => (
            <div key={review.id} className="bg-card rounded-xl border border-border-light p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                    {review.user.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="text-sm font-semibold">{review.user.displayName}</span>
                    {review.madeRecipe && (
                      <span className="ml-2 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-semibold">Yaptı</span>
                    )}
                  </div>
                </div>
                <span className="text-xs text-text-muted">{formatDate(review.createdAt)}</span>
              </div>
              <div className="flex gap-0.5 mb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={clsx('w-4 h-4', i <= review.rating ? 'text-warning fill-warning' : 'text-border-light')} />
                ))}
              </div>
              {review.comment && <p className="text-sm text-text-secondary">{review.comment}</p>}
            </div>
          ))}
          {hasMore && (
            <button onClick={() => cursor && fetchReviews(cursor)} className="w-full py-3 text-sm font-semibold text-primary hover:bg-primary/5 rounded-xl transition-colors">
              Daha Fazla Yorum
            </button>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-muted text-center py-6">Henüz yorum yok. İlk yorumu siz yazın!</p>
      )}
    </div>
  );
}
