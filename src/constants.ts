import type { MealType } from './types'

export const mealColors: Record<MealType, string> = {
  breakfast: 'var(--meal-breakfast)',
  lunch: 'var(--meal-lunch)',
  dinner: 'var(--meal-dinner)',
  snacks: 'var(--meal-snacks)',
}
