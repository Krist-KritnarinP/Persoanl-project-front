import React from "react";
import { FiSun, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

export default function GeminiWeatherCard({
  tripId,
  weatherPrediction,
  weatherLoading,
  weatherError,
  onGetForecast,
}) {
  return (
    <div className="glass glass-card p-5 rounded-3xl flex flex-col h-full max-h-[calc(100vh-2rem)] space-y-4 shadow-xl border border-white/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-warning/20 text-warning">
            <FiSun className="text-xl animate-spin-slow" />
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight">พยากรณ์อากาศ AI</h3>
            <span className="text-[10px] text-base-content/60">Powered by My friend</span>
          </div>
        </div>

        <button
          onClick={() => onGetForecast(tripId)}
          disabled={weatherLoading}
          className="btn btn-warning btn-xs rounded-full gap-1 shadow-md hover:scale-105 transition-all"
        >
          <FiRefreshCw className={weatherLoading ? "animate-spin" : ""} />
          {weatherPrediction ? "อัปเดต" : "ทำนาย"}
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar text-sm">
        {weatherLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <span className="loading loading-dots loading-md text-warning"></span>
            <p className="text-xs text-base-content/70 animate-pulse">
              AI กำลังวิเคราะห์สภาพอากาศ...
            </p>
          </div>
        )}

        {weatherError && !weatherLoading && (
          <div className="alert alert-error/20 border border-error/30 text-error text-xs p-3 rounded-2xl flex items-start gap-2">
            <FiAlertCircle className="text-base shrink-0 mt-0.5" />
            <span>{weatherError}</span>
          </div>
        )}

        {weatherPrediction && !weatherLoading && (
          <div className="prose prose-sm max-w-none text-base-content/90 space-y-2 whitespace-pre-line leading-relaxed">
            {weatherPrediction}
          </div>
        )}

        {!weatherPrediction && !weatherLoading && !weatherError && (
          <div className="text-center py-8 opacity-60 space-y-2">
            <FiSun className="text-4xl mx-auto text-warning/50" />
            <p className="text-xs">
              กดปุ่ม <b>"ทำนาย"</b> ด้านบนเพื่อวิเคราะห์สภาพอากาศสำหรับทริปนี้
            </p>
          </div>
        )}
      </div>
    </div>
  );
}