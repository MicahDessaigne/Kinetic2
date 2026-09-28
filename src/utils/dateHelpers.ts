import {
  format,
  parseISO,
  startOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  isSameDay,
  isToday as fnsIsToday,
  differenceInCalendarDays,
} from 'date-fns'

export const DATE_FMT = 'yyyy-MM-dd'

/** Today's date as 'YYYY-MM-DD' in local time. */
export function todayKey(): string {
  return format(new Date(), DATE_FMT)
}

/** Convert a Date to 'YYYY-MM-DD'. */
export function toKey(date: Date): string {
  return format(date, DATE_FMT)
}

/** Parse a 'YYYY-MM-DD' key to a local Date (at midnight). */
export function fromKey(key: string): Date {
  return parseISO(key)
}

/** Day of week index 0=Sun..6=Sat for a date key. */
export function dowFromKey(key: string): number {
  return fromKey(key).getDay()
}

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const WEEKDAY_LABELS_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function isTodayKey(key: string): boolean {
  return fnsIsToday(fromKey(key))
}

export function isFutureKey(key: string): boolean {
  return differenceInCalendarDays(fromKey(key), new Date()) > 0
}

export function isPastKey(key: string): boolean {
  return differenceInCalendarDays(fromKey(key), new Date()) < 0
}

/** Human greeting based on current hour. */
export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

export function prettyDate(key: string): string {
  return format(fromKey(key), 'EEEE, MMMM d')
}

export function prettyDateShort(key: string): string {
  return format(fromKey(key), 'MMM d, yyyy')
}

export function prettyTime(time: string | null): string {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return format(d, 'h:mm a')
}

/** Array of 7 date-keys for the week containing `date` (week starts Sunday). */
export function weekKeys(date: Date = new Date()): string[] {
  const start = startOfWeek(date, { weekStartsOn: 0 })
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(start, i)))
}

/**
 * Grid of date-keys for a month view. Returns 6 rows x 7 cols (42 cells),
 * padded with leading/trailing days from adjacent months.
 */
export function monthGrid(year: number, month: number): string[] {
  const first = new Date(year, month, 1)
  const gridStart = startOfWeek(startOfMonth(first), { weekStartsOn: 0 })
  return Array.from({ length: 42 }, (_, i) => toKey(addDays(gridStart, i)))
}

export function monthLabel(year: number, month: number): string {
  return format(new Date(year, month, 1), 'MMMM yyyy')
}

export function isInMonth(key: string, year: number, month: number): boolean {
  const d = fromKey(key)
  return d.getFullYear() === year && d.getMonth() === month
}

export function dayNumber(key: string): number {
  return fromKey(key).getDate()
}

export { isSameDay, endOfMonth, startOfMonth, addDays, differenceInCalendarDays }

export function formatSeconds(total: number): string {
  const s = Math.max(0, Math.floor(total))
  const hh = Math.floor(s / 3600)
  const mm = Math.floor((s % 3600) / 60)
  const ss = s % 60
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}`
}
