import { useDeferredValue, useId, useState } from 'react'
import { translate } from '../i18n'
import { foodCatalog } from '../services/foodCatalog'
import type { FoodCatalogItem, Locale } from '../types'
import { formatNumber } from '../utils'
import { Icon } from './Icon'

type Props = {
  locale: Locale
  selected?: FoodCatalogItem
  onSelect: (food?: FoodCatalogItem) => void
  onCustom: () => void
}

export function FoodCombobox({ locale, selected, onSelect, onCustom }: Props) {
  const listboxId = useId()
  const [query, setQuery] = useState(selected?.name[locale] ?? '')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const deferredQuery = useDeferredValue(query)
  const results = foodCatalog.search(deferredQuery).slice(0, 8)

  const choose = (food: FoodCatalogItem) => {
    setQuery(food.name[locale])
    setOpen(false)
    onSelect(food)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setOpen(true)
      if (results.length) setActiveIndex((index) => Math.min(index + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && open && results[activeIndex]) {
      event.preventDefault()
      choose(results[activeIndex])
    } else if (event.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 start-3 grid place-items-center text-muted"><Icon name="search" size={18}/></span>
        <input
          className="w-full rounded-xl border border-line bg-input py-3 pe-3 ps-10 text-sm text-foreground placeholder:text-[var(--input-placeholder)]"
          role="combobox"
          aria-label={translate(locale, 'searchFood')}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-activedescendant={open && results[activeIndex] ? `${listboxId}-${results[activeIndex].id}` : undefined}
          value={query}
          placeholder={translate(locale, 'searchFoodPlaceholder')}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
          onKeyDown={handleKeyDown}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActiveIndex(0)
            if (selected) onSelect(undefined)
          }}
        />
      </div>
      {open && (
        <div id={listboxId} role="listbox" className="absolute inset-x-0 top-[calc(100%+8px)] z-20 max-h-80 overflow-auto rounded-xl border border-line bg-panel p-1.5 shadow-[0_18px_50px_rgb(0_0_0/18%)]">
          {results.map((food, index) => {
            const serving = food.servings[0]
            return (
              <button
                id={`${listboxId}-${food.id}`}
                role="option"
                aria-selected={selected?.id === food.id}
                type="button"
                className={`flex w-full items-center gap-3 rounded-lg border-0 px-3 py-2.5 text-start ${index === activeIndex ? 'bg-panel-raised' : 'bg-transparent hover:bg-panel-raised'}`}
                key={food.id}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => choose(food)}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--accent)_12%,transparent)] text-lime"><Icon name="fork" size={17}/></span>
                <span className="min-w-0 flex-1"><strong className="block text-sm">{food.name[locale]}</strong><small className="mt-0.5 block text-[10px] text-muted">{food.category[locale]} · {food.servings.length} {translate(locale, 'servingOptions')}</small></span>
                <span className="text-end"><strong className="block text-xs text-lime">{formatNumber(serving.calories, locale)}</strong><small className="text-[9px] text-muted">{translate(locale, 'kcal')}</small></span>
                {selected?.id === food.id && <span className="text-lime"><Icon name="check" size={17}/></span>}
              </button>
            )
          })}
          {results.length === 0 && <p className="px-3 py-4 text-center text-xs text-muted">{translate(locale, 'noFoodResults')}</p>}
          <div className="mt-1 border-t border-line pt-1">
            <button type="button" className="flex w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 py-2.5 text-start text-xs font-bold text-lime hover:bg-panel-raised" onMouseDown={(event) => event.preventDefault()} onClick={onCustom}><Icon name="plus" size={17}/>{translate(locale, 'addCustomFood')}</button>
          </div>
        </div>
      )}
    </div>
  )
}
