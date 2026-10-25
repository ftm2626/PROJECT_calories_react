import type { FoodEntry, Locale, NutritionTotals } from './types'

export const todayKey = () => toDateKey(new Date())

export const toDateKey = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const fromDateKey = (key: string) => {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export const shiftDate = (key: string, amount: number) => {
  const date = fromDateKey(key)
  date.setDate(date.getDate() + amount)
  return toDateKey(date)
}

export const formatDate = (key: string, locale: Locale, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(locale === 'fa' ? 'fa-IR' : 'en-US', options ?? {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(fromDateKey(key))

export const formatNumber = (value: number, locale: Locale, maximumFractionDigits = 0) =>
  new Intl.NumberFormat(locale === 'fa' ? 'fa-IR' : 'en-US', { maximumFractionDigits }).format(value)

export const sumNutrition = (entries: FoodEntry[]): NutritionTotals =>
  entries.reduce(
    (total, entry) => ({
      calories: total.calories + entry.calories,
      protein: total.protein + entry.protein,
      carbs: total.carbs + entry.carbs,
      fat: total.fat + entry.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  )

export const entryName = (entry: FoodEntry, locale: Locale) => locale === 'fa' && entry.nameFa ? entry.nameFa : entry.name

export const entryServing = (entry: FoodEntry, locale: Locale) => locale === 'fa' && entry.servingFa ? entry.servingFa : entry.serving
