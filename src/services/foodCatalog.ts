import { foods } from '../data/foods'
import type { FoodCatalogItem } from '../types'

export const foodCatalog = {
  list(): FoodCatalogItem[] {
    return foods
  },
  get(foodId: string): FoodCatalogItem | undefined {
    return foods.find((food) => food.id === foodId)
  },
  search(query: string): FoodCatalogItem[] {
    const normalized = query.trim().toLocaleLowerCase()
    if (!normalized) return foods
    return foods.filter((food) => `${food.name.en} ${food.name.fa} ${food.category.en} ${food.category.fa}`.toLocaleLowerCase().includes(normalized))
  },
}
