// ========== AUTH ==========
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'USER' | 'EDITOR' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ========== RECIPES ==========
export interface Recipe {
  id: string;
  title: string;
  slug?: string;
  description: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  servingSize: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isVerified: boolean;
  ratingAvg: number;
  ratingCount: number;
  imageUrl: string | null;
  totalCalories?: number | null;
  totalProtein?: number | null;
  totalCarbs?: number | null;
  totalFat?: number | null;
  viewCount?: number;
  tips?: string | null;
  ingredients: RecipeIngredient[];
  steps?: RecipeStep[];
  tags: RecipeTag[];
  _count?: { steps: number };
}

export interface RecipeIngredient {
  id: string;
  ingredientNameSnapshot: string;
  quantityDisplay: number;
  displayUnit: string;
  role: string;
  isOptional: boolean;
}

export interface RecipeStep {
  id: string;
  stepOrder: number;
  instruction: string;
  durationMinutes: number | null;
  tip: string | null;
}

export interface RecipeTag {
  id: string;
  recipeId: string;
  tagId: string;
  tag: Tag;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type?: string;
  emoji?: string;
}

// ========== COOKING MODE ==========
export interface CookingMode {
  recipe: Recipe;
  totalSteps: number;
  totalDurationMinutes: number;
  steps: CookingStep[];
}

export interface CookingStep {
  stepOrder: number;
  instruction: string;
  durationMinutes: number | null;
  tip: string | null;
  ingredientsUsed: string[];
  progressPercent: number;
}

// ========== COLLECTIONS ==========
export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  curated: boolean;
  recipes: Recipe[];
}

// ========== PAGINATION ==========
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
