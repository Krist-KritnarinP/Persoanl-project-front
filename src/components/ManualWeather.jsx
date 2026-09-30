import { useId } from "react";
import { useLang } from "@/i18n";
import { WEATHER_CONDITIONS, WEATHER_DESCRIPTIONS } from "@/constants/manualWeather";

export function ManualWeatherFields({ value, onChange }) {
  const { t } = useLang();
  const id = useId();
  const update = (key, next) => onChange({ ...value, [key]: next });
  return (
    <fieldset className="min-w-0 rounded-2xl border border-base-content/15 bg-base-200/40 p-4 space-y-3">
      <legend className="px-2 text-sm font-semibold">{t("manualWeather.title")}</legend>
      <p className="text-xs leading-relaxed text-base-content/70">{t("manualWeather.hint")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="min-w-0">
          <label htmlFor={`${id}-condition`} className="block text-sm mb-1">{t("manualWeather.condition")}</label>
          <select id={`${id}-condition`} className="select select-bordered w-full min-w-0" value={value?.condition || ""} onChange={(e) => update("condition", e.target.value || null)}>
            <option value="">{t("manualWeather.none")}</option>
            {WEATHER_CONDITIONS.map(({ code, icon }) => <option key={code} value={code}>{icon} {t(`manualWeather.condition.${code}`)}</option>)}
          </select>
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-temp`} className="block text-sm mb-1">{t("manualWeather.temperature")}</label>
          <input id={`${id}-temp`} type="number" min={-100} max={70} step="any" inputMode="decimal" className="input input-bordered w-full" value={value?.temperatureC ?? ""} onChange={(e) => update("temperatureC", e.target.value)} aria-describedby={`${id}-range`} />
          <p id={`${id}-range`} className="text-xs text-base-content/65 mt-1">{t("manualWeather.range")}</p>
        </div>
      </div>
      <div>
        <label htmlFor={`${id}-preset`} className="block text-sm mb-1">{t("manualWeather.preset")}</label>
        <select id={`${id}-preset`} className="select select-bordered w-full" value={value?.descriptionCode || ""} onChange={(e) => update("descriptionCode", e.target.value || null)}>
          <option value="">{t("manualWeather.none")}</option>
          {WEATHER_DESCRIPTIONS.map((code) => <option key={code} value={code}>{t(`manualWeather.preset.${code}`)}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor={`${id}-note`} className="block text-sm mb-1">{t("manualWeather.note")}</label>
        <textarea id={`${id}-note`} rows={2} maxLength={1000} className="textarea textarea-bordered w-full" value={value?.description || ""} onChange={(e) => update("description", e.target.value)} />
      </div>
      {value && <button type="button" onClick={() => onChange(null)} className="btn btn-ghost btn-sm">{t("manualWeather.clear")}</button>}
    </fieldset>
  );
}

export function ManualWeatherSummary({ weather }) {
  const { t, locale } = useLang();
  if (!weather || (!weather.condition && weather.temperatureC == null && !weather.descriptionCode && !weather.description)) return null;
  const condition = WEATHER_CONDITIONS.find((item) => item.code === weather.condition);
  return (
    <div className="mt-2 min-w-0 text-sm rounded-xl bg-base-200/60 px-3 py-2 border border-base-content/10" data-testid="manual-weather-summary">
      <p className="text-xs text-base-content/65 mb-1">{t("manualWeather.title")}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {condition && <span><span aria-hidden="true">{condition.icon} </span>{t(`manualWeather.condition.${condition.code}`)}</span>}
        {weather.temperatureC != null && <span className="font-semibold">{new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(weather.temperatureC)} °C</span>}
        {weather.descriptionCode && <span>{t(`manualWeather.preset.${weather.descriptionCode}`)}</span>}
      </div>
      {weather.description && <p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-base-content/80">{weather.description}</p>}
    </div>
  );
}
