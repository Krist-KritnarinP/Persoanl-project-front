// Compare calendar dates, not midnight timestamps (the end day stays ongoing).
export const dateKey = (value) =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)
    ? value.slice(0, 10)
    : null;
export function localToday(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
export function travelStatus(start, end, today = localToday()) {
  const from = dateKey(start),
    to = dateKey(end) || from;
  if (!from || to < from) return "undated";
  return today < from ? "upcoming" : today > to ? "past" : "ongoing";
}
export function calendarDays(month) {
  const year = month.getFullYear(),
    index = month.getMonth();
  const first = new Date(year, index, 1);
  return Array.from(
    { length: 42 },
    (_, i) => new Date(year, index, i - first.getDay() + 1),
  );
}
export function tripsOnDate(trips, date) {
  return trips.filter((trip) => {
    const start = dateKey(trip.startDate),
      end = dateKey(trip.endDate) || start;
    return start && start <= date && date <= end;
  });
}
