import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { ActivityLevel, FoodEntry, FoodEntryDraft, Locale, MealType, ProfileDetails, ProfileState, Theme, WeightEntry } from './types'
import { shiftDate, todayKey } from './utils'

type DiaryState = {
  entries: FoodEntry[]
  dailyGoal: number
}

type PreferencesState = {
  locale: Locale
  theme: Theme
}

type PersistedState = {
  diary: DiaryState
  preferences: PreferencesState
  profile?: ProfileState
}

const STORAGE_KEY = 'fuelly-state-v1'

const seedEntries = (): FoodEntry[] => {
  const today = todayKey()
  const items: Array<[number, MealType, string, string, number, number, number, number]> = [
    [0, 'breakfast', 'Greek yogurt bowl', '1 bowl', 340, 24, 42, 8],
    [0, 'lunch', 'Grilled chicken salad', '1 plate', 510, 47, 38, 18],
    [0, 'snacks', 'Almonds & apple', '1 serving', 240, 7, 30, 12],
    [-1, 'breakfast', 'Eggs on sourdough', '2 slices', 430, 25, 39, 19],
    [-1, 'lunch', 'Salmon rice bowl', '1 bowl', 690, 42, 71, 25],
    [-1, 'dinner', 'Lentil soup', '2 cups', 460, 28, 74, 8],
    [-2, 'breakfast', 'Protein oats', '1 bowl', 410, 28, 55, 10],
    [-2, 'lunch', 'Turkey wrap', '1 wrap', 520, 39, 48, 19],
    [-2, 'dinner', 'Beef stir-fry', '1 plate', 660, 45, 62, 24],
    [-3, 'breakfast', 'Avocado toast', '2 slices', 390, 13, 45, 19],
    [-3, 'dinner', 'Chicken pasta', '1 plate', 780, 52, 88, 24],
    [-3, 'snacks', 'Berry smoothie', '350 ml', 280, 20, 45, 4],
    [-5, 'lunch', 'Falafel bowl', '1 bowl', 610, 24, 76, 25],
    [-5, 'dinner', 'Herb omelette', '3 eggs', 480, 31, 18, 31],
    [-6, 'breakfast', 'Banana pancakes', '3 pancakes', 450, 18, 70, 12],
    [-6, 'lunch', 'Tuna sandwich', '1 sandwich', 540, 41, 52, 18],
  ]

  return items.map(([offset, meal, name, serving, calories, protein, carbs, fat], index) => ({
    id: `demo-${index}`,
    date: shiftDate(today, offset), meal, name, serving, calories, protein, carbs, fat,
  }))
}

const loadState = (): PersistedState | undefined => {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value ? JSON.parse(value) as PersistedState : undefined
  } catch {
    return undefined
  }
}

const persisted = loadState()

const emptyProfile: ProfileState = {
  age: null,
  heightCm: null,
  sex: null,
  activityLevel: null,
  goalWeightKg: null,
  weights: [],
}

const diarySlice = createSlice({
  name: 'diary',
  initialState: persisted?.diary ?? { entries: seedEntries(), dailyGoal: 2200 },
  reducers: {
    addEntry: (state, action: PayloadAction<{ date: string; meal: MealType; draft: FoodEntryDraft }>) => {
      state.entries.push({ id: crypto.randomUUID(), ...action.payload.draft, date: action.payload.date, meal: action.payload.meal })
    },
    updateEntry: (state, action: PayloadAction<{ id: string; draft: FoodEntryDraft }>) => {
      const entry = state.entries.find((item) => item.id === action.payload.id)
      if (entry) Object.assign(entry, action.payload.draft)
    },
    removeEntry: (state, action: PayloadAction<string>) => {
      state.entries = state.entries.filter((item) => item.id !== action.payload)
    },
    setDailyGoal: (state, action: PayloadAction<number>) => {
      state.dailyGoal = Math.max(500, Math.min(10000, action.payload))
    },
  },
})

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: {
    locale: persisted?.preferences.locale ?? 'en',
    theme: persisted?.preferences.theme ?? 'dark',
  } as PreferencesState,
  reducers: {
    setLocale: (state, action: PayloadAction<Locale>) => {
      state.locale = action.payload
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload
    },
  },
})

const profileSlice = createSlice({
  name: 'profile',
  initialState: { ...emptyProfile, ...persisted?.profile, weights: persisted?.profile?.weights ?? [] },
  reducers: {
    updateProfile: (state, action: PayloadAction<ProfileDetails>) => {
      Object.assign(state, action.payload)
    },
    addWeight: (state, action: PayloadAction<{ date: string; weightKg: number }>) => {
      const existing = state.weights.find((entry) => entry.date === action.payload.date)
      if (existing) existing.weightKg = action.payload.weightKg
      else state.weights.push({ id: crypto.randomUUID(), ...action.payload })
    },
    updateWeight: (state, action: PayloadAction<WeightEntry>) => {
      const entry = state.weights.find((item) => item.id === action.payload.id)
      if (entry) Object.assign(entry, action.payload)
    },
    removeWeight: (state, action: PayloadAction<string>) => {
      state.weights = state.weights.filter((entry) => entry.id !== action.payload)
    },
  },
})

export const store = configureStore({
  reducer: { diary: diarySlice.reducer, preferences: preferencesSlice.reducer, profile: profileSlice.reducer },
})

store.subscribe(() => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.getState()))
  } catch {
    // The app remains usable when storage is disabled or full.
  }
})

export const { addEntry, updateEntry, removeEntry, setDailyGoal } = diarySlice.actions
export const { setLocale, setTheme } = preferencesSlice.actions
export const { updateProfile, addWeight, updateWeight, removeWeight } = profileSlice.actions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  veryActive: 1.9,
}

export const selectCurrentWeight = (state: RootState) =>
  [...state.profile.weights].sort((a, b) => b.date.localeCompare(a.date))[0]?.weightKg ?? null

export const selectBmr = (state: RootState) => {
  const { age, heightCm, sex } = state.profile
  const weight = selectCurrentWeight(state)
  if (!age || !heightCm || !sex || !weight) return null
  return Math.round(10 * weight + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161))
}

export const selectCalculatedCalories = (state: RootState) => {
  const bmr = selectBmr(state)
  const activity = state.profile.activityLevel
  if (!bmr || !activity) return null
  return Math.round((bmr * activityMultipliers[activity]) / 10) * 10
}

export const selectDailyCalories = (state: RootState) => selectCalculatedCalories(state) ?? state.diary.dailyGoal

export const selectProfileComplete = (state: RootState) => selectCalculatedCalories(state) !== null && state.profile.goalWeightKg !== null
