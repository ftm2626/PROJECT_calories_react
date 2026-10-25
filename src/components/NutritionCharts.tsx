import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { mealColors } from '../constants'
import { translate } from '../i18n'
import type { Locale, MealType, NutritionTotals } from '../types'
import { formatNumber } from '../utils'

export function CalorieRing({ calories, goal, locale }: { calories: number; goal: number; locale: Locale }) {
  const capped = Math.min(calories, goal)
  const data = [{ value: capped, color: calories > goal ? 'var(--danger)' : 'var(--accent)' }, { value: Math.max(goal - capped, 0), color: 'var(--chart-track)' }]
  return (
    <div className="relative size-37.5 shrink-0 min-[420px]:size-42.5 md:size-47" role="img" aria-label={`${formatNumber(calories, locale)} ${translate(locale, 'consumed')}`}>
      <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" innerRadius="78%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none" cornerRadius={12}>{data.map((item) => <Cell key={item.color} fill={item.color}/>)}</Pie></PieChart></ResponsiveContainer>
      <div className="absolute inset-0 grid place-content-center text-center"><strong className="text-[32px] leading-none tracking-[-0.05em]">{formatNumber(calories, locale)}</strong><span className="mt-1 text-[11px] uppercase text-muted">{translate(locale, 'kcal')}</span></div>
    </div>
  )
}

export function MacroDonut({ totals, locale }: { totals: NutritionTotals; locale: Locale }) {
  const data = [
    { name: translate(locale, 'protein'), value: totals.protein * 4, grams: totals.protein, color: 'var(--macro-protein)' },
    { name: translate(locale, 'carbs'), value: totals.carbs * 4, grams: totals.carbs, color: 'var(--accent)' },
    { name: translate(locale, 'fat'), value: totals.fat * 9, grams: totals.fat, color: 'var(--meal-breakfast)' },
  ]
  const fallback = data.every((item) => item.value === 0) ? [{ name: '', value: 1, grams: 0, color: 'var(--chart-track)' }] : data
  return (
    <div className="flex h-57.5 items-center justify-around gap-4">
      <div className="h-38.75 w-30 shrink-0 sm:w-33.75"><ResponsiveContainer><PieChart><Pie data={fallback} dataKey="value" innerRadius="62%" outerRadius="94%" stroke="none" paddingAngle={3}>{fallback.map((item) => <Cell key={item.color} fill={item.color}/>)}</Pie></PieChart></ResponsiveContainer></div>
      <div className="flex-1">{data.map((item) => <div className="grid grid-cols-[8px_1fr_auto] items-center gap-2 border-b border-line py-2.5 last:border-0" key={item.name}><i className="size-[7px] rounded-full" style={{ background: item.color }}/><span className="text-[11px] text-muted">{item.name}</span><strong className="text-xs">{formatNumber(item.grams, locale)}{translate(locale, 'grams')}</strong></div>)}</div>
    </div>
  )
}

export function MealBars({ data, locale }: { data: Array<{ meal: MealType; calories: number }>; locale: Locale }) {
  return (
    <div className="mt-3 h-55.5 direction-ltr" dir="ltr" role="img" aria-label={translate(locale, 'mealBreakdown')}>
      <ResponsiveContainer><BarChart data={data} layout="vertical" margin={{ top: 2, right: 20, bottom: 2, left: 4 }}><CartesianGrid horizontal={false} stroke="var(--chart-grid)"/><XAxis type="number" hide/><YAxis type="category" dataKey="meal" tickFormatter={(value: MealType) => translate(locale, value)} width={locale === 'fa' ? 74 : 70} tick={{ fill: 'var(--chart-axis)', fontSize: 12 }} axisLine={false} tickLine={false}/><Tooltip cursor={{ fill: 'var(--chart-cursor)' }} contentStyle={{ color: 'var(--foreground)', background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 12 }} formatter={(value) => [`${formatNumber(Number(value), locale)} ${translate(locale, 'kcal')}`, translate(locale, 'calories')]}/><Bar dataKey="calories" radius={[0, 7, 7, 0]}>{data.map((item) => <Cell key={item.meal} fill={mealColors[item.meal]}/>)}</Bar></BarChart></ResponsiveContainer>
    </div>
  )
}
