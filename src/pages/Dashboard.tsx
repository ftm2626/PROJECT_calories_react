import { Link, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CalorieRing, MacroDonut, MealBars } from '../components/NutritionCharts'
import { mealColors } from '../constants'
import { translate } from '../i18n'
import { removeEntry, selectDailyCalories, selectProfileComplete, useAppDispatch, useAppSelector } from '../store'
import type { MealType } from '../types'
import { entryName, entryServing, formatDate, formatNumber, shiftDate, sumNutrition, todayKey } from '../utils'

const meals: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks']
const panelClass = 'rounded-[20px] border border-line bg-[linear-gradient(145deg,var(--panel-highlight),var(--surface))] p-5 shadow-[0_18px_50px_rgb(0_0_0/10%)] md:p-6'
const eyebrowClass = 'mb-2 block text-[11px] font-extrabold uppercase tracking-[.16em] text-lime'
const panelHeadingClass = 'mb-1 text-lg font-bold tracking-[-.025em]'

export function Dashboard() {
  const dispatch = useAppDispatch()
  const entries = useAppSelector((state) => state.diary.entries)
  const dailyGoal = useAppSelector(selectDailyCalories)
  const profileComplete = useAppSelector(selectProfileComplete)
  const locale = useAppSelector((state) => state.preferences.locale)
  const [params, setParams] = useSearchParams()
  const date = params.get('date') ?? todayKey()
  const dayEntries = entries.filter((entry) => entry.date === date)
  const totals = sumNutrition(dayEntries)
  const isToday = date === todayKey()
  const remaining = dailyGoal - totals.calories
  const mealData = meals.map((meal) => ({ meal, calories: sumNutrition(dayEntries.filter((entry) => entry.meal === meal)).calories }))

  const moveDate = (amount: number) => setParams({ date: shiftDate(date, amount) })
  return (
    <main className="mx-auto w-[calc(100%-28px)] max-w-330 py-8 md:w-[calc(100%-40px)] md:py-12.5 lg:w-[calc(100%-64px)]">
      <section className="mb-8 flex items-center justify-between gap-3 md:items-end">
        <div>
          <span className={eyebrowClass}>{translate(locale, 'dailyFuel')}</span>
          <h1 className="mb-2 font-[Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[43px] leading-[.95] font-medium tracking-[-.025em] rtl:font-[Tahoma,Arial,sans-serif] rtl:font-black md:text-6xl lg:text-[66px]">{isToday ? translate(locale, 'today') : formatDate(date, locale, { month: 'long', day: 'numeric' })}</h1>
          <p className="hidden text-[13px] text-muted md:block">{formatDate(date, locale)}</p>
        </div>
        <div className="flex items-center rounded-xl border border-line bg-panel p-1">
          <button type="button" className="grid size-8.5 place-items-center rounded-lg border-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-25" onClick={() => moveDate(locale === 'fa' ? 1 : -1)} aria-label={translate(locale, 'previousDay')}><Icon name="left"/></button>
          <button type="button" className="grid h-8.5 min-w-17.5 place-items-center rounded-lg border-0 bg-transparent px-2 text-xs text-soft md:min-w-22.5" onClick={() => setParams({ date: todayKey() })}>{formatDate(date, locale, { month: 'short', day: 'numeric' })}</button>
          <button type="button" className="grid size-8.5 place-items-center rounded-lg border-0 bg-transparent disabled:cursor-not-allowed disabled:opacity-25" onClick={() => moveDate(locale === 'fa' ? -1 : 1)} aria-label={translate(locale, 'nextDay')} disabled={date >= todayKey()}><Icon name="right"/></button>
        </div>
      </section>

      <section className="mb-10 grid gap-3 md:mb-14.5 md:grid-cols-2 md:gap-4.5 lg:grid-cols-[1.2fr_.9fr_.9fr]">
        <article className={`${panelClass} md:col-span-2 lg:col-span-1`}>
          <div className="flex items-start justify-between">
            <div><span className={eyebrowClass}>{translate(locale, 'calories')}</span><h2 className={panelHeadingClass}>{remaining >= 0 ? translate(locale, 'remaining') : translate(locale, 'overGoal')}</h2></div>
            <strong className={`text-2xl ${remaining < 0 ? 'text-danger' : 'text-lime'}`}>{formatNumber(Math.abs(remaining), locale)} <small className="text-[10px] font-medium uppercase text-muted">{translate(locale, 'kcal')}</small></strong>
          </div>
          <div className="flex items-center justify-center gap-2.5 pt-4 min-[420px]:gap-6 md:justify-evenly">
            <CalorieRing calories={totals.calories} goal={dailyGoal} locale={locale}/>
            <div className="min-w-28 min-[420px]:min-w-32.5">
              <div className="border-b border-line py-3.5 max-[420px]:block min-[421px]:flex min-[421px]:items-center min-[421px]:justify-between min-[421px]:gap-3.5"><span className="text-[11px] text-muted">{translate(locale, 'consumed')}</span><b className="block text-base max-[420px]:mt-1">{formatNumber(totals.calories, locale)}</b></div>
              <div className="py-3.5 max-[420px]:block min-[421px]:flex min-[421px]:items-center min-[421px]:justify-between min-[421px]:gap-3.5">
                <span className="text-[11px] text-muted">{translate(locale, 'dailyGoal')}</span>
                <Link to="/profile" className="flex items-center gap-1.5 p-0 text-foreground no-underline max-[420px]:mt-1" title={translate(locale, 'profile')}><b>{formatNumber(dailyGoal, locale)}</b><Icon name="user" size={14}/></Link>
              </div>
            </div>
          </div>
          {!profileComplete && <Link to="/profile" className="mt-2 block rounded-lg bg-[color-mix(in_srgb,var(--accent)_10%,transparent)] px-3 py-2 text-[10px] text-lime no-underline">{translate(locale, 'profileIncomplete')} {translate(locale, 'completeProfile')}.</Link>}
        </article>
        <article className={panelClass}><div><h2 className={panelHeadingClass}>{translate(locale, 'macroBalance')}</h2><p className="mb-0 text-[13px] text-muted">{translate(locale, 'macroSubtitle')}</p></div><MacroDonut totals={totals} locale={locale}/></article>
        <article className={panelClass}><div><h2 className={panelHeadingClass}>{translate(locale, 'mealBreakdown')}</h2><p className="mb-0 text-[13px] text-muted">{translate(locale, 'mealSubtitle')}</p></div><MealBars data={mealData} locale={locale}/></article>
      </section>

      <section>
        <div className="mb-5 md:flex md:items-end md:justify-between">
          <div><span className={eyebrowClass}>{translate(locale, 'nutritionDetails')}</span><h2 className="m-0 text-[28px] font-bold tracking-[-.04em]">{translate(locale, 'dailyLog')}</h2></div>
          <div className="mt-3.5 flex flex-wrap gap-2 md:mt-0">
            <span className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-[10px] text-soft"><i className="me-1.5 inline-block size-1.5 rounded-full bg-[var(--macro-protein)]"/>{formatNumber(totals.protein, locale)}{translate(locale, 'grams')} {translate(locale, 'protein')}</span>
            <span className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-[10px] text-soft"><i className="me-1.5 inline-block size-1.5 rounded-full bg-lime"/>{formatNumber(totals.carbs, locale)}{translate(locale, 'grams')} {translate(locale, 'carbs')}</span>
            <span className="rounded-full border border-line bg-panel px-2.5 py-1.5 text-[10px] text-soft"><i className="me-1.5 inline-block size-1.5 rounded-full bg-[var(--meal-breakfast)]"/>{formatNumber(totals.fat, locale)}{translate(locale, 'grams')} {translate(locale, 'fat')}</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {meals.map((meal) => {
            const mealEntries = dayEntries.filter((entry) => entry.meal === meal)
            const mealTotal = sumNutrition(mealEntries)
            return (
              <article className="overflow-hidden rounded-[17px] border border-line bg-surface" key={meal}>
                <div className="flex items-center border-b border-line p-4.5">
                  <div className="me-3 grid size-9.5 place-items-center rounded-xl bg-panel-raised" style={{ color: mealColors[meal] }}><Icon name={meal === 'breakfast' ? 'flame' : 'fork'}/></div>
                  <div><h3 className="mb-0.5 text-[15px] font-bold">{translate(locale, meal)}</h3><p className="m-0 text-[11px] text-muted">{formatNumber(mealTotal.calories, locale)} {translate(locale, 'kcal')}</p></div>
                  <Link to={`/meals/${meal}?date=${date}`} className="ms-auto flex items-center gap-1.5 rounded-[9px] border border-line bg-transparent p-2 text-[11px] font-bold no-underline" style={{ color: mealColors[meal] }}><Icon name="plus" size={18}/><span className="hidden sm:inline">{translate(locale, 'addFood')}</span></Link>
                </div>
                <div className="min-h-22.5">
                  {mealEntries.length === 0 ? (
                    <Link to={`/meals/${meal}?date=${date}`} className="flex min-h-22.5 w-full flex-col items-start justify-center bg-transparent px-16 py-4 text-start text-muted no-underline"><span className="text-xs text-soft">{translate(locale, 'noFood')}</span><small className="mt-1 text-[10px]">{translate(locale, 'noFoodHint')}</small></Link>
                  ) : mealEntries.map((entry) => (
                    <div className="group grid min-h-18 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 border-b border-line px-3 py-3 last:border-0 md:gap-4.5 md:px-4.5" key={entry.id}>
                      <div className="min-w-0"><strong className="block overflow-hidden text-xs text-ellipsis whitespace-nowrap">{entryName(entry, locale)}</strong><span className="mt-1 block overflow-hidden text-[9px] text-ellipsis whitespace-nowrap text-muted">{entryServing(entry, locale)} · {formatNumber(entry.protein, locale)}{translate(locale, 'grams')} P · {formatNumber(entry.carbs, locale)}{translate(locale, 'grams')} C · {formatNumber(entry.fat, locale)}{translate(locale, 'grams')} F</span></div>
                      <b className="text-[13px]" style={{ color: mealColors[meal] }}>{formatNumber(entry.calories, locale)} <small className="hidden text-[8px] font-medium text-muted min-[420px]:inline">{translate(locale, 'kcal')}</small></b>
                      <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                        <Link to={`/meals/${meal}?date=${date}&edit=${entry.id}`} className="grid size-7 place-items-center rounded-lg text-muted no-underline hover:bg-panel-raised hover:text-foreground" aria-label={translate(locale, 'edit')}><Icon name="edit" size={16}/></Link>
                        <button type="button" className="grid size-7 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-panel-raised hover:text-foreground" onClick={() => dispatch(removeEntry(entry.id))} aria-label={translate(locale, 'remove')}><Icon name="trash" size={16}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </main>
  )
}
