import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icon } from '../components/Icon'
import { translate } from '../i18n'
import { selectDailyCalories, useAppSelector } from '../store'
import { formatDate, formatNumber, shiftDate, sumNutrition, todayKey } from '../utils'

const eyebrowClass = 'mb-2 block text-[11px] font-extrabold uppercase tracking-[.16em] text-lime'

export function History() {
  const entries = useAppSelector((state) => state.diary.entries)
  const dailyGoal = useAppSelector(selectDailyCalories)
  const locale = useAppSelector((state) => state.preferences.locale)
  const dates = Array.from({ length: 7 }, (_, index) => shiftDate(todayKey(), index - 6))
  const chartData = dates.map((date) => ({ date, label: formatDate(date, locale, { weekday: 'short' }), calories: sumNutrition(entries.filter((entry) => entry.date === date)).calories }))
  const loggedDates = [...new Set(entries.map((entry) => entry.date))].sort().reverse()
  const weeklyTotal = chartData.reduce((sum, day) => sum + day.calories, 0)
  const loggedThisWeek = chartData.filter((day) => day.calories > 0).length
  const average = loggedThisWeek ? weeklyTotal / loggedThisWeek : 0

  return (
    <main className="mx-auto w-[calc(100%-28px)] max-w-330 py-8 md:w-[calc(100%-40px)] md:py-12.5 lg:w-[calc(100%-64px)]">
      <section className="pb-9.5 md:flex md:items-end md:justify-between md:pt-5">
        <div className="max-w-170">
          <span className={eyebrowClass}>{translate(locale, 'history')}</span>
          <h1 className="mb-2 font-[Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[43px] leading-[.95] font-medium tracking-[-.025em] rtl:font-[Tahoma,Arial,sans-serif] rtl:font-black md:text-6xl lg:text-[66px]">{translate(locale, 'weekInReview')}</h1>
          <p className="mt-4 max-w-132.5 text-xs text-muted md:text-sm">{translate(locale, 'weekSubtitle')}</p>
        </div>
        <div className="mt-6 flex gap-2.5 md:mt-0">
          <div className="min-w-0 flex-1 rounded-[15px] border border-line bg-panel p-3.5 md:min-w-32.5"><span className="block text-[10px] text-muted">{translate(locale, 'average')}</span><strong className="mt-2 inline-block text-[28px] text-lime">{formatNumber(average, locale)}</strong><small className="ms-1 text-[10px] text-muted">{translate(locale, 'kcal')}</small></div>
          <div className="min-w-0 flex-1 rounded-[15px] border border-line bg-panel p-3.5 md:min-w-32.5"><span className="block text-[10px] text-muted">{translate(locale, 'loggedDays')}</span><strong className="mt-2 inline-block text-[28px] text-lime">{formatNumber(loggedThisWeek, locale)}</strong><small className="ms-1 text-[10px] text-muted">/ {formatNumber(7, locale)}</small></div>
        </div>
      </section>

      <section className="mb-12 rounded-[20px] border border-line bg-[linear-gradient(145deg,var(--panel-highlight),var(--surface))] px-3 py-4 shadow-[0_18px_50px_rgb(0_0_0/10%)] md:p-6">
        <div className="flex items-start justify-between">
          <div><h2 className="mb-1 text-lg font-bold tracking-[-.025em]">{translate(locale, 'weeklyTrend')}</h2><p className="m-0 text-[13px] text-muted">{formatNumber(weeklyTotal, locale)} {translate(locale, 'kcal')} · {translate(locale, 'total')}</p></div>
          <span className="flex items-center gap-2 text-[10px] text-muted"><i className="w-5 border-t border-dashed border-[var(--meal-breakfast)]"/>{translate(locale, 'goal')} {formatNumber(dailyGoal, locale)}</span>
        </div>
        <div className="mt-5.5 h-62.5 md:h-77.5" dir="ltr">
          <ResponsiveContainer><AreaChart data={chartData} margin={{ top: 18, right: 8, bottom: 0, left: -16 }}><defs><linearGradient id="calorieGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".45"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-axis-dim)', fontSize: 11 }}/><Tooltip contentStyle={{ color: 'var(--foreground)', background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 12 }} formatter={(value) => [`${formatNumber(Number(value), locale)} ${translate(locale, 'kcal')}`, translate(locale, 'calories')]}/><ReferenceLine y={dailyGoal} stroke="var(--meal-breakfast)" strokeDasharray="5 5"/><Area type="monotone" dataKey="calories" stroke="var(--accent)" strokeWidth={3} fill="url(#calorieGradient)" activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--canvas)', strokeWidth: 3 }}/></AreaChart></ResponsiveContainer>
        </div>
      </section>

      <section>
        <div className="mb-5"><span className={eyebrowClass}>{translate(locale, 'dailyLog')}</span><h2 className="m-0 text-[28px] font-bold tracking-[-.04em]">{translate(locale, 'history')}</h2></div>
        {loggedDates.length === 0 ? (
          <div className="rounded-[17px] border border-dashed border-line px-5 py-17.5 text-center text-muted"><span className="inline-block"><Icon name="history" size={30}/></span><h3 className="mt-3.5 mb-2 text-base font-bold text-foreground">{translate(locale, 'noHistory')}</h3><p className="text-xs">{translate(locale, 'noHistoryHint')}</p></div>
        ) : (
          <div className="overflow-hidden rounded-[17px] border border-line">
            {loggedDates.map((date) => {
              const dayEntries = entries.filter((entry) => entry.date === date)
              const total = sumNutrition(dayEntries)
              const percentage = Math.min((total.calories / dailyGoal) * 100, 100)
              return (
                <Link to={`/?date=${date}`} className="grid min-h-21 grid-cols-[1fr_auto] items-center gap-3 border-b border-line bg-surface px-3.5 py-3.5 no-underline transition-colors last:border-0 hover:bg-[var(--surface-hover)] min-[421px]:grid-cols-[1.2fr_1.4fr_auto] md:grid-cols-[1fr_1.4fr_.8fr_auto] md:gap-7 md:px-5.5 lg:grid-cols-[1.1fr_1.4fr_1fr_.5fr_auto]" key={date}>
                  <div><strong className="block text-[13px]">{formatDate(date, locale, { weekday: 'long' })}</strong><span className="mt-1 block text-[10px] text-muted">{formatDate(date, locale, { month: 'long', day: 'numeric' })}</span></div>
                  <div className="hidden min-[421px]:block"><div className="h-1.5 overflow-hidden rounded-lg bg-[var(--chart-track)]"><span className="block h-full rounded-[inherit] bg-lime" style={{ width: `${percentage}%` }}/></div><small className="mt-1.5 block text-[9px] text-muted">{formatNumber(total.calories, locale)} / {formatNumber(dailyGoal, locale)} {translate(locale, 'kcal')}</small></div>
                  <div className="hidden gap-2.5 text-[9px] text-muted lg:flex"><span>P {formatNumber(total.protein, locale)}{translate(locale, 'grams')}</span><span>C {formatNumber(total.carbs, locale)}{translate(locale, 'grams')}</span><span>F {formatNumber(total.fat, locale)}{translate(locale, 'grams')}</span></div>
                  <div className="hidden text-center md:block"><strong className="block text-[17px]">{formatNumber(dayEntries.length, locale)}</strong><span className="block text-[8px] text-muted">{translate(locale, dayEntries.length === 1 ? 'entry' : 'entries')}</span></div>
                  <Icon name={locale === 'fa' ? 'left' : 'right'} size={18}/>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
