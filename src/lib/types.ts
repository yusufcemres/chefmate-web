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
  stepNumber: number;
  instruction: string;
  stepDurationMinutes: number | null;
  tip?: string | null;
  imageUrl?: string | null;
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

// ========== AI SUGGESTION ==========
export type SuggestionType = 'healthier' | 'cuisine' | 'dietary' | 'budget' | 'quick' | 'inventory' | 'custom';

export interface AiSuggestionResult {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string; unit: string; changed: boolean }[];
  steps: { stepNumber: number; instruction: string; changed: boolean }[];
  changesSummary: string;
  nutritionEstimate?: { calories: number; protein: number; carbs: number; fat: number };
}

export interface AiSuggestionLog {
  id: string;
  suggestionType: SuggestionType;
  result: AiSuggestionResult;
  createdAt: string;
}

// ========== MEAL PLAN ==========
export interface MealPlan {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  items: MealPlanItem[];
  createdAt: string;
}

export interface MealPlanItem {
  id: string;
  date: string;
  mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  recipe: Recipe;
  isCooked: boolean;
}

// ========== SHOPPING LIST ==========
export interface ShoppingList {
  id: string;
  name: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  items: ShoppingListItem[];
  createdAt: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  isChecked: boolean;
  category?: string;
}

// ========== PAGINATION ==========
export interface PaginatedResponse<T> {
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
