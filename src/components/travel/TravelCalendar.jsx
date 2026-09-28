import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLang } from "@/i18n";
import { calendarDays, localToday, tripsOnDate } from "@/utils/travelOverview";
export default function TravelCalendar({ trips, selected, onSelect }) {
  const { t, locale } = useLang();
  const [month, setMonth] = useState(() => new Date());
  const days = calendarDays(month);
  return (
    <section className="rounded-2xl bg-base-100 border border-base-content/10 p-4 sm:p-5 space-y-4">
      <div className="flex justify-between items-center gap-2">
        <h2 className="font-bold">{t("travel.calendar")}</h2>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setMonth(new Date());
            onSelect(null);
          }}
        >
          {t("travel.today")}
        </button>
      </div>
      <div className="flex justify-between items-center">
        <button
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={t("travel.prev")}
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
          }
        >
          <FiChevronLeft />
        </button>
        <strong>
          {month.toLocaleDateString(locale, { month: "long", year: "numeric" })}
        </strong>
        <button
          className="btn btn-ghost btn-circle btn-sm"
          aria-label={t("travel.next")}
          onClick={() =>
            setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
          }
        >
          <FiChevronRight />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.slice(0, 7).map((d) => (
          <span
            key={localToday(d)}
            className="text-center text-xs text-base-content/60 py-2"
          >
            {d.toLocaleDateString(locale, { weekday: "short" })}
          </span>
        ))}
        {days.map((d) => {
          const key = localToday(d),
            matches = tripsOnDate(trips, key);
          return (
            <button
              key={key}
              aria-label={`${key} · ${matches.length} ${t("dash.tripsUnit")}`}
              aria-pressed={selected === key}
              onClick={() => onSelect(selected === key ? null : key)}
              className={`min-h-12 rounded-lg flex flex-col items-center justify-center gap-1 border ${selected === key ? "bg-primary text-primary-content border-primary" : matches.length ? "bg-primary/10 border-primary/30" : "border-transparent"} ${d.getMonth() !== month.getMonth() ? "opacity-40" : ""}`}
            >
              <span
                className={key === localToday() ? "font-black underline" : ""}
              >
                {d.getDate()}
              </span>
              <span
                className={`h-1 w-1 rounded-full ${matches.length ? "bg-current" : ""}`}
              />
            </button>
          );
        })}
      </div>
      <p className="text-xs text-base-content/60">{t("travel.calendarHint")}</p>
    </section>
  );
}
