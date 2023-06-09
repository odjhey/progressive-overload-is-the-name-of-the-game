import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

export function toLocalDate(utcString: string) {
  dayjs.extend(utc)
  return dayjs.utc(utcString).toDate()
}

export function isWithinToday(date: Date) {
  return dayjs(date).isSame(dayjs(), 'day')
}
