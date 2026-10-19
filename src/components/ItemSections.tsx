
import { formatDueLabel } from '../lib/dates'
import {
  CATEGORY_LABELS,
  CATEGORY_TONES,
  type ItemCategory,
  type LifeItem,
} from '../types'

function CategoryBadge({ category }: { category: ItemCategory }) {
  const tone = CATEGORY_TONES[category]

  return (
    <span className={tone === 'neutral' ? 'badge' : `badge badge-${tone}`}>
      {CATEGORY_LABELS[category]}
    </span>
  )
}

function UrgencyBadge({
  item,
  today,
}: {
  item: LifeItem
  today: string
}) {
  if (item.done) return null

  if (item.dueDate < today) {
    return <span className="urgency-badge urgency-overdue">Overdue</span>
  }

  if (item.dueDate === today) {
    return <span className="urgency-badge urgency-today">Due today</span>
  }

  return <span className="urgency-badge urgency-upcoming">Upcoming</span>
}

interface PrioritiesSectionProps {
  items: LifeItem[]
  today: string
  remaining: number
  isFiltered: boolean
  onToggle: (id: string) => void
}

export function PrioritiesSection({
  items,
  today,
  remaining,
  isFiltered,
  onToggle,
}: PrioritiesSectionProps) {
  return (
    <section className="card panel" aria-labelledby="priorities-title">
      <div className="panel-head">
        <h2 id="priorities-title">Today&rsquo;s priorities</h2>
        <p className="text-muted text-small">{remaining} left</p>
      </div>

      {items.length === 0 ? (
        <p className="empty">
          {isFiltered
            ? 'No priorities match your search.'
            : 'Nothing due today. Use Quick add to create a reminder.'}
        </p>
      ) : (
        <ul className="item-list">
          {items.map((item) => {
            const inputId = `priority-${item.id}`

            return (
              <li className="item" key={item.id} data-done={item.done}>
                <input
                  id={inputId}
                  className="item-check"
                  type="checkbox"
                  checked={item.done}
                  onChange={() => onToggle(item.id)}
                />

                <div className="item-body">
                  <label htmlFor={inputId} className="item-title">
                    {item.title}
                  </label>

                  {item.detail && (
                    <span className="item-meta">{item.detail}</span>
                  )}
                </div>

                <div className="item-badges">
                  <UrgencyBadge item={item} today={today} />
                  <CategoryBadge category={item.category} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}



interface UpcomingSectionProps {
  items: LifeItem[]
  today: string
  isFiltered: boolean
  onToggle: (id: string) => void
}
export function UpcomingSection({
  items,
  today,
  isFiltered,
  onToggle,
}: UpcomingSectionProps) {
  return (
    <section className="card panel" aria-labelledby="upcoming-title">
      <div className="panel-head">
        <h2 id="upcoming-title">Overdue &amp; upcoming</h2>
      </div>

      {items.length === 0 ? (
        <p className="empty">
          {isFiltered
            ? 'No upcoming items match your search.'
            : 'Nothing coming up yet.'}
        </p>
      ) : (
        
      <ul className="item-list">
        {items.map((item) => {
          const inputId = `upcoming-${item.id}`

          return (
            <li className="item" key={item.id} data-done={item.done}>
              <input
                id={inputId}
                className="item-check"
                type="checkbox"
                checked={item.done}
                onChange={() => onToggle(item.id)}
              />

              <div className="item-body">
                <label htmlFor={inputId} className="item-title">
                  {item.title}
                </label>

                <span className="item-meta">
                  <time dateTime={item.dueDate}>
                    {formatDueLabel(item.dueDate, today)}
                  </time>
                  {item.detail ? ` · ${item.detail}` : ''}
                </span>
              </div>

              <div className="item-badges">
                <UrgencyBadge item={item} today={today} />
                <CategoryBadge category={item.category} />
              </div>
            </li>
          )
        })}
      </ul>

      )}
    </section>
  )
}
