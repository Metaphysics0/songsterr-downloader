export function isToday(date1: Date, date2: Date): boolean {
  return new Date(date1).toDateString() === new Date(date2).toDateString();
}
