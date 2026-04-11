import { fetchApi } from '@/lib/api-client';
import type { Recipe } from '@/lib/types';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Flame, Users, Star, ChefHat, ArrowLeft } from 'lucide-react';
import { CookButton } from '@/components/recipe/CookButton';
import { FavoriteButton } from '@/components/recipe/FavoriteButton';
import { AiSuggestPanel } from '@/components/recipe/AiSuggestPanel';
import { AddToShoppingList } from '@/components/recipe/AddToShoppingList';
import { RecipeReviews } from '@/components/recipe/RecipeReviews';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getRecipe(slug: string): Promise<Recipe> {
  return fetchApi<Recipe>(`/recipes/${slug}`);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const recipe = await getRecipe(slug);
    return {
      title: recipe.title,
      description: recipe.description || `${recipe.title} tarifi - ${recipe.totalTimeMinutes} dakikada hazır.`,
      openGraph: {
        title: recipe.title,
        description: recipe.description,
        images: recipe.imageUrl ? [{ url: recipe.imageUrl, width: 600, height: 400 }] : [],
        type: 'article',
      },
    };
  } catch {
    return { title: 'Tarif Bulunamadı' };
  }
}

export default async function RecipeDetailPage({ params }: Props) {
  const { slug } = await params;
  let recipe: Recipe;
  try {
    recipe = await getRecipe(slug);
  } catch {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center">
        <ChefHat className="w-16 h-16 text-text-muted/30 mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Tarif Bulunamadı</h1>
        <p className="text-text-muted mb-6">Aradığınız tarif mevcut değil veya kaldırılmış olabilir.</p>
        <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-sm">
          <ArrowLeft className="w-4 h-4" /> Ana Sayfa
        </Link>
      </div>
    );
  }

  const diffLabel = { EASY: 'Kolay', MEDIUM: 'Orta', HARD: 'Zor' }[recipe.difficulty] || recipe.difficulty;

  // JSON-LD for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    description: recipe.description,
    image: recipe.imageUrl,
    prepTime: `PT${recipe.prepTimeMinutes}M`,
    cookTime: `PT${recipe.cookTimeMinutes}M`,
    totalTime: `PT${recipe.totalTimeMinutes}M`,
    recipeYield: `${recipe.servingSize} porsiyon`,
    recipeCategory: recipe.tags?.find(t => t.tag?.type === 'MEAL_TYPE')?.tag.name,
    recipeCuisine: recipe.tags?.find(t => t.tag?.type === 'CUISINE')?.tag.name || 'Türk Mutfağı',
    recipeIngredient: recipe.ingredients?.map(i => `${i.quantityDisplay} ${i.displayUnit} ${i.ingredientNameSnapshot}`),
    recipeInstructions: recipe.steps?.map(s => ({ '@type': 'HowToStep', text: s.instruction })),
    ...(recipe.ratingAvg > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: recipe.ratingAvg,
        ratingCount: recipe.ratingCount,
      },
    }),
    ...(recipe.totalCalories && {
      nutrition: {
        '@type': 'NutritionInformation',
        calories: `${Math.round(recipe.totalCalories)} kcal`,
        ...(recipe.totalProtein && { proteinContent: `${recipe.totalProtein.toFixed(1)} g` }),
        ...(recipe.totalCarbs && { carbohydrateContent: `${recipe.totalCarbs.toFixed(1)} g` }),
        ...(recipe.totalFat && { fatContent: `${recipe.totalFat.toFixed(1)} g` }),
      },
    }),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        {/* Back */}
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-text-muted hover:text-primary mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Tariflere Dön
        </Link>

        {/* Hero image */}
        {recipe.imageUrl && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" sizes="(max-width: 896px) 100vw, 896px" priority />
          </div>
        )}

        {/* Title + meta */}
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">{recipe.title}</h1>
        {recipe.description && <p className="text-lg text-text-secondary mb-6 leading-relaxed">{recipe.description}</p>}

        {/* Favorite */}
        <FavoriteButton recipeId={recipe.id} />

        {/* Meta badges */}
        <div className="flex flex-wrap items-center gap-3 mt-4 mb-8">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low text-sm font-medium">
            <Clock className="w-4 h-4 text-primary" /> {recipe.totalTimeMinutes} dk
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low text-sm font-medium">
            <Users className="w-4 h-4 text-primary" /> {recipe.servingSize} kişilik
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low text-sm font-medium">
            <ChefHat className="w-4 h-4 text-primary" /> {diffLabel}
          </span>
          {recipe.totalCalories && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-low text-sm font-medium">
              <Flame className="w-4 h-4 text-primary" /> {Math.round(recipe.totalCalories)} kcal
            </span>
          )}
          {recipe.ratingAvg > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning/10 text-sm font-medium text-warning">
              <Star className="w-4 h-4 fill-current" /> {recipe.ratingAvg.toFixed(1)} ({recipe.ratingCount})
            </span>
          )}
        </div>

        {/* Tags */}
        {recipe.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {recipe.tags.map(t => (
              <Link key={t.id} href={`/etiket/${t.tag.slug}`} className="px-3 py-1 rounded-full bg-primary-container/40 text-xs font-semibold text-on-primary-container hover:bg-primary-container transition-colors">
                {t.tag.emoji} {t.tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 bg-card rounded-2xl border border-border-light p-6">
              <h2 className="font-heading text-lg font-bold mb-4">Malzemeler</h2>
              <ul className="space-y-3">
                {recipe.ingredients?.map((ing) => (
                  <li key={ing.id} className="flex items-start gap-3 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span>
                      <strong className="font-semibold">{ing.quantityDisplay} {ing.displayUnit}</strong>{' '}
                      {ing.ingredientNameSnapshot}
                      {ing.isOptional && <span className="text-text-muted ml-1">(isteğe bağlı)</span>}
                    </span>
                  </li>
                ))}
              </ul>
              <CookButton slug={slug} />
              <AddToShoppingList recipeId={recipe.id} />
            </div>

            {/* Besin Değerleri */}
            {(recipe.totalCalories || recipe.totalProtein || recipe.totalCarbs || recipe.totalFat) && (
              <div className="bg-card rounded-2xl border border-border-light p-6 mt-4">
                <h2 className="font-heading text-lg font-bold mb-4">Besin Değerleri</h2>
                <p className="text-xs text-text-muted mb-4">Porsiyon başına ({recipe.servingSize} kişilik)</p>
                <div className="grid grid-cols-2 gap-3">
                  {recipe.totalCalories != null && (
                    <div className="bg-surface-low rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-primary">{Math.round(recipe.totalCalories)}</div>
                      <div className="text-xs text-text-muted mt-0.5">kcal</div>
                    </div>
                  )}
                  {recipe.totalProtein != null && (
                    <div className="bg-surface-low rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-blue-500">{recipe.totalProtein.toFixed(1)}</div>
                      <div className="text-xs text-text-muted mt-0.5">Protein (g)</div>
                    </div>
                  )}
                  {recipe.totalCarbs != null && (
                    <div className="bg-surface-low rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-amber-500">{recipe.totalCarbs.toFixed(1)}</div>
                      <div className="text-xs text-text-muted mt-0.5">Karbonhidrat (g)</div>
                    </div>
                  )}
                  {recipe.totalFat != null && (
                    <div className="bg-surface-low rounded-xl p-3 text-center">
                      <div className="text-2xl font-bold text-rose-500">{recipe.totalFat.toFixed(1)}</div>
                      <div className="text-xs text-text-muted mt-0.5">Yağ (g)</div>
                    </div>
                  )}
                </div>
                {/* Macro bar */}
                {recipe.totalProtein != null && recipe.totalCarbs != null && recipe.totalFat != null && (() => {
                  const total = recipe.totalProtein! + recipe.totalCarbs! + recipe.totalFat!;
                  if (total === 0) return null;
                  const pPct = (recipe.totalProtein! / total) * 100;
                  const cPct = (recipe.totalCarbs! / total) * 100;
                  const fPct = (recipe.totalFat! / total) * 100;
                  return (
                    <div className="mt-4">
                      <div className="flex h-2.5 rounded-full overflow-hidden">
                        <div className="bg-blue-500" style={{ width: `${pPct}%` }} />
                        <div className="bg-amber-500" style={{ width: `${cPct}%` }} />
                        <div className="bg-rose-500" style={{ width: `${fPct}%` }} />
                      </div>
                      <div className="flex justify-between text-[10px] text-text-muted mt-1">
                        <span>P %{Math.round(pPct)}</span>
                        <span>K %{Math.round(cPct)}</span>
                        <span>Y %{Math.round(fPct)}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* AI Kişiselleştirme */}
            <AiSuggestPanel recipeId={recipe.id} recipeTitle={recipe.title} />
          </div>

          {/* Steps */}
          <div className="lg:col-span-2">
            <h2 className="font-heading text-lg font-bold mb-6">Yapılış</h2>
            <ol className="space-y-6">
              {recipe.steps?.map((step) => (
                <li key={step.id} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold">
                    {step.stepNumber}
                  </span>
                  <div className="flex-1 pt-1">
                    <p className="text-base leading-relaxed">{step.instruction}</p>
                    {step.tip && (
                      <p className="mt-2 text-sm text-text-muted italic bg-surface-low rounded-lg p-3">
                        💡 {step.tip}
                      </p>
                    )}
                    {step.stepDurationMinutes && (
                      <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                        <Clock className="w-3 h-3" /> {step.stepDurationMinutes} dk
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            {/* Tips */}
            {recipe.tips && (
              <div className="mt-8 p-5 rounded-2xl bg-secondary-container/30 border border-secondary/20">
                <h3 className="font-heading font-bold text-sm mb-2">Püf Noktaları</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{recipe.tips}</p>
              </div>
            )}

            {/* Reviews */}
            <RecipeReviews recipeId={recipe.id} />
          </div>
        </div>
      </article>
    </>
  );
}
