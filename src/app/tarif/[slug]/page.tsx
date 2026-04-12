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
import { IngredientSubstitutions } from '@/components/recipe/IngredientSubstitutions';

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

      <article className="max-w-screen-2xl mx-auto px-8 pt-28 pb-24">
        {/* Back */}
        <Link href="/tarif" className="inline-flex items-center gap-2 text-xs font-heading font-bold uppercase tracking-[0.15em] text-text-muted hover:text-primary-dark mb-10 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Keşfete Dön
        </Link>

        {/* Hero image */}
        {recipe.imageUrl && (
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden mb-12 editorial-shadow">
            <Image src={recipe.imageUrl} alt={recipe.title} fill className="object-cover" sizes="100vw" priority />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-12 max-w-4xl">
              {recipe.tags?.find(t => t.tag?.type === 'CUISINE') && (
                <span className="inline-block text-xs font-heading font-bold uppercase tracking-[0.2em] text-primary-dark mb-4">
                  {recipe.tags.find(t => t.tag?.type === 'CUISINE')?.tag.name}
                </span>
              )}
              <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] text-text">
                {recipe.title}
              </h1>
            </div>
          </div>
        )}

        {!recipe.imageUrl && (
          <h1 className="font-heading text-5xl lg:text-6xl font-extrabold tracking-tighter leading-[1.05] mb-6">{recipe.title}</h1>
        )}
        {recipe.description && <p className="text-xl text-text-secondary max-w-3xl mb-8 leading-relaxed italic">{recipe.description}</p>}

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
                  <li key={ing.id} className="flex items-start gap-3 text-sm flex-wrap">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="flex-1">
                      <strong className="font-semibold">{ing.quantityDisplay} {ing.displayUnit}</strong>{' '}
                      {ing.ingredientNameSnapshot}
                      {ing.isOptional && <span className="text-text-muted ml-1">(isteğe bağlı)</span>}
                    </span>
                    <IngredientSubstitutions ingredientName={ing.ingredientNameSnapshot} />
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
            <h2 className="font-heading text-3xl font-extrabold tracking-tighter mb-10">Yapılış</h2>
            <ol className="space-y-10">
              {recipe.steps?.map((step) => (
                <li key={step.id} className="flex gap-8 pb-10 border-b border-border-light/30 last:border-0">
                  <span className="flex-shrink-0 font-heading text-6xl font-extrabold tracking-tighter text-primary-dark opacity-25 leading-none w-20">
                    {String(step.stepNumber).padStart(2, '0')}
                  </span>
                  <div className="flex-1 pt-2">
                    <p className="text-lg leading-relaxed text-text">{step.instruction}</p>
                    {step.tip && (
                      <p className="mt-4 text-sm text-text-secondary italic bg-surface-container-low rounded-xl p-4 border-l-2 border-primary-dark">
                        {step.tip}
                      </p>
                    )}
                    {step.stepDurationMinutes && (
                      <span className="inline-flex items-center gap-1.5 mt-3 text-xs font-heading font-bold uppercase tracking-[0.15em] text-primary-dark">
                        <Clock className="w-3.5 h-3.5" /> {step.stepDurationMinutes} dk
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
