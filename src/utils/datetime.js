/**
 * Shared date formatting.
 * Wide display format used across trip pages ("10 ธ.ค. 2569" / "Dec 10, 2026").
 * NOTE: Dashboard and ShareTripView intentionally keep their own versions —
 * their empty/invalid fallbacks differ. Do not merge time formatters just because they look similar.
 */

/**
 * Format an ISO date (or Date) as "10 ธ.ค. 2569".
 * Behavior matches the original TripsActivity/TripMapPage helpers exactly:
 * empty input -> fallback, invalid Date -> "Invalid Date" string (no guard).
 *
 * @param {string|Date} value - date input
 * @param {string} locale - e.g. "th-TH" from useLang()
 * @param {string} [fallback="-"] - returned when value is empty
 * @returns {string}
 */
export function formatTripDate(value, locale, fallback = "-") {
  if (!value) return fallback;
  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
