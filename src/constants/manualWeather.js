export const WEATHER_CONDITIONS = [
  {
    "code": "clear",
    "icon": "🌤️"
  },
  {
    "code": "sunny",
    "icon": "☀️"
  },
  {
    "code": "partly_cloudy",
    "icon": "⛅"
  },
  {
    "code": "mostly_cloudy",
    "icon": "🌥️"
  },
  {
    "code": "overcast",
    "icon": "☁️"
  },
  {
    "code": "drizzle",
    "icon": "🌦️"
  },
  {
    "code": "rain",
    "icon": "🌧️"
  },
  {
    "code": "showers",
    "icon": "🌦️"
  },
  {
    "code": "heavy_rain",
    "icon": "🌧️"
  },
  {
    "code": "thunderstorm",
    "icon": "⛈️"
  },
  {
    "code": "snow",
    "icon": "🌨️"
  },
  {
    "code": "heavy_snow",
    "icon": "❄️"
  },
  {
    "code": "rain_snow",
    "icon": "🌨️"
  },
  {
    "code": "sleet",
    "icon": "🧊"
  },
  {
    "code": "freezing_rain",
    "icon": "🧊"
  },
  {
    "code": "hail",
    "icon": "🧊"
  },
  {
    "code": "fog",
    "icon": "🌫️"
  },
  {
    "code": "haze",
    "icon": "🌫️"
  },
  {
    "code": "windy",
    "icon": "💨"
  },
  {
    "code": "dust",
    "icon": "🏜️"
  },
  {
    "code": "smoke",
    "icon": "🌫️"
  },
  {
    "code": "other",
    "icon": "🌈"
  }
];
export const WEATHER_DESCRIPTIONS = ["comfortable", "hot", "very_hot", "cool", "cold", "freezing", "humid", "dry", "light_breeze", "gusts", "calm", "intermittent_rain", "low_visibility", "slippery", "changing"];

// Blank temperature stays null; zero and negative temperatures are observations.
export function normalizeManualWeather(value) {
  if (!value) return null;
  const condition = value.condition || null;
  const temperatureC = value.temperatureC === "" || value.temperatureC == null ? null : Number(value.temperatureC);
  const descriptionCode = value.descriptionCode || null;
  const description = (value.description || "").trim();
  return condition || temperatureC !== null || descriptionCode || description
    ? { condition, temperatureC, descriptionCode, description } : null;
}
