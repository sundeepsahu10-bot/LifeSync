
import { Icon } from './Icon'
import { toISODate } from '../lib/dates'
import type { LifeItem } from '../types'

interface SummaryCardsProps {
  items: LifeItem[]
  today: string
}

const DAY_MS = 24 * 60 * 60 * 1000

function getDayDifference(date: string, today: string) {
  const dateTime = new Date(`${date}T00:00:00`).getTime()
  const todayTime = new Date(`${today}T00:00:00`).getTime()
  return Math.round((dateTime - todayTime) / DAY_MS)
}

export function SummaryCards({ items, today }: SummaryCardsProps) {
  const todayItems = items.filter((item) => item.dueDate === today)
  const completedTodayItems = todayItems.filter((item) => item.done)
  const remainingToday = todayItems.length - completedTodayItems.length

  const overdueItems = items.filter(
    (item) => !item.done && item.dueDate < today,
  )

  const nextSevenDays = items.filter((item) => {
    const days = getDayDifference(item.dueDate, today)
    return !item.done && days >= 1 && days <= 7
  })

  const actualToday = toISODate(new Date())
  const completedOnDate = items.filter(
    (item) => item.done && item.completedAt === actualToday,
  )

  const progress =
    todayItems.length === 0
      ? 0
      : Math.round((completedTodayItems.length / todayItems.length) * 100)

  const metrics = [
    {
      label: 'Due today',
      value: remainingToday,
      hint:
        todayItems.length === 0
          ? 'Nothing due today'
          : `${completedTodayItems.length} of ${todayItems.length} completed`,
      icon: 'clock',
      tone: 'primary',
    },
    {
      label: 'Overdue',
      value: overdueItems.length,
      hint: overdueItems.length === 0 ? 'All caught up' : 'Needs attention',
      icon: 'clock',
      tone: 'danger',
    },
    {
      label: 'Next 7 days',
      value: nextSevenDays.length,
      hint: 'Upcoming unfinished items',
      icon: 'calendar',
      tone: 'secondary',
    },
    {
      label: 'Completed today',
      value: completedOnDate.length,
      hint: 'Items checked off today',
      icon: 'clock',
      tone: 'success',
    },
  ] as const

  return (
    <>
      <section className="summary-grid" aria-label="Summary">
        {metrics.map((metric, index) => (
          <article
            className={`card stat stat-${metric.tone}${index === 0 ? ' stat-featured' : ''}`}
            key={metric.label}
          >
            <div className="stat-head">
              <p className="stat-label">{metric.label}</p>
              <span className={`stat-icon stat-icon-${metric.tone}`}>
                <Icon name={metric.icon} size={18} />
              </span>
            </div>
            <p className="stat-value">{metric.value}</p>
            <p className="stat-hint">{metric.hint}</p>
          </article>
        ))}
      </section>

      <section className="card progress-card" aria-labelledby="daily-progress-title">
        <div className="progress-copy">
          <p className="eyebrow">YOUR DAY</p>
          <h2 id="daily-progress-title">Daily progress</h2>
          <p className="stat-hint">
            {todayItems.length === 0
              ? 'Add a priority to start your day.'
              : `${completedTodayItems.length} of ${todayItems.length} tasks completed`}
          </p>
        </div>

        <div
          className="progress-ring"
          role="img"
          aria-label={`${progress}% of today's tasks completed`}
          style={{ '--progress-value': `${progress}%` } as React.CSSProperties}
        >
          <div className="progress-ring-inner">
            <strong>{progress}%</strong>
            <span>{completedTodayItems.length} of {todayItems.length} done</span>
          </div>
        </div>
      </section>
    </>
  )
}
