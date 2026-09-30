import test from "node:test";
import assert from "node:assert/strict";
import { normalizeManualWeather, WEATHER_CONDITIONS, WEATHER_DESCRIPTIONS } from "../src/constants/manualWeather.js";
import { manualWeatherTranslations } from "../src/i18n/manualWeather.js";
test("manual observations distinguish empty, zero, negative and description-only data", () => {
  assert.equal(normalizeManualWeather({temperatureC:"",description:" "}),null);
  assert.equal(normalizeManualWeather(null),null);
  assert.equal(normalizeManualWeather({temperatureC:"0"}).temperatureC,0);
  assert.equal(normalizeManualWeather({temperatureC:"-2.5"}).temperatureC,-2.5);
  assert.equal(normalizeManualWeather({description:" rain later "}).description,"rain later");
  for (const lang of Object.values(manualWeatherTranslations)) {
    for (const {code} of WEATHER_CONDITIONS) assert.ok(lang[`manualWeather.condition.${code}`]);
    for (const code of WEATHER_DESCRIPTIONS) assert.ok(lang[`manualWeather.preset.${code}`]);
  }
});
