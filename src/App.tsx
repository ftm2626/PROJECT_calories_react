import { useLayoutEffect } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Icon } from './components/Icon'
import { translate } from './i18n'
import { Dashboard } from './pages/Dashboard'
import { History } from './pages/History'
import { MealPage } from './pages/MealPage'
import { Profile } from './pages/Profile'
import { setLocale, setTheme, useAppDispatch, useAppSelector } from './store'

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-28 items-center justify-center gap-2 border-b-2 text-sm no-underline transition-colors ${isActive ? 'border-lime text-foreground' : 'border-transparent text-muted hover:border-lime hover:text-foreground'}`

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `flex flex-col items-center justify-center gap-0.5 text-[9px] no-underline ${isActive ? 'text-lime' : 'text-muted'}`

function Shell() {
  const dispatch = useAppDispatch()
  const locale = useAppSelector((state) => state.preferences.locale)
  const theme = useAppSelector((state) => state.preferences.theme)

  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = locale === 'fa' ? 'rtl' : 'ltr'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [locale, theme])

  const toggleLocale = () => dispatch(setLocale(locale === 'en' ? 'fa' : 'en'))
  const toggleTheme = () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))

  return (
    <div className="min-h-screen pb-[72px] md:pb-0">
      <header className="mx-auto grid h-16 max-w-360 grid-cols-[1fr_auto] items-center border-b border-line px-4.5 md:h-19 md:grid-cols-[1fr_auto_1fr] md:px-7 lg:px-12">
        <NavLink to="/" className="flex items-center gap-3 justify-self-start no-underline" aria-label={translate(locale, 'appName')}>
          <span className="grid size-9.5 -rotate-3 place-items-center rounded-[12px_12px_12px_4px] bg-lime text-accent-ink [&>svg]:rotate-3">
            <Icon name="flame" size={23}/>
          </span>
          <span className="hidden flex-col min-[420px]:flex">
            <strong className="text-lg leading-tight tracking-[-0.04em]">{translate(locale, 'appName')}</strong>
            <small className="mt-0.5 text-[10px] tracking-wide text-muted">{translate(locale, 'tagline')}</small>
          </span>
        </NavLink>
        <nav className="hidden h-full items-stretch gap-3 md:flex" aria-label={translate(locale, 'menu')}>
          <NavLink to="/" end className={desktopLink}><Icon name="dashboard" size={18}/>{translate(locale, 'dashboard')}</NavLink>
          <NavLink to="/history" className={desktopLink}><Icon name="history" size={18}/>{translate(locale, 'history')}</NavLink>
          <NavLink to="/profile" className={desktopLink}><Icon name="user" size={18}/>{translate(locale, 'profile')}</NavLink>
        </nav>
        <div className="flex items-center gap-2 justify-self-end">
          <button type="button" className="grid size-9 place-items-center rounded-[10px] border border-line bg-panel text-soft transition-colors hover:bg-panel-raised hover:text-foreground" onClick={toggleTheme} aria-label={translate(locale, theme === 'dark' ? 'lightTheme' : 'darkTheme')} title={translate(locale, theme === 'dark' ? 'lightTheme' : 'darkTheme')}>
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18}/>
          </button>
          <button type="button" className="flex items-center gap-2 rounded-[10px] border border-line bg-panel px-3 py-2 text-[11px] text-soft transition-colors hover:bg-panel-raised hover:text-foreground md:text-sm" onClick={toggleLocale}>
            <Icon name="globe" size={17}/><span className="hidden min-[380px]:inline">{translate(locale, 'language')}</span>
          </button>
        </div>
      </header>
      <Outlet/>
      <nav className="fixed inset-x-0 bottom-0 z-10 grid h-[68px] grid-cols-3 border-t border-line bg-mobile-nav px-5 py-1 backdrop-blur-xl md:hidden" aria-label={translate(locale, 'menu')}>
        <NavLink to="/" end className={mobileLink}><Icon name="dashboard"/><span>{translate(locale, 'dashboard')}</span></NavLink>
        <NavLink to="/history" className={mobileLink}><Icon name="history"/><span>{translate(locale, 'history')}</span></NavLink>
        <NavLink to="/profile" className={mobileLink}><Icon name="user"/><span>{translate(locale, 'profile')}</span></NavLink>
      </nav>
    </div>
  )
}

export default function App() {
  return <Routes><Route element={<Shell/>}><Route path="/" element={<Dashboard/>}/><Route path="/history" element={<History/>}/><Route path="/profile" element={<Profile/>}/><Route path="/meals/breakfast" element={<MealPage meal="breakfast"/>}/><Route path="/meals/lunch" element={<MealPage meal="lunch"/>}/><Route path="/meals/dinner" element={<MealPage meal="dinner"/>}/><Route path="/meals/snacks" element={<MealPage meal="snacks"/>}/><Route path="*" element={<Navigate to="/" replace/>}/></Route></Routes>
}
