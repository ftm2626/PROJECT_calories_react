import { useState, type FormEvent } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icon } from '../components/Icon'
import { translate } from '../i18n'
import { addWeight, removeWeight, selectBmr, selectCalculatedCalories, selectCurrentWeight, updateProfile, updateWeight, useAppDispatch, useAppSelector } from '../store'
import type { ActivityLevel, Sex, WeightEntry } from '../types'
import { formatDate, formatNumber, todayKey } from '../utils'

const inputClass = 'w-full rounded-xl border border-line bg-input px-3 py-3 text-sm text-foreground placeholder:text-[var(--input-placeholder)]'
const labelClass = 'mb-2 block text-[11px] font-bold text-soft'
const activityLevels: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'veryActive']

export function Profile() {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.preferences.locale)
  const profile = useAppSelector((state) => state.profile)
  const currentWeight = useAppSelector(selectCurrentWeight)
  const bmr = useAppSelector(selectBmr)
  const calculatedCalories = useAppSelector(selectCalculatedCalories)
  const [age, setAge] = useState(profile.age?.toString() ?? '')
  const [height, setHeight] = useState(profile.heightCm?.toString() ?? '')
  const [sex, setSex] = useState<Sex | ''>(profile.sex ?? '')
  const [activity, setActivity] = useState<ActivityLevel | ''>(profile.activityLevel ?? '')
  const [goalWeight, setGoalWeight] = useState(profile.goalWeightKg?.toString() ?? '')
  const [profileWeight, setProfileWeight] = useState(currentWeight?.toString() ?? '')
  const [profileMessage, setProfileMessage] = useState('')
  const [measurementDate, setMeasurementDate] = useState(todayKey())
  const [measurementWeight, setMeasurementWeight] = useState('')
  const [editingWeightId, setEditingWeightId] = useState<string | null>(null)
  const [weightError, setWeightError] = useState('')

  const sortedWeights = [...profile.weights].sort((a, b) => a.date.localeCompare(b.date))
  const latestEntry = sortedWeights.at(-1)
  const chartData = sortedWeights.map((entry) => ({ ...entry, label: formatDate(entry.date, locale, { month: 'short', day: 'numeric' }) }))
  const goalDifference = currentWeight !== null && profile.goalWeightKg !== null ? Math.abs(currentWeight - profile.goalWeightKg) : null

  const saveProfile = (event: FormEvent) => {
    event.preventDefault()
    const ageValue = Number(age)
    const heightValue = Number(height)
    const goalValue = Number(goalWeight)
    const weightValue = Number(profileWeight)
    if (!sex || !activity || ageValue < 13 || ageValue > 120 || heightValue < 100 || heightValue > 250 || goalValue < 25 || goalValue > 400 || weightValue < 25 || weightValue > 400) {
      setProfileMessage(translate(locale, 'invalidProfile'))
      return
    }
    dispatch(updateProfile({ age: ageValue, heightCm: heightValue, sex, activityLevel: activity, goalWeightKg: goalValue }))
    if (currentWeight !== weightValue) {
      if (latestEntry?.date === todayKey()) dispatch(updateWeight({ ...latestEntry, weightKg: weightValue }))
      else dispatch(addWeight({ date: todayKey(), weightKg: weightValue }))
    }
    setProfileMessage(translate(locale, 'profileSaved'))
  }

  const saveMeasurement = (event: FormEvent) => {
    event.preventDefault()
    const weightKg = Number(measurementWeight)
    if (!measurementDate || weightKg < 25 || weightKg > 400) {
      setWeightError(translate(locale, 'invalidProfile'))
      return
    }
    if (editingWeightId) dispatch(updateWeight({ id: editingWeightId, date: measurementDate, weightKg }))
    else dispatch(addWeight({ date: measurementDate, weightKg }))
    if (!latestEntry || measurementDate >= latestEntry.date) setProfileWeight(String(weightKg))
    setMeasurementDate(todayKey())
    setMeasurementWeight('')
    setEditingWeightId(null)
    setWeightError('')
  }

  const editMeasurement = (entry: WeightEntry) => {
    setEditingWeightId(entry.id)
    setMeasurementDate(entry.date)
    setMeasurementWeight(String(entry.weightKg))
    setWeightError('')
  }

  const deleteMeasurement = (entryId: string) => {
    dispatch(removeWeight(entryId))
    const nextLatest = sortedWeights.filter((entry) => entry.id !== entryId).at(-1)
    setProfileWeight(nextLatest?.weightKg.toString() ?? '')
    if (editingWeightId === entryId) {
      setEditingWeightId(null)
      setMeasurementWeight('')
      setMeasurementDate(todayKey())
    }
  }

  return (
    <main className="mx-auto w-[calc(100%-28px)] max-w-300 py-8 md:w-[calc(100%-40px)] md:py-12 lg:w-[calc(100%-64px)]">
      <header className="mb-8 max-w-170">
        <span className="mb-2 block text-[11px] font-extrabold uppercase tracking-[.16em] text-lime">{translate(locale, 'profile')}</span>
        <h1 className="mb-3 font-[Impact,Haettenschweiler,'Arial_Narrow_Bold',sans-serif] text-[44px] leading-none font-medium tracking-[-.025em] rtl:font-[Tahoma,Arial,sans-serif] rtl:font-black md:text-[64px]">{translate(locale, 'personalDetails')}</h1>
        <p className="m-0 text-sm leading-relaxed text-muted">{translate(locale, 'profileSubtitle')}</p>
      </header>

      <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-line bg-panel p-4"><span className="text-[10px] text-muted">{translate(locale, 'currentWeight')}</span><div className="mt-2"><strong className="text-2xl">{currentWeight === null ? '—' : formatNumber(currentWeight, locale, 1)}</strong>{currentWeight !== null && <small className="ms-1 text-[10px] text-muted">{translate(locale, 'kilograms')}</small>}</div></article>
        <article className="rounded-2xl border border-line bg-panel p-4"><span className="text-[10px] text-muted">{translate(locale, 'goalWeight')}</span><div className="mt-2"><strong className="text-2xl">{profile.goalWeightKg === null ? '—' : formatNumber(profile.goalWeightKg, locale, 1)}</strong>{profile.goalWeightKg !== null && <small className="ms-1 text-[10px] text-muted">{translate(locale, 'kilograms')}</small>}</div></article>
        <article className="rounded-2xl border border-line bg-panel p-4"><span className="text-[10px] text-muted">{translate(locale, 'remainingToGoal')}</span><div className="mt-2"><strong className="text-2xl text-lime">{goalDifference === null ? '—' : goalDifference <= .1 ? translate(locale, 'goalReached') : formatNumber(goalDifference, locale, 1)}</strong>{goalDifference !== null && goalDifference > .1 && <small className="ms-1 text-[10px] text-muted">{translate(locale, 'kilograms')}</small>}</div></article>
        <article className="rounded-2xl border border-line bg-[linear-gradient(145deg,var(--panel-highlight),var(--surface))] p-4"><span className="text-[10px] text-muted">{translate(locale, 'maintenanceCalories')}</span><div className="mt-2"><strong className="text-2xl text-lime">{calculatedCalories === null ? '—' : formatNumber(calculatedCalories, locale)}</strong>{calculatedCalories !== null && <small className="ms-1 text-[10px] text-muted">{translate(locale, 'kcal')}</small>}</div></article>
      </section>

      <section className="mb-10 grid overflow-hidden rounded-[20px] border border-line bg-surface shadow-[0_18px_50px_rgb(0_0_0/10%)] lg:grid-cols-[1.2fr_.8fr]">
        <form className="border-b border-line p-5 md:p-7 lg:border-e lg:border-b-0" onSubmit={saveProfile}>
          <div className="mb-6"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'profile')}</span><h2 className="m-0 text-xl font-bold">{translate(locale, 'personalDetails')}</h2></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label><span className={labelClass}>{translate(locale, 'age')} ({translate(locale, 'years')})</span><input className={inputClass} type="number" min="13" max="120" value={age} onChange={(event) => setAge(event.target.value)}/></label>
            <label><span className={labelClass}>{translate(locale, 'biologicalSex')}</span><select className={inputClass} value={sex} onChange={(event) => setSex(event.target.value as Sex | '')}><option value="">—</option><option value="male">{translate(locale, 'male')}</option><option value="female">{translate(locale, 'female')}</option></select></label>
            <label><span className={labelClass}>{translate(locale, 'height')} ({translate(locale, 'centimeters')})</span><input className={inputClass} type="number" min="100" max="250" value={height} onChange={(event) => setHeight(event.target.value)}/></label>
            <label><span className={labelClass}>{translate(locale, 'currentWeight')} ({translate(locale, 'kilograms')})</span><input className={inputClass} type="number" min="25" max="400" step="0.1" value={profileWeight} onChange={(event) => setProfileWeight(event.target.value)}/></label>
            <label><span className={labelClass}>{translate(locale, 'goalWeight')} ({translate(locale, 'kilograms')})</span><input className={inputClass} type="number" min="25" max="400" step="0.1" value={goalWeight} onChange={(event) => setGoalWeight(event.target.value)}/></label>
            <label><span className={labelClass}>{translate(locale, 'activityLevel')}</span><select className={inputClass} value={activity} onChange={(event) => setActivity(event.target.value as ActivityLevel | '')}><option value="">—</option>{activityLevels.map((level) => <option value={level} key={level}>{translate(locale, level)}</option>)}</select></label>
          </div>
          {profileMessage && <p className={`mt-4 mb-0 text-xs ${profileMessage === translate(locale, 'profileSaved') ? 'text-lime' : 'text-danger'}`}>{profileMessage}</p>}
          <div className="mt-6 flex justify-end"><button className="rounded-[10px] border border-lime bg-lime px-5 py-2.5 text-xs font-bold text-accent-ink" type="submit">{translate(locale, 'saveProfile')}</button></div>
        </form>

        <aside className="flex flex-col justify-between bg-[linear-gradient(145deg,var(--panel-highlight),var(--surface))] p-5 md:p-7">
          <div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'basedOnProfile')}</span><h2 className="m-0 text-xl font-bold">{translate(locale, 'maintenanceCalories')}</h2><p className="mt-2 text-xs leading-relaxed text-muted">{translate(locale, 'calorieExplanation')}</p></div>
          {calculatedCalories !== null && bmr !== null ? <div className="my-8"><strong className="text-5xl tracking-[-.05em]">{formatNumber(calculatedCalories, locale)}</strong><span className="ms-2 text-xs text-muted">{translate(locale, 'kcal')}</span><div className="mt-6 flex items-center justify-between border-t border-line pt-4"><span className="text-xs text-muted">{translate(locale, 'basalMetabolism')}</span><strong>{formatNumber(bmr, locale)} <small className="text-[9px] font-medium text-muted">{translate(locale, 'kcal')}</small></strong></div></div> : <div className="my-auto py-10 text-center text-xs leading-relaxed text-muted"><span className="mx-auto mb-3 grid size-11 place-items-center rounded-full bg-panel"><Icon name="target"/></span>{translate(locale, 'profileIncomplete')}</div>}
        </aside>
      </section>

      <section className="mb-10 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <article className="rounded-[20px] border border-line bg-surface p-4 md:p-6">
          <div className="mb-5 flex items-start justify-between"><div><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'weightProgress')}</span><h2 className="m-0 text-xl font-bold">{translate(locale, 'weightHistory')}</h2></div>{latestEntry && <span className="text-[10px] text-muted">{translate(locale, 'latest')} · {formatDate(latestEntry.date, locale, { month: 'short', day: 'numeric' })}</span>}</div>
          {chartData.length ? <div className="h-70" dir="ltr"><ResponsiveContainer><AreaChart data={chartData} margin={{ top: 15, right: 10, bottom: 0, left: -10 }}><defs><linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".4"/><stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--chart-grid)" strokeDasharray="4 6"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-axis)', fontSize: 11 }}/><YAxis domain={['dataMin - 2', 'dataMax + 2']} axisLine={false} tickLine={false} tick={{ fill: 'var(--chart-axis-dim)', fontSize: 11 }}/><Tooltip contentStyle={{ color: 'var(--foreground)', background: 'var(--tooltip-bg)', border: '1px solid var(--tooltip-border)', borderRadius: 12 }} formatter={(value) => [`${formatNumber(Number(value), locale, 1)} ${translate(locale, 'kilograms')}`, translate(locale, 'weight')]}/>{profile.goalWeightKg !== null && <ReferenceLine y={profile.goalWeightKg} stroke="var(--meal-breakfast)" strokeDasharray="5 5"/>}<Area type="monotone" dataKey="weightKg" stroke="var(--accent)" strokeWidth={3} fill="url(#weightGradient)" activeDot={{ r: 5, fill: 'var(--accent)', stroke: 'var(--canvas)', strokeWidth: 3 }}/></AreaChart></ResponsiveContainer></div> : <div className="grid h-70 place-content-center text-center text-xs text-muted"><Icon name="scale" size={30}/><p className="mt-3">{translate(locale, 'noWeightHistory')}</p></div>}
        </article>

        <form className="rounded-[20px] border border-line bg-panel p-5 md:p-6" onSubmit={saveMeasurement}>
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'weight')}</span><h2 className="mb-6 text-xl font-bold">{editingWeightId ? translate(locale, 'editMeasurement') : translate(locale, 'addWeight')}</h2>
          <label className="mb-4 block"><span className={labelClass}>{translate(locale, 'measurementDate')}</span><input className={inputClass} type="date" max={todayKey()} value={measurementDate} onChange={(event) => setMeasurementDate(event.target.value)}/></label>
          <label className="mb-4 block"><span className={labelClass}>{translate(locale, 'weight')} ({translate(locale, 'kilograms')})</span><input className={inputClass} type="number" min="25" max="400" step="0.1" value={measurementWeight} onChange={(event) => setMeasurementWeight(event.target.value)}/></label>
          {weightError && <p className="mb-3 text-xs text-danger">{weightError}</p>}
          <div className="flex gap-2"><button className="flex-1 rounded-[10px] border border-lime bg-lime px-4 py-2.5 text-xs font-bold text-accent-ink" type="submit">{editingWeightId ? translate(locale, 'updateMeasurement') : translate(locale, 'addMeasurement')}</button>{editingWeightId && <button type="button" className="rounded-[10px] border border-line bg-transparent px-4 py-2.5 text-xs font-bold" onClick={() => { setEditingWeightId(null); setMeasurementWeight(''); setMeasurementDate(todayKey()) }}>{translate(locale, 'cancel')}</button>}</div>
        </form>
      </section>

      {sortedWeights.length > 0 && <section><div className="mb-4"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[.14em] text-lime">{translate(locale, 'weight')}</span><h2 className="m-0 text-xl font-bold">{translate(locale, 'weightHistory')}</h2></div><div className="overflow-hidden rounded-2xl border border-line bg-surface">{[...sortedWeights].reverse().map((entry) => <div className="grid min-h-16 grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-line px-4 last:border-0" key={entry.id}><div><strong className="block text-sm">{formatDate(entry.date, locale)}</strong></div><span className="text-sm font-bold">{formatNumber(entry.weightKg, locale, 1)} <small className="text-[9px] font-medium text-muted">{translate(locale, 'kilograms')}</small></span><div className="flex"><button type="button" className="grid size-8 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-panel-raised hover:text-foreground" onClick={() => editMeasurement(entry)} aria-label={translate(locale, 'edit')}><Icon name="edit" size={16}/></button><button type="button" className="grid size-8 place-items-center rounded-lg border-0 bg-transparent text-muted hover:bg-panel-raised hover:text-danger" onClick={() => deleteMeasurement(entry.id)} aria-label={translate(locale, 'remove')}><Icon name="trash" size={16}/></button></div></div>)}</div></section>}
    </main>
  )
}
