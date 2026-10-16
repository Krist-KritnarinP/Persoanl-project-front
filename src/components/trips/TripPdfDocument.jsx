import React, { useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { gmapsActivityUrl } from "@/utils/gmaps";
import { FiCalendar, FiClock, FiDollarSign, FiMapPin, FiNavigation } from "react-icons/fi";

const ACTIVITY_TYPE_DISPLAY = {
  ACCOMMODATION: {
    label: "ที่พัก",
    enLabel: "Accommodation",
    icon: "🏨",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  TRANSPORT: {
    label: "การเดินทาง",
    enLabel: "Transport",
    icon: "✈️",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  RESTAURANT: {
    label: "ร้านอาหาร",
    enLabel: "Dining",
    icon: "🍽️",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  ATTRACTION: {
    label: "สถานที่ท่องเที่ยว",
    enLabel: "Attraction",
    icon: "🏛️",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const WEATHER_ICONS = {
  clear: "🌤️",
  sunny: "☀️",
  partly_cloudy: "⛅",
  mostly_cloudy: "🌥️",
  overcast: "☁️",
  drizzle: "🌦️",
  rain: "🌧️",
  showers: "🌦️",
  heavy_rain: "🌧️",
  thunderstorm: "⛈️",
  snow: "🌨️",
  heavy_snow: "❄️",
  rain_snow: "🌨️",
  sleet: "🧊",
  freezing_rain: "🧊",
  hail: "🧊",
  fog: "🌫️",
  haze: "🌫️",
  windy: "💨",
  dust: "🏜️",
  smoke: "🌫️",
  other: "🌈",
};

export default function TripPdfDocument({
  trip,
  mode = "full", // "full" | "compact"
  options = { includeQr: true, includeCost: true, includeNotes: true },
  formatDate,
  formatZonedTime,
  t,
  locale = "th-TH",
}) {
  const { includeQr = true, includeCost = true, includeNotes = true } = options;

  const totalDays = trip?.days?.length || 0;
  const totalActivities = useMemo(
    () => trip?.days?.reduce((sum, d) => sum + (d.activities?.length || 0), 0) || 0,
    [trip?.days]
  );
  const totalCost = useMemo(
    () =>
      trip?.days?.reduce(
        (sum, d) =>
          sum +
          (d.activities?.reduce((s, a) => s + (Number(a.price) || 0), 0) || 0),
        0
      ) || 0,
    [trip?.days]
  );

  const getTypeMeta = (type) => {
    if (!type) return { label: "กิจกรรม", icon: "📍", badgeClass: "bg-slate-50 text-slate-700 border-slate-200" };
    const upper = String(type).toUpperCase();
    return (
      ACTIVITY_TYPE_DISPLAY[upper] || {
        label: type,
        icon: "📍",
        badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
      }
    );
  };

  const getWeatherMeta = (weather) => {
    if (!weather) return null;
    const condCode = weather.condition;
    const hasCond = Boolean(condCode);
    const hasTemp = weather.temperatureC !== "" && weather.temperatureC != null;
    const hasPreset = Boolean(weather.descriptionCode);
    const hasDesc = Boolean(weather.description && weather.description.trim());

    if (!hasCond && !hasTemp && !hasPreset && !hasDesc) return null;

    const icon = (hasCond && WEATHER_ICONS[condCode]) || "🌤️";
    const condLabel = hasCond
      ? (t ? t(`manualWeather.condition.${condCode}`) : condCode)
      : null;
    const tempStr = hasTemp ? `${weather.temperatureC}°C` : null;
    const presetLabel = hasPreset
      ? (t ? t(`manualWeather.preset.${weather.descriptionCode}`) : weather.descriptionCode)
      : null;
    const note = hasDesc ? weather.description.trim() : null;

    return {
      hasData: true,
      icon,
      condLabel,
      tempStr,
      presetLabel,
      note,
    };
  };

  const todayStr = useMemo(() => {
    return new Date().toLocaleDateString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [locale]);

  return (
    <div className="w-full bg-white text-slate-900 font-sans p-6 sm:p-8 leading-normal print:p-0">
      {/* ========================================================
          DOCUMENT HEADER
          ======================================================== */}
      <div className="border-b-2 border-emerald-700 pb-5 mb-6 pdf-avoid-break">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-emerald-700 uppercase">
              <span>✈️ AI LHOUNG TRAVEL PLANNER</span>
              <span className="text-slate-300">•</span>
              <span>{mode === "full" ? (t ? t("export.modeFull") : "แบบเต็ม") : (t ? t("export.modeCompact") : "แบบย่อ")}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {trip?.tripName || "แผนการเดินทาง"}
            </h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 pt-1">
              {trip?.destination && (
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                  <FiMapPin className="text-emerald-600 shrink-0" />
                  {trip.destination}
                </span>
              )}
              {(trip?.startDate || trip?.endDate) && (
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <FiCalendar className="text-emerald-600 shrink-0" />
                  {formatDate ? formatDate(trip?.startDate) : trip?.startDate} —{" "}
                  {formatDate ? formatDate(trip?.endDate) : trip?.endDate}
                </span>
              )}
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-3 shrink-0 self-start">
            <div className="text-center px-2">
              <span className="block text-[11px] text-slate-500 font-medium">ระยะเวลา</span>
              <span className="text-base font-extrabold text-slate-900">{totalDays} วัน</span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div className="text-center px-2">
              <span className="block text-[11px] text-slate-500 font-medium">กิจกรรม</span>
              <span className="text-base font-extrabold text-slate-900">{totalActivities} แห่ง</span>
            </div>
            {includeCost && totalCost > 0 && (
              <>
                <div className="w-px h-8 bg-slate-200" />
                <div className="text-center px-2">
                  <span className="block text-[11px] text-slate-500 font-medium">งบประมาณ</span>
                  <span className="text-base font-extrabold text-emerald-700">
                    {totalCost.toLocaleString()} ฿
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trip Description / Notes in Full mode */}
        {mode === "full" && includeNotes && trip?.tripDescription && (
          <div className="mt-4 p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
              <span>📋 รายละเอียดและบันทึกการเดินทาง:</span>
            </div>
            {trip.tripDescription}
          </div>
        )}
      </div>

      {/* ========================================================
          FULL MODE (แบบเต็ม)
          ======================================================== */}
      {mode === "full" && (
        <div className="space-y-6">
          {trip?.days?.map((day) => {
            const hasActivities = day.activities && day.activities.length > 0;
            return (
              <div key={day.id} className="space-y-3">
                {/* Day Header Banner */}
                <div className="flex flex-wrap items-center justify-between bg-slate-100 border-l-4 border-emerald-600 px-4 py-2.5 rounded-r-xl pdf-avoid-break gap-2">
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-base font-bold text-emerald-800">
                      Day {day.dayCount}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700">
                      {formatDate ? formatDate(day.dayDate) : day.dayDate}
                    </span>
                    {day.description && (
                      <span className="text-xs text-slate-500 hidden sm:inline">
                        — {day.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const dayWeather = getWeatherMeta(day.manualWeather);
                      if (!dayWeather) return null;
                      return (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-xs text-slate-700 shadow-2xs font-medium">
                          <span>{dayWeather.icon}</span>
                          {dayWeather.tempStr && (
                            <span className="font-bold text-slate-900">{dayWeather.tempStr}</span>
                          )}
                          {dayWeather.condLabel && (
                            <span className="text-slate-600 hidden md:inline">
                              {dayWeather.condLabel}
                            </span>
                          )}
                          {dayWeather.presetLabel && (
                            <span className="text-slate-500 hidden md:inline">
                              ({dayWeather.presetLabel})
                            </span>
                          )}
                        </span>
                      );
                    })()}
                    {day.activities?.length > 0 && (
                      <span className="text-xs text-slate-500 font-medium">
                        {day.activities.length} กิจกรรม
                      </span>
                    )}
                  </div>
                </div>

                {day.description && (
                  <p className="text-xs text-slate-600 px-2 sm:hidden pdf-avoid-break">
                    {day.description}
                  </p>
                )}

                {/* Day Activities */}
                {hasActivities ? (
                  <div className="space-y-3 pl-1 sm:pl-2">
                    {day.activities.map((act) => {
                      const meta = getTypeMeta(act.activityType);
                      const mapsUrl = gmapsActivityUrl(act, trip?.destination);
                      const timeStr = formatZonedTime
                        ? formatZonedTime(act.activityTime)
                        : act.activityTime;
                      const actWeather = getWeatherMeta(act.manualWeather);

                      return (
                        <div
                          key={act.id}
                          className="pdf-avoid-break flex items-start justify-between gap-4 p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                        >
                          {/* Left: Info */}
                          <div className="min-w-0 flex-1 space-y-1.5">
                            {/* Tags Bar */}
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              {timeStr && (
                                <span className="inline-flex items-center gap-1 font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                  <FiClock className="text-emerald-600 shrink-0 text-xs" />
                                  <span>{timeStr} น.</span>
                                </span>
                              )}
                              <span
                                className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md border text-[11px] ${meta.badgeClass}`}
                              >
                                <span>{meta.icon}</span>
                                <span>{meta.label}</span>
                              </span>
                              {includeCost && act.price > 0 && (
                                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                  <FiDollarSign className="text-amber-600 shrink-0" />
                                  <span>{Number(act.price).toLocaleString()} ฿</span>
                                </span>
                              )}
                              {actWeather && (
                                <span className="inline-flex items-center gap-1 text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md text-[11px] font-medium">
                                  <span>{actWeather.icon}</span>
                                  {actWeather.tempStr && (
                                    <span className="font-bold">{actWeather.tempStr}</span>
                                  )}
                                  {actWeather.condLabel && (
                                    <span>{actWeather.condLabel}</span>
                                  )}
                                  {actWeather.presetLabel && (
                                    <span className="text-sky-600">({actWeather.presetLabel})</span>
                                  )}
                                </span>
                              )}
                            </div>

                            {/* Location Name */}
                            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                              {act.locationName}
                            </h3>

                            {/* Description / Flight details / Notes */}
                            {includeNotes && act.description && (
                              <p className="text-xs sm:text-sm text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                                {act.description}
                              </p>
                            )}

                            {/* Weather note if present */}
                            {includeNotes && actWeather?.note && (
                              <div className="mt-1 text-xs text-sky-900 bg-sky-50/70 border border-sky-200/70 rounded-lg px-2.5 py-1.5 flex items-start gap-1.5 leading-relaxed">
                                <span className="shrink-0">{actWeather.icon}</span>
                                <div className="space-x-1">
                                  <span className="font-bold text-sky-950">สภาพอากาศ:</span>
                                  <span>{actWeather.note}</span>
                                </div>
                              </div>
                            )}

                            {/* Coordinates if available */}
                            {act.latitude && act.longitude && (
                              <div className="text-[11px] text-slate-400 pt-0.5">
                                📍 พิกัด: {Number(act.latitude).toFixed(5)}, {Number(act.longitude).toFixed(5)}
                              </div>
                            )}
                          </div>

                          {/* Right: Google Maps QR Code */}
                          {includeQr && (
                            <div className="shrink-0 text-center flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50 border border-slate-200 w-24">
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="สแกนหรือคลิกเพื่อเปิด Google Maps"
                                className="block bg-white p-1 rounded-lg border border-slate-200 shadow-2xs hover:scale-105 transition-transform"
                              >
                                <QRCodeSVG
                                  value={mapsUrl}
                                  size={64}
                                  level="M"
                                  includeMargin={false}
                                />
                              </a>
                              <a
                                href={mapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-1.5 text-[10px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5"
                              >
                                <span>แผนที่</span>
                                <FiNavigation className="text-[9px]" />
                              </a>
                              <span className="text-[9px] text-slate-400 leading-none">
                                สแกนเปิด
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic pl-3">
                    ไม่มีกิจกรรมในวันนี้
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          COMPACT MODE (แบบย่อ - รูปแบบตารางกระชับ)
          ======================================================== */}
      {mode === "compact" && (
        <div className="space-y-5">
          {trip?.days?.map((day) => {
            const hasActivities = day.activities && day.activities.length > 0;
            return (
              <div key={day.id} className="space-y-2">
                {/* Day Header */}
                <div className="flex items-center justify-between border-b border-emerald-600 pb-1 pdf-avoid-break">
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-emerald-800 text-sm">
                      Day {day.dayCount}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      ({formatDate ? formatDate(day.dayDate) : day.dayDate})
                    </span>
                    {day.description && (
                      <span className="text-xs text-slate-500 truncate max-w-md">
                        — {day.description}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const dayWeather = getWeatherMeta(day.manualWeather);
                      if (!dayWeather) return null;
                      return (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          <span>{dayWeather.icon}</span>
                          {dayWeather.tempStr && <span className="font-bold">{dayWeather.tempStr}</span>}
                          {dayWeather.condLabel && <span className="hidden sm:inline">{dayWeather.condLabel}</span>}
                        </span>
                      );
                    })()}
                    {day.activities?.length > 0 && (
                      <span className="text-[11px] text-slate-500">
                        {day.activities.length} รายการ
                      </span>
                    )}
                  </div>
                </div>

                {hasActivities ? (
                  <table className="w-full text-left text-xs border-collapse border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                        <th className="py-2 px-2.5 w-16 text-center">เวลา</th>
                        <th className="py-2 px-2.5">สถานที่ & กำหนดการ</th>
                        <th className="py-2 px-2.5 w-28 text-center">หมวดหมู่</th>
                        {includeCost && (
                          <th className="py-2 px-2.5 w-20 text-right">ค่าใช้จ่าย</th>
                        )}
                        {includeQr && (
                          <th className="py-2 px-2 w-16 text-center">QR แผนที่</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {day.activities.map((act) => {
                        const meta = getTypeMeta(act.activityType);
                        const mapsUrl = gmapsActivityUrl(act, trip?.destination);
                        const timeStr = formatZonedTime
                          ? formatZonedTime(act.activityTime)
                          : act.activityTime;
                        const actWeather = getWeatherMeta(act.manualWeather);

                        return (
                          <tr key={act.id} className="pdf-avoid-break hover:bg-slate-50/50">
                            {/* Time */}
                            <td className="py-2 px-2.5 text-center font-bold text-slate-800 whitespace-nowrap align-top">
                              {timeStr || "-"}
                            </td>

                            {/* Location & Short Details */}
                            <td className="py-2 px-2.5 align-top">
                              <div className="font-bold text-slate-900">
                                {act.locationName}
                              </div>
                              {act.description && (
                                <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                                  {act.description}
                                </div>
                              )}
                              {actWeather && (
                                <div className="text-[10px] text-sky-800 flex flex-wrap items-center gap-1 mt-1 font-medium">
                                  <span>{actWeather.icon}</span>
                                  {actWeather.tempStr && (
                                    <span className="font-bold">{actWeather.tempStr}</span>
                                  )}
                                  {actWeather.condLabel && <span>{actWeather.condLabel}</span>}
                                  {actWeather.presetLabel && (
                                    <span className="text-sky-600">({actWeather.presetLabel})</span>
                                  )}
                                  {actWeather.note && (
                                    <span className="text-slate-500 truncate max-w-xs">• {actWeather.note}</span>
                                  )}
                                </div>
                              )}
                            </td>

                            {/* Type */}
                            <td className="py-2 px-2.5 text-center align-top whitespace-nowrap">
                              <span
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${meta.badgeClass}`}
                              >
                                <span>{meta.icon}</span>
                                <span>{meta.label}</span>
                              </span>
                            </td>

                            {/* Cost */}
                            {includeCost && (
                              <td className="py-2 px-2.5 text-right font-medium text-slate-800 whitespace-nowrap align-top">
                                {act.price > 0
                                  ? `${Number(act.price).toLocaleString()} ฿`
                                  : "-"}
                              </td>
                            )}

                            {/* QR Code */}
                            {includeQr && (
                              <td className="py-1 px-2 text-center align-middle">
                                <a
                                  href={mapsUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="คลิกหรือสแกนเพื่อเปิด Google Maps"
                                  className="inline-block p-1 bg-white border border-slate-200 rounded shadow-2xs hover:scale-105 transition-transform"
                                >
                                  <QRCodeSVG
                                    value={mapsUrl}
                                    size={42}
                                    level="L"
                                    includeMargin={false}
                                  />
                                </a>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-xs text-slate-400 italic py-1">
                    ไม่มีกิจกรรมในวันนี้
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          DOCUMENT FOOTER
          ======================================================== */}
      <div className="border-t border-slate-200 mt-8 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2 pdf-avoid-break">
        <span>
          {t ? t("export.generatedBy") : "สร้างโดย AI LHOUNG Travel Planner"} • ออกเมื่อ {todayStr}
        </span>
        <span className="text-[11px]">
          สแกน QR Code ด้วยกล้องสมาร์ตโฟนเพื่อเปิดนำทางใน Google Maps ได้ทันที
        </span>
      </div>
    </div>
  );
}
