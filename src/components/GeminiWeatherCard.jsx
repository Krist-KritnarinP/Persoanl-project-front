import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiSun,
  FiRefreshCw,
  FiAlertCircle,
  FiTrash2,
  FiClock,
  FiMaximize2,
  FiX,
} from "react-icons/fi";
import { useLang } from "@/i18n";

function readable(text) {
  return String(text || "").replace(/\s*---DETAILS---\s*/g, "\n\n");
}

function ForecastModal({ entry, onClose, t }) {
  const dialog = useRef(null);
  useEffect(() => {
    const trigger = document.activeElement;
    dialog.current?.showModal();
    return () => trigger?.focus?.();
  }, []);
  const sections = readable(entry.text).split(/\n(?=D\d+\b)/);
  return createPortal(
    <dialog
      ref={dialog}
      onClose={onClose}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="modal p-4"
      aria-labelledby="weather-reader-title"
    >
      <div className="modal-box w-full max-w-3xl max-h-[85dvh] p-0 flex flex-col overflow-hidden">
        <header className="flex justify-between items-start gap-3 p-5 border-b border-base-content/10 shrink-0">
          <div>
            <h2 id="weather-reader-title" className="text-xl font-bold">
              {t("weather.fullDetails")}
            </h2>
            {entry.date && (
              <p className="text-sm text-base-content/70">{entry.date}</p>
            )}
          </div>
          <button
            type="button"
            autoFocus
            className="btn btn-ghost btn-sm btn-circle"
            aria-label={t("common.close")}
            onClick={onClose}
          >
            <FiX />
          </button>
        </header>
        <div
          className="min-h-0 overflow-y-auto p-5 space-y-4"
          data-testid="weather-reader-scroll"
          tabIndex={0}
        >
          <p className="text-sm text-base-content/70">
            {t("weather.estimateNote")}
          </p>
          {sections.map((section, i) => (
            <section
              key={i}
              className="rounded-xl border border-base-content/15 p-4 whitespace-pre-wrap break-words leading-relaxed text-base"
            >
              {section.split("\n").map((line, j) =>
                /^D\d+\b/.test(line) ? (
                  <h3 key={j} className="text-lg font-bold mb-2">
                    {line}
                  </h3>
                ) : (
                  <p key={j} className="mb-2">
                    {line}
                  </p>
                ),
              )}
            </section>
          ))}
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

export default function GeminiWeatherCard({
  tripId,
  weatherPrediction,
  weatherLoading,
  weatherError,
  onGetForecast,
  weatherHistory = [],
  onFetchHistory,
  onDeleteHistory,
}) {
  const { t, locale, lang } = useLang();
  const [selected, setSelected] = useState(null);
  useEffect(() => {
    if (tripId && onFetchHistory) onFetchHistory(tripId);
  }, [tripId, onFetchHistory]);
  const fmtDateTime = (iso) => {
    const d = new Date(iso);
    return Number.isFinite(d.getTime())
      ? d.toLocaleString(locale, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };
  return (
    <div
      className="glass glass-card p-5 rounded-3xl flex flex-col h-[32rem] max-h-[calc(100dvh-2rem)] shrink-0 space-y-4 shadow-xl border border-white/20 overflow-hidden"
      data-testid="weather-card"
    >
      <header className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <FiSun className="text-xl text-warning shrink-0" />
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight">
              {t("weather.title")}
            </h3>
            <span className="text-xs text-base-content/60">Gemini AI</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onGetForecast(tripId, lang)}
          disabled={weatherLoading}
          className="btn btn-warning btn-sm rounded-full gap-1 shrink-0"
        >
          <FiRefreshCw className={weatherLoading ? "animate-spin" : ""} />
          {weatherPrediction ? t("weather.update") : t("weather.predict")}
        </button>
      </header>
      <div
        className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3 text-sm sm:text-base"
        data-testid="weather-card-scroll"
        tabIndex={0}
      >
        <p className="text-xs text-base-content/70">
          {t("weather.estimateNote")}
        </p>
        {weatherLoading && (
          <div role="status" className="text-center py-8">
            <span className="loading loading-dots" />
            <p>{t("weather.analyzing")}</p>
          </div>
        )}
        {weatherError && !weatherLoading && (
          <div role="alert" className="alert alert-error">
            <FiAlertCircle />
            <span>
              {t(
                weatherError === "__QUOTA__"
                  ? "weather.quota"
                  : weatherError === "__SIZE__"
                    ? "weather.sizeLimit"
                    : "ui.aiFailed",
              )}
            </span>
          </div>
        )}
        {weatherPrediction && !weatherLoading && (
          <div className="space-y-2">
            <div
              className="rounded-2xl bg-base-100/30 border border-base-content/10 p-3 h-44 overflow-y-auto whitespace-pre-wrap break-words leading-relaxed"
              data-testid="weather-preview-scroll"
              tabIndex={0}
            >
              {readable(weatherPrediction)}
            </div>
            <button
              type="button"
              onClick={() => setSelected({ tripId, text: weatherPrediction })}
              className="btn btn-ghost btn-sm w-full"
            >
              <FiMaximize2 />
              {t("weather.fullDetails")}
            </button>
          </div>
        )}
        {!weatherPrediction &&
          !weatherLoading &&
          !weatherError &&
          !weatherHistory.length && (
            <p className="text-center py-8">{t("weather.empty")}</p>
          )}
        {weatherHistory.length > 0 && (
          <section className="space-y-2 pt-2 border-t border-base-content/10">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <FiClock />
              {t("weather.history")}
            </h4>
            {weatherHistory.map((entry) => (
              <div
                key={entry.id}
                className="border border-base-content/10 rounded-xl p-3 flex gap-2 items-start"
              >
                <button
                  type="button"
                  onClick={() =>
                    setSelected({
                      tripId,
                      text: entry.content,
                      date: fmtDateTime(entry.createdAt),
                    })
                  }
                  className="text-left min-w-0 flex-1 space-y-1"
                  aria-label={`${t("weather.readHistory")} ${fmtDateTime(entry.createdAt)}`}
                >
                  <span className="block text-xs text-base-content/60">
                    {fmtDateTime(entry.createdAt)}
                  </span>
                  <span className="block line-clamp-3 break-words whitespace-pre-line">
                    {readable(entry.content)}
                  </span>
                  <span className="block font-semibold underline text-sm">
                    {t("weather.readHistory")}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteHistory?.(entry.id)}
                  aria-label={t("weather.delHist")}
                  className="btn btn-ghost btn-xs btn-circle text-error shrink-0"
                >
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </section>
        )}
      </div>
      {selected && selected.tripId === tripId && (
        <ForecastModal
          entry={selected}
          onClose={() => setSelected(null)}
          t={t}
        />
      )}
    </div>
  );
}
