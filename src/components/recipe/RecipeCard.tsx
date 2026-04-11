import Link from 'next/link';
import Image from 'next/image';
import { Clock, Flame, Star, ChefHat } from 'lucide-react';
import type { Recipe } from '@/lib/types';
import clsx from 'clsx';

const difficultyMap: Record<string, { label: string; color: string }> = {
  EASY: { label: 'Kolay', color: 'bg-success/15 text-success' },
  MEDIUM: { label: 'Orta', color: 'bg-warning/15 text-warning' },
  HARD: { label: 'Zor', color: 'bg-error/15 text-error' },
};

export function RecipeCard({ recipe }: { recipe: Recipe }) {
  const diff = difficultyMap[recipe.difficulty] || difficultyMap.EASY;
  const slug = recipe.slug || recipe.id;
  const cuisineTag = recipe.tags?.find(t => t.tag?.type === 'CUISINE');

  return (
    <Link href={`/tarif/${slug}`} className="group block hover-lift rounded-2xl overflow-hidden bg-card border border-border-light/50 shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-low">
        {recipe.imageUrl ? (
          <Image
            src={recipe.imageUrl}
            alt={recipe.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-text-muted/30" />
          </div>
        )}
        {/* Cuisine badge */}
        {cuisineTag && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-xs font-semibold">
            {cuisineTag.tag.emoji} {cuisineTag.tag.name}
          </span>
        )}
        {/* Difficulty badge */}
        <span className={clsx('absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold', diff.color)}>
          {diff.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-heading font-bold text-base leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
          {recipe.title}
        </h3>

        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {recipe.totalTimeMinutes} dk
          </span>
          {recipe.totalCalories && (
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" />
              {Math.round(recipe.totalCalories)} kcal
            </span>
          )}
          {recipe.ratingAvg > 0 && (
            <span className="flex items-center gap-1 text-warning">
              <Star className="w-3.5 h-3.5 fill-current" />
              {recipe.ratingAvg.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
