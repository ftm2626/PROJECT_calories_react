import { useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FoodCombobox } from '../components/FoodCombobox'
import { Icon } from '../components/Icon'
import { mealColors } from '../constants'
import { translate } from '../i18n'
import { foodCatalog } from '../services/foodCatalog'
import { addEntry, removeEntry, updateEntry, useAppDispatch, useAppSelector } from '../store'
import type { FoodCatalogItem, FoodEntry, FoodEntryDraft, MealType, NutritionTotals } from '../types'
import { entryName, entryServing, formatDate, formatNumber, shiftDate, sumNutrition, todayKey } from '../utils'

const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
const inputClass = 'w-full rounded-xl border border-line bg-input px-3 py-3 text-sm text-foreground placeholder:text-[var(--input-placeholder)] disabled:cursor-not-allowed disabled:opacity-45'
const labelClass = 'mb-2 block text-[11px] font-bold text-soft'
const emptyCustom = { name: '', serving: '', calories: '', protein: '', carbs: '', fat: '' }

type CustomDraft = typeof emptyCustom

const scaleNutrition = (nutrition: NutritionTotals, quantity: number): NutritionTotals => ({
  calories: Math.round(nutrition.calories * quantity),
  protein: Math.round(nutrition.protein * quantity * 10) / 10,
  carbs: Math.round(nutrition.carbs * quantity * 10) / 10,
  fat: Math.round(nutrition.fat * quantity * 10) / 10,
})

