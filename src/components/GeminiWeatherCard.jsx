import React, { useEffect, useState } from "react";
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

// แยก "สรุปไฮไลต์" กับ "รายละเอียดรายวัน" ออกจากกันด้วย marker ---DETAILS---
function splitForecast(text) {
  const parts = String(text || "").split(/\n---DETAILS---\n/);
  if (parts.length >= 2) {
    return {
      highlights: parts[0].trim(),
      details: parts.slice(1).join("\n---DETAILS---\n").trim(),
    };
  }
  return { highlights: String(text || "").trim(), details: "" };
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
  const { t, locale } = useLang();
  const [modalText, setModalText] = useState(null);

  useEffect(() => {
    if (tripId && onFetchHistory) onFetchHistory(tripId);
  }, [tripId]);

  const fmtDateTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleString(locale, {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // กล่องสรุปขนาดคงที่ + scroll (ไม่ขยายตามตัวอักษร) + ปุ่มเปิด modal รายละเอียด
  const ForecastBox = ({ text }) => {
    const { highlights, details } = splitForecast(text);
    return (
      <div className="space-y-2">
        <div className="rounded-2xl bg-white/10 border border-white/10 p-3 max-h-44 overflow-y-auto custom-scrollbar">
          <p className="text-sm sm:text-base whitespace-pre-line leading-relaxed">
            {highlights}
          </p>
        </div>
        {details && (
          <button
            onClick={() => setModalText(details)}
            className="btn btn-ghost btn-sm rounded-full gap-1.5 w-full glass"
          >
            <FiMaximize2 /> {t("weather.fullDetails")}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="glass glass-card p-5 rounded-3xl flex flex-col h-full max-h-[calc(100vh-2rem)] space-y-4 shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 rounded-xl bg-warning/20 text-warning shrink-0">
            <FiSun className="text-xl animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-base leading-tight truncate">
              {t("weather.title")}
            </h3>
            <span className="text-xs text-base-content/60">Gemini AI</span>
          </div>
        </div>

        <button
          onClick={() => onGetForecast(tripId)}
          disabled={weatherLoading}
          className="btn btn-warning btn-sm rounded-full gap-1 shadow-md hover:scale-105 transition-all shrink-0"
        >
          <FiRefreshCw className={weatherLoading ? "animate-spin" : ""} />
          {weatherPrediction ? t("weather.update") : t("weather.predict")}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar text-sm sm:text-base">
        {weatherLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <span className="loading loading-dots loading-md text-warning"></span>
            <p className="text-sm text-base-content/70 animate-pulse text-center px-2">
              {t("weather.analyzing")}
            </p>
          </div>
        )}

        {weatherError && !weatherLoading && (
          <div className="alert alert-error/20 border border-error/30 text-error text-sm sm:text-base p-3 rounded-2xl flex items-start gap-2">
            <FiAlertCircle className="text-lg shrink-0 mt-0.5" />
            <span>
              {weatherError === "__QUOTA__" ? t("weather.quota") : weatherError}
            </span>
          </div>
        )}

        {weatherPrediction && !weatherLoading && (
          <ForecastBox text={weatherPrediction} />
        )}

        {!weatherPrediction &&
          !weatherLoading &&
          !weatherError &&
          weatherHistory.length === 0 && (
            <div className="text-center py-8 opacity-60 space-y-2">
              <FiSun className="text-4xl mx-auto text-warning/50" />
              <p className="text-sm px-2">{t("weather.empty")}</p>
            </div>
          )}

        {/* History */}
        {weatherHistory.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-white/10">
            <h4 className="font-bold text-sm flex items-center gap-1.5">
              <FiClock className="text-warning" /> {t("weather.history")}
            </h4>
            {weatherHistory.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl bg-white/10 border border-white/10 p-3 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-base-content/60">
                    {fmtDateTime(m.createdAt)}
                  </span>
                  <button
                    onClick={() => onDeleteHistory && onDeleteHistory(m.id)}
                    title={t("weather.delHist")}
                    className="btn btn-ghost btn-xs btn-circle text-error/70 hover:text-error hover:bg-error/10 shrink-0"
                  >
                    <FiTrash2 className="text-sm" />
                  </button>
                </div>
                <ForecastBox text={m.content} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Details modal */}
      {modalText && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          onClick={() => setModalText(null)}
        >
          <div
            className="rounded-3xl bg-base-100 text-base-content border border-base-content/10 shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 pb-3 shrink-0">
              <h3 className="font-bold text-xl flex items-center gap-2">
                <FiSun className="text-warning" /> {t("weather.title")}
              </h3>
              <button
                onClick={() => setModalText(null)}
                className="btn btn-ghost btn-sm btn-circle"
                aria-label={t("common.close")}
              >
                <FiX />
              </button>
            </div>
            <div className="px-5 pb-5 overflow-y-auto custom-scrollbar">
              <p className="text-sm sm:text-base whitespace-pre-line leading-relaxed">
                {modalText}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
