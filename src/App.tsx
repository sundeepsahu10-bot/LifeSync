
import { useRef, useState } from 'react'
import './App.css'
import { DashboardHeader } from './components/DashboardHeader'
import { PrioritiesSection, UpcomingSection } from './components/ItemSections'
import { QuickAdd } from './components/QuickAdd'
import { SectionPage } from './components/SectionPage'
import { Sidebar } from './components/Sidebar'
import { SummaryCards } from './components/SummaryCards'
import { createSampleItems } from './data/sampleItems'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTheme } from './hooks/useTheme'
import { toISODate } from './lib/dates'
import {
  CATEGORY_LABELS,
  type ItemCategory,
  type LifeItem,
  type PageId,
} from './types'

type DashboardFilter = 'all' | ItemCategory

const DASHBOARD_FILTERS: { label: string; value: DashboardFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Bills', value: 'bill' },
  { label: 'Subscriptions', value: 'subscription' },
  { label: 'Documents', value: 'document' },
  { label: 'Events', value: 'event' },
]

function App() {
  const { theme, setTheme } = useTheme()
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard')

  // Capture today's date when the app loads.
  const [now] = useState(() => new Date())
  const today = toISODate(now)

  // Load saved items from localStorage, or use sample items initially.
  const [items, setItems] = useLocalStorage<LifeItem[]>(
    'lifeos-items',
    createSampleItems(now),
  )

  const [query, setQuery] = useState('')
  const [dashboardFilter, setDashboardFilter] =
    useState<DashboardFilter>('all')
  const nextId = useRef(0)

  const normalizedQuery = query.trim().toLowerCase()
  const isSearchActive = normalizedQuery.length > 0
  const isFiltered = isSearchActive || dashboardFilter !== 'all'

  // Search filters displayed items without changing saved data.
  const matchesQuery = (item: LifeItem) =>
    !isSearchActive ||
    [item.title, item.detail ?? '', CATEGORY_LABELS[item.category]].some(
      (text) => text.toLowerCase().includes(normalizedQuery),
    )

  // Category chips apply only to the dashboard.
  const matchesDashboardFilter = (item: LifeItem) =>
    dashboardFilter === 'all' || item.category === dashboardFilter

  const matchesDashboardView = (item: LifeItem) =>
    matchesQuery(item) && matchesDashboardFilter(item)

  const todayItems = items.filter((item) => item.dueDate === today)
  const remainingToday = todayItems.filter((item) => !item.done).length

  
  const upcomingItems = items
    .filter((item) => item.dueDate !== today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))


  function handleToggle(id: string) {
    const completedDate = toISODate(new Date())

    setItems((current) =>
      current.map((item) => {
        if (item.id !== id) return item

        const done = !item.done

        return {
          ...item,
          done,
          completedAt: done ? completedDate : undefined,
        }
      }),
    )
  }

  function handleAdd(
    title: string,
    dueDate: string,
    category: ItemCategory,
  ) {
    nextId.current += 1

    const newItem: LifeItem = {
      id: `user-${nextId.current}`,
      title,
      category,
      dueDate,
      done: false,
    }

    setItems((current) => [...current, newItem])
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      <Sidebar
        theme={theme}
        onThemeChange={setTheme}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />

      <div className="app-main">
        <div className="app-content">
          <DashboardHeader
            now={now}
            query={query}
            onQueryChange={setQuery}
          />

          <main id="main-content" className="dashboard">
            {currentPage === 'dashboard' ? (
              <>
                <SummaryCards items={items} today={today} />

                <div
                  className="dashboard-filters"
                  role="group"
                  aria-label="Filter dashboard by category"
                >
                  {DASHBOARD_FILTERS.map((filter) => (
                    <button
                      key={filter.value}
                      type="button"
                      className="filter-chip"
                      aria-pressed={dashboardFilter === filter.value}
                      onClick={() => setDashboardFilter(filter.value)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                <div className="dashboard-grid">
                  <div className="dashboard-col">
                    <PrioritiesSection
                      items={todayItems.filter(matchesDashboardView)}
                      today={today}
                      remaining={remainingToday}
                      isFiltered={isFiltered}
                      onToggle={handleToggle}
                    />

                    <UpcomingSection
                      items={upcomingItems.filter(matchesDashboardView)}
                      today={today}
                      isFiltered={isFiltered}
                      onToggle={handleToggle}
                    />
                  </div>

                  <QuickAdd today={today} onAdd={handleAdd} />
                </div>
              </>
            ) : (
              <SectionPage
                page={currentPage}
                items={items.filter(matchesQuery)}
                today={today}
                isFiltered={isSearchActive}
                onToggle={handleToggle}
                onAdd={handleAdd}
              />
            )}
          </main>

          <footer className="site-footer">
            <p>Made by Sundeep</p>
          </footer>
        </div>
      </div>
    </div>
  )
}

export default App