export function MealPage({ meal }: { meal: MealType }) {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.preferences.locale)
  const entries = useAppSelector((state) => state.diary.entries)
  const [params, setParams] = useSearchParams()
  const date = params.get('date') ?? todayKey()
  const editId = params.get('edit')
  const editingEntry = entries.find((entry) => entry.id === editId && entry.meal === meal)
  const initialFood = editingEntry?.foodId ? foodCatalog.get(editingEntry.foodId) : undefined
  const [selectedFood, setSelectedFood] = useState<FoodCatalogItem | undefined>(initialFood)
  const [servingId, setServingId] = useState(editingEntry?.servingId ?? initialFood?.servings[0]?.id ?? '')
  const [quantity, setQuantity] = useState(String(editingEntry?.quantity ?? 1))
  const [customMode, setCustomMode] = useState(Boolean(editingEntry && !initialFood))
  const initialQuantity = editingEntry?.quantity || 1
  const [custom, setCustom] = useState<CustomDraft>(editingEntry && !initialFood ? {
    name: entryName(editingEntry, locale),
    serving: entryServing(editingEntry, locale),
    calories: String(editingEntry.calories / initialQuantity),
    protein: String(editingEntry.protein / initialQuantity),
    carbs: String(editingEntry.carbs / initialQuantity),
    fat: String(editingEntry.fat / initialQuantity),
  } : emptyCustom)
  const [error, setError] = useState('')
  const [formVersion, setFormVersion] = useState(0)

  const mealEntries = entries.filter((entry) => entry.date === date && entry.meal === meal)
  const mealTotal = sumNutrition(mealEntries)
  const selectedServing = selectedFood?.servings.find((serving) => serving.id === servingId)
  const quantityNumber = Number(quantity)
  const baseNutrition: NutritionTotals = customMode
    ? { calories: Number(custom.calories), protein: Number(custom.protein), carbs: Number(custom.carbs), fat: Number(custom.fat) }
    : selectedServing ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const preview = scaleNutrition(baseNutrition, Number.isFinite(quantityNumber) ? quantityNumber : 0)

  const resetForm = () => {
    setSelectedFood(undefined)
    setServingId('')
    setQuantity('1')
    setCustomMode(false)
    setCustom(emptyCustom)
    setError('')
    setFormVersion((version) => version + 1)
    setParams({ date })
  }

  const startEdit = (entry: FoodEntry) => {
    const food = entry.foodId ? foodCatalog.get(entry.foodId) : undefined
    const entryQuantity = entry.quantity || 1
    setSelectedFood(food)
    setServingId(entry.servingId ?? food?.servings[0]?.id ?? '')
    setQuantity(String(entryQuantity))
    setCustomMode(!food)
    setCustom(!food ? {
      name: entryName(entry, locale),
      serving: entryServing(entry, locale),
      calories: String(entry.calories / entryQuantity),
      protein: String(entry.protein / entryQuantity),
      carbs: String(entry.carbs / entryQuantity),
      fat: String(entry.fat / entryQuantity),
    } : emptyCustom)
    setError('')
    setFormVersion((version) => version + 1)
    setParams({ date, edit: entry.id })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const moveDate = (amount: number) => {
    resetForm()
    setParams({ date: shiftDate(date, amount) })
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
      setError(translate(locale, 'invalidSelection'))
      return
    }

    let draft: FoodEntryDraft
    if (customMode) {
      if (!custom.name.trim() || !custom.serving.trim() || Number(custom.calories) <= 0) {
        setError(translate(locale, 'required'))
        return
      }
      draft = {
        name: custom.name.trim(),
        nameFa: locale === 'fa' ? custom.name.trim() : undefined,
        serving: quantityNumber === 1 ? custom.serving.trim() : `${formatNumber(quantityNumber, 'en', 2)} × ${custom.serving.trim()}`,
        servingFa: locale === 'fa' ? (quantityNumber === 1 ? custom.serving.trim() : `${formatNumber(quantityNumber, 'fa', 2)} × ${custom.serving.trim()}`) : undefined,
        quantity: quantityNumber,
        ...preview,
      }
    } else {
      if (!selectedFood || !selectedServing) {
        setError(translate(locale, 'invalidSelection'))
        return
      }
      draft = {
        foodId: selectedFood.id,
        servingId: selectedServing.id,
        quantity: quantityNumber,
        name: selectedFood.name.en,
        nameFa: selectedFood.name.fa,
        serving: quantityNumber === 1 ? selectedServing.label.en : `${formatNumber(quantityNumber, 'en', 2)} × ${selectedServing.label.en}`,
        servingFa: quantityNumber === 1 ? selectedServing.label.fa : `${formatNumber(quantityNumber, 'fa', 2)} × ${selectedServing.label.fa}`,
        ...preview,
      }
    }

    if (editingEntry) dispatch(updateEntry({ id: editingEntry.id, draft }))
    else dispatch(addEntry({ date, meal, draft }))
    resetForm()
  }

  const setCustomField = (field: keyof CustomDraft, value: string) => setCustom((current) => ({ ...current, [field]: value }))

  return (
    <main className="mx-auto w-[calc(100%-28px)] max-w-300 py-8 md:w-[calc(100%-40px)] md:py-12 lg:w-[calc(100%-64px)]">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <Link to={`/?date=${date}`} className="flex items-center gap-2 text-xs text-muted no-underline hover:text-foreground"><Icon name={locale === 'fa' ? 'right' : 'left'} size={17}/>{translate(locale, 'backToDashboard')}</Link>
        <div className="flex items-center rounded-xl border border-line bg-panel p-1">
          <button type="button" className="grid size-8.5 place-items-center rounded-lg border-0 bg-transparent" onClick={() => moveDate(locale === 'fa' ? 1 : -1)} aria-label={translate(locale, 'previousDay')}><Icon name="left"/></button>
          <span className="min-w-24 px-2 text-center text-xs text-soft">{formatDate(date, locale, { month: 'short', day: 'numeric' })}</span>
          <button type="button" className="grid size-8.5 place-items-center rounded-lg border-0 bg-transparent disabled:opacity-25" onClick={() => moveDate(locale === 'fa' ? -1 : 1)} disabled={date >= todayKey()} aria-label={translate(locale, 'nextDay')}><Icon name="right"/></button>
        </div>
      </div>

      <header className="mb-7 md:flex md:items-end md:justify-between">
        <div>
          <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[.16em]" style={{ color: mealColors[meal] }}>{translate(locale, 'mealLog')}</span>
          <h1 className="mb-2 font-[Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[44px] leading-none font-medium tracking-[-.025em] rtl:font-[Tahoma,Arial,sans-serif] rtl:font-black md:text-[64px]">{translate(locale, meal)}</h1>
          <p className="mb-0 text-sm text-muted">{translate(locale, 'mealPageHint')}</p>
        </div>
        <div className="mt-5 md:mt-0"><span className="block text-[10px] uppercase tracking-wider text-muted">{translate(locale, 'mealTotal')}</span><strong className="text-2xl" style={{ color: mealColors[meal] }}>{formatNumber(mealTotal.calories, locale)} <small className="text-[10px] font-medium text-muted">{translate(locale, 'kcal')}</small></strong></div>
      </header>

      <nav className="mb-6 flex gap-2 overflow-x-auto pb-1" aria-label={translate(locale, 'browseMeals')}>
        {meals.map((item) => <Link key={item} to={`/meals/${item}?date=${date}`} className={`shrink-0 rounded-full border px-4 py-2 text-xs font-bold no-underline ${item === meal ? 'border-lime bg-lime text-accent-ink' : 'border-line bg-panel text-muted hover:text-foreground'}`}>{translate(locale, item)}</Link>)}
      </nav>

      <section className="mb-10 grid overflow-visible rounded-[20px] border border-line bg-surface shadow-[0_18px_50px_rgb(0_0_0/10%)] lg:grid-cols-[1.25fr_.75fr]">
        <form className="relative border-b border-line p-5 md:p-7 lg:border-e lg:border-b-0" onSubmit={submit}>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{editingEntry ? translate(locale, 'editEntry') : translate(locale, 'addFood')}</span><h2 className="m-0 text-xl font-bold">{customMode ? translate(locale, 'customFood') : translate(locale, 'searchFood')}</h2></div>
            {customMode && <button type="button" className="rounded-lg border border-line bg-transparent px-3 py-2 text-[10px] font-bold text-muted hover:text-foreground" onClick={() => { setCustomMode(false); setCustom(emptyCustom); setError(''); setFormVersion((version) => version + 1) }}>{translate(locale, 'useCatalog')}</button>}
          </div>

          {customMode ? (
            <div>
              <p className="mb-5 text-xs leading-relaxed text-muted">{translate(locale, 'customFoodHint')}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className={labelClass}>{translate(locale, 'foodName')}</span><input className={inputClass} value={custom.name} onChange={(event) => setCustomField('name', event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'serving')}</span><input className={inputClass} value={custom.serving} placeholder={locale === 'fa' ? 'مثلا یک پیمانه' : 'e.g. 1 cup'} onChange={(event) => setCustomField('serving', event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'calories')} · {translate(locale, 'perServing')}</span><input className={inputClass} type="number" min="0" inputMode="decimal" value={custom.calories} onChange={(event) => setCustomField('calories', event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'quantity')}</span><input className={inputClass} type="number" min="0.1" step="0.1" inputMode="decimal" value={quantity} onChange={(event) => setQuantity(event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'protein')} ({translate(locale, 'grams')})</span><input className={inputClass} type="number" min="0" inputMode="decimal" value={custom.protein} onChange={(event) => setCustomField('protein', event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'carbs')} ({translate(locale, 'grams')})</span><input className={inputClass} type="number" min="0" inputMode="decimal" value={custom.carbs} onChange={(event) => setCustomField('carbs', event.target.value)}/></label>
                <label><span className={labelClass}>{translate(locale, 'fat')} ({translate(locale, 'grams')})</span><input className={inputClass} type="number" min="0" inputMode="decimal" value={custom.fat} onChange={(event) => setCustomField('fat', event.target.value)}/></label>
              </div>
            </div>
          ) : (
            <div className="grid gap-5">
              <div><span className={labelClass}>{translate(locale, 'foodName')}</span><FoodCombobox key={`${locale}-${formVersion}`} locale={locale} selected={selectedFood} onCustom={() => { setCustomMode(true); setSelectedFood(undefined); setServingId(''); setError('') }} onSelect={(food) => { setSelectedFood(food); setServingId(food?.servings[0]?.id ?? ''); setError('') }}/></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label><span className={labelClass}>{translate(locale, 'chooseServing')}</span><select className={inputClass} disabled={!selectedFood} value={servingId} onChange={(event) => setServingId(event.target.value)}><option value="">{translate(locale, 'chooseServing')}</option>{selectedFood?.servings.map((serving) => <option value={serving.id} key={serving.id}>{serving.label[locale]} · {serving.detail[locale]}</option>)}</select></label>
                <label><span className={labelClass}>{translate(locale, 'quantity')}</span><input className={inputClass} type="number" min="0.1" step="0.1" inputMode="decimal" disabled={!selectedServing} value={quantity} onChange={(event) => setQuantity(event.target.value)}/></label>
              </div>
            </div>
          )}

          {error && <p className="mt-4 mb-0 text-xs text-danger">{error}</p>}
          <div className="mt-6 flex justify-end gap-2">
            {editingEntry && <button type="button" className="rounded-[10px] border border-line bg-transparent px-4 py-2.5 text-xs font-bold" onClick={resetForm}>{translate(locale, 'cancel')}</button>}
            <button type="submit" className="rounded-[10px] border border-lime bg-lime px-5 py-2.5 text-xs font-bold text-accent-ink">{editingEntry ? translate(locale, 'updateFood') : translate(locale, 'addToMeal')}</button>
          </div>
        </form>

        <aside className="flex min-h-70 flex-col justify-between bg-[linear-gradient(145deg,var(--panel-highlight),var(--surface))] p-5 md:p-7">
          <div><span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'calculatedTotal')}</span><h2 className="m-0 text-xl font-bold">{translate(locale, 'nutritionPreview')}</h2></div>
          {(customMode ? Number(custom.calories) > 0 : selectedServing) ? (
            <div>
              <div className="mb-6"><strong className="text-5xl tracking-[-.05em]">{formatNumber(preview.calories, locale)}</strong><span className="ms-2 text-xs text-muted">{translate(locale, 'kcal')}</span></div>
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-line bg-panel p-3"><span className="block text-[9px] text-muted">{translate(locale, 'protein')}</span><strong className="mt-1 block text-sm">{formatNumber(preview.protein, locale, 1)}{translate(locale, 'grams')}</strong></div>
                <div className="rounded-xl border border-line bg-panel p-3"><span className="block text-[9px] text-muted">{translate(locale, 'carbs')}</span><strong className="mt-1 block text-sm">{formatNumber(preview.carbs, locale, 1)}{translate(locale, 'grams')}</strong></div>
                <div className="rounded-xl border border-line bg-panel p-3"><span className="block text-[9px] text-muted">{translate(locale, 'fat')}</span><strong className="mt-1 block text-sm">{formatNumber(preview.fat, locale, 1)}{translate(locale, 'grams')}</strong></div>
              </div>
            </div>
          ) : <div className="my-auto py-8 text-center text-xs leading-relaxed text-muted"><span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-panel"><Icon name="fork"/></span>{translate(locale, 'selectFoodFirst')}</div>}
        </aside>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between"><div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{formatDate(date, locale)}</span><h2 className="m-0 text-2xl font-bold">{translate(locale, 'currentFoods')}</h2></div><span className="text-xs text-muted">{formatNumber(mealEntries.length, locale)} {translate(locale, mealEntries.length === 1 ? 'entry' : 'entries')}</span></div>
        {mealEntries.length === 0 ? <div className="rounded-2xl border border-dashed border-line px-5 py-12 text-center text-sm text-muted">{translate(locale, 'noEntriesMeal')}</div> : (
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">{mealEntries.map((entry) => <div className="grid min-h-19 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b border-line px-4 py-3 last:border-0 md:px-5" key={entry.id}><div className="min-w-0"><strong className="block overflow-hidden text-sm text-ellipsis whitespace-nowrap">{entryName(entry, locale)}</strong><span className="mt-1 block text-[10px] text-muted">{entryServing(entry, locale)} · P {formatNumber(entry.protein, locale)}{translate(locale, 'grams')} · C {formatNumber(entry.carbs, locale)}{translate(locale, 'grams')} · F {formatNumber(entry.fat, locale)}{translate(locale, 'grams')}</span></div><strong className="text-sm" style={{ color: mealColors[meal] }}>{formatNumber(entry.calories, locale)} <small className="text-[9px] font-medium text-muted">{translate(locale, 'kcal')}</small></strong><div className="flex gap-1"><button type="button" className="grid size-8 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-panel-raised hover:text-foreground" onClick={() => startEdit(entry)} aria-label={translate(locale, 'edit')}><Icon name="edit" size={16}/></button><button type="button" className="grid size-8 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-panel-raised hover:text-danger" onClick={() => { dispatch(removeEntry(entry.id)); if (entry.id === editId) resetForm() }} aria-label={translate(locale, 'remove')}><Icon name="trash" size={16}/></button></div></div>)}</div>
        )}
      </section>
    </main>
  )
}
