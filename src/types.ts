export type Locale = 'en' | 'fa'

export type Theme = 'light' | 'dark'

export type Sex = 'male' | 'female'

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'veryActive'

export type WeightEntry = {
  id: string
  date: string
  weightKg: number
}

export type ProfileDetails = {
  age: number | null
  heightCm: number | null
  sex: Sex | null
  activityLevel: ActivityLevel | null
  goalWeightKg: number | null
}

export type ProfileState = ProfileDetails & {
  weights: WeightEntry[]
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks'

export type LocalizedText = {
  en: string
  fa: string
}

export type ServingOption = {
  id: string
  label: LocalizedText
  detail: LocalizedText
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type FoodCatalogItem = {
  id: string
  name: LocalizedText
  category: LocalizedText
  servings: ServingOption[]
}

export type FoodEntry = {
  id: string
  date: string
  meal: MealType
  name: string
  nameFa?: string
  serving: string
  servingFa?: string
  foodId?: string
  servingId?: string
  quantity?: number
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type NutritionTotals = {
  calories: number
  protein: number
  carbs: number
  fat: number
}

export type FoodEntryDraft = Omit<FoodEntry, 'id' | 'date' | 'meal'>
