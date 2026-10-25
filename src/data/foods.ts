import type { FoodCatalogItem, LocalizedText, ServingOption } from '../types'

const text = (en: string, fa: string): LocalizedText => ({ en, fa })
const serving = (id: string, en: string, fa: string, detailEn: string, detailFa: string, calories: number, protein: number, carbs: number, fat: number): ServingOption => ({
  id,
  label: text(en, fa),
  detail: text(detailEn, detailFa),
  calories,
  protein,
  carbs,
  fat,
})

export const foods: FoodCatalogItem[] = [
  {
    id: 'chicken-breast', name: text('Chicken breast', 'سینه مرغ'), category: text('Protein', 'پروتئین'),
    servings: [serving('100g', '100 grams', '۱۰۰ گرم', 'grilled', 'گریل‌شده', 165, 31, 0, 3.6), serving('piece', '1 piece', '۱ تکه', 'about 170 g', 'حدود ۱۷۰ گرم', 281, 52.7, 0, 6.1), serving('cup', '1 cup', '۱ پیمانه', 'chopped, 140 g', 'خردشده، ۱۴۰ گرم', 231, 43.4, 0, 5)],
  },
  {
    id: 'cooked-rice', name: text('Cooked white rice', 'برنج سفید پخته'), category: text('Grains', 'غلات'),
    servings: [serving('cup', '1 cup', '۱ پیمانه', 'about 160 g', 'حدود ۱۶۰ گرم', 205, 4.3, 44.5, 0.4), serving('spoon', '1 spoonful', '۱ قاشق غذاخوری', 'about 15 g', 'حدود ۱۵ گرم', 19, 0.4, 4.2, 0), serving('bowl', '1 bowl', '۱ کاسه', 'about 300 g', 'حدود ۳۰۰ گرم', 384, 8.1, 83.4, 0.8)],
  },
  {
    id: 'egg', name: text('Whole egg', 'تخم‌مرغ کامل'), category: text('Protein', 'پروتئین'),
    servings: [serving('large', '1 large egg', '۱ عدد بزرگ', 'about 50 g', 'حدود ۵۰ گرم', 72, 6.3, 0.4, 4.8), serving('cup', '1 cup', '۱ پیمانه', 'chopped, 8 eggs', 'خردشده، ۸ عدد', 576, 50.4, 3.2, 38.4)],
  },
  {
    id: 'greek-yogurt', name: text('Greek yogurt', 'ماست یونانی'), category: text('Dairy', 'لبنیات'),
    servings: [serving('serving', '1 serving', '۱ وعده', '170 g container', 'ظرف ۱۷۰ گرمی', 130, 17, 9, 3.5), serving('cup', '1 cup', '۱ پیمانه', 'about 245 g', 'حدود ۲۴۵ گرم', 187, 24.5, 13, 5), serving('spoon', '1 spoonful', '۱ قاشق غذاخوری', 'about 15 g', 'حدود ۱۵ گرم', 11, 1.5, 0.8, 0.3)],
  },
  {
    id: 'whole-wheat-bread', name: text('Whole wheat bread', 'نان سبوس‌دار'), category: text('Grains', 'غلات'),
    servings: [serving('slice', '1 slice', '۱ برش', 'about 28 g', 'حدود ۲۸ گرم', 81, 4, 13.8, 1.1), serving('serving', '1 serving', '۱ وعده', '2 slices', '۲ برش', 162, 8, 27.6, 2.2)],
  },
  {
    id: 'apple', name: text('Apple', 'سیب'), category: text('Fruit', 'میوه'),
    servings: [serving('medium', '1 medium apple', '۱ سیب متوسط', 'about 180 g', 'حدود ۱۸۰ گرم', 95, 0.5, 25, 0.3), serving('cup', '1 cup', '۱ پیمانه', 'sliced, 110 g', 'برش‌خورده، ۱۱۰ گرم', 57, 0.3, 15, 0.2)],
  },
  {
    id: 'salmon', name: text('Salmon', 'ماهی سالمون'), category: text('Protein', 'پروتئین'),
    servings: [serving('100g', '100 grams', '۱۰۰ گرم', 'cooked', 'پخته', 206, 22, 0, 12), serving('fillet', '1 fillet', '۱ فیله', 'about 170 g', 'حدود ۱۷۰ گرم', 350, 37.4, 0, 20.4)],
  },
  {
    id: 'lentil-soup', name: text('Lentil soup', 'سوپ عدس'), category: text('Prepared meals', 'غذای آماده'),
    servings: [serving('cup', '1 cup', '۱ پیمانه', 'about 240 ml', 'حدود ۲۴۰ میلی‌لیتر', 180, 11, 30, 2), serving('bowl', '1 bowl', '۱ کاسه', 'about 2 cups', 'حدود ۲ پیمانه', 360, 22, 60, 4), serving('spoon', '1 spoonful', '۱ قاشق غذاخوری', 'about 15 ml', 'حدود ۱۵ میلی‌لیتر', 11, 0.7, 1.9, 0.1)],
  },
  {
    id: 'almonds', name: text('Almonds', 'بادام'), category: text('Nuts', 'آجیل'),
    servings: [serving('serving', '1 serving', '۱ وعده', '28 g, about 23 nuts', '۲۸ گرم، حدود ۲۳ عدد', 164, 6, 6.1, 14.2), serving('spoon', '1 spoonful', '۱ قاشق غذاخوری', 'about 9 g', 'حدود ۹ گرم', 53, 1.9, 2, 4.6), serving('cup', '1 cup', '۱ پیمانه', 'about 143 g', 'حدود ۱۴۳ گرم', 828, 30, 31, 72)],
  },
  {
    id: 'banana', name: text('Banana', 'موز'), category: text('Fruit', 'میوه'),
    servings: [serving('medium', '1 medium banana', '۱ موز متوسط', 'about 118 g', 'حدود ۱۱۸ گرم', 105, 1.3, 27, 0.4), serving('cup', '1 cup', '۱ پیمانه', 'sliced, 150 g', 'برش‌خورده، ۱۵۰ گرم', 134, 1.6, 34, 0.5)],
  },
  {
    id: 'olive-oil', name: text('Olive oil', 'روغن زیتون'), category: text('Fats', 'چربی‌ها'),
    servings: [serving('spoon', '1 spoonful', '۱ قاشق غذاخوری', '15 ml', '۱۵ میلی‌لیتر', 119, 0, 0, 13.5), serving('teaspoon', '1 teaspoon', '۱ قاشق چای‌خوری', '5 ml', '۵ میلی‌لیتر', 40, 0, 0, 4.5)],
  },
  {
    id: 'oatmeal', name: text('Cooked oatmeal', 'جو دوسر پخته'), category: text('Grains', 'غلات'),
    servings: [serving('cup', '1 cup', '۱ پیمانه', 'cooked with water', 'پخته‌شده با آب', 158, 6, 27, 3.2), serving('bowl', '1 bowl', '۱ کاسه', 'about 1.5 cups', 'حدود ۱.۵ پیمانه', 237, 9, 40.5, 4.8)],
  },
]
