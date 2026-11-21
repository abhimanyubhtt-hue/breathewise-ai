export const defaultCity = { name: "New Delhi", lat: 28.6139, lon: 77.209 };
export const cities = [
  defaultCity,
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];

export const pollutantKeys = ["pm25", "pm10", "no2", "ozone", "co", "so2"] as const;
export type Pollutant = (typeof pollutantKeys)[number];
export type PollutantReadings = Record<Pollutant, number | null>;
export type PollutantIndices = Record<Pollutant, number | null>;
export const pollutantLabels: Record<Pollutant, string> = {
  pm25: "PM2.5",
  pm10: "PM10",
  no2: "NO₂",
  ozone: "Ozone",
  co: "CO",
  so2: "SO₂",
};

export function isValidReading(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function deriveUsAqi(
  concentrations: PollutantReadings,
  indices: PollutantIndices,
): { aqi: number | null; dominantPollutant: Pollutant | null; aqiByPollutant: PollutantIndices } {
  const aqiByPollutant = Object.fromEntries(
    pollutantKeys.map((key) => [
      key,
      isValidReading(concentrations[key]) && isValidReading(indices[key]) ? indices[key] : null,
    ]),
  ) as PollutantIndices;
  const dominant = pollutantKeys.reduce<Pollutant | null>((highest, key) => {
    const candidate = aqiByPollutant[key];
    if (candidate === null) return highest;
    return highest === null || candidate > (aqiByPollutant[highest] ?? -1) ? key : highest;
  }, null);

  return {
    aqi: dominant === null ? null : Math.round(aqiByPollutant[dominant] ?? 0),
    dominantPollutant: dominant,
    aqiByPollutant,
  };
}

export function aqiStatus(value: number | null) {
  if (!isValidReading(value))
    return {
      label: "Unavailable",
      tone: "muted",
      advice:
        "Forecast data is unavailable. Check your local monitoring authority before planning outdoor activities.",
    };
  if (value <= 50)
    return {
      label: "Good",
      tone: "good",
      advice:
        "Air quality is generally acceptable. Enjoy outdoor activities while keeping an eye on changing conditions.",
    };
  if (value <= 100)
    return {
      label: "Moderate",
      tone: "moderate",
      advice: "Unusually sensitive people should consider reducing prolonged outdoor exertion.",
    };
  if (value <= 150)
    return {
      label: "Unhealthy for sensitive groups",
      tone: "warning",
      advice:
        "Children, older adults, and people with heart or lung conditions should reduce prolonged outdoor exertion.",
    };
  if (value <= 200)
    return {
      label: "Unhealthy",
      tone: "warning",
      advice: "Reduce prolonged outdoor exertion. Children and older adults should choose indoor activities.",
    };
  if (value <= 300)
    return {
      label: "Very unhealthy",
      tone: "danger",
      advice: "Avoid strenuous outdoor activity. Keep vulnerable family members indoors and use filtered indoor air.",
    };
  return {
    label: "Hazardous",
    tone: "danger",
    advice: "Avoid outdoor physical activity. Stay in a room with filtered air when possible.",
  };
}

export const factors = { car: 0.192, metro: 0.041, cycling: 0, carpool: 0.064 } as const;
export function emissions(distance: number, mode: keyof typeof factors) {
  return Number.isFinite(distance) ? Math.max(0, distance) * factors[mode] : 0;
}

export function clampMemberCount(value: number, minimum = 0) {
  if (!Number.isFinite(value)) return minimum;
  return Math.max(minimum, Math.min(20, Math.trunc(value)));
}

export function clampJourneyDistance(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(500, value));
}

export type Hour = {
  time: string;
  aqi: number | null;
  dominantPollutant: Pollutant | null;
  aqiByPollutant: PollutantIndices;
} & PollutantReadings;

export function bestWindow(hours: Hour[], vulnerable: boolean) {
  const valid = hours
    .slice(0, 24)
    .filter((hour) => {
      const localHour = Number(hour.time.slice(11, 13));
      return (
        isValidReading(hour.aqi) &&
        Number.isInteger(localHour) &&
        localHour >= 7 &&
        localHour <= 18
      );
    })
    .sort((a, b) => (a.aqi ?? Infinity) - (b.aqi ?? Infinity));
  const best = valid[0];
  return best && best.aqi !== null && best.aqi <= (vulnerable ? 100 : 150) ? best : null;
}

export type Exercise = "walking" | "running" | "yoga";
export function planDailyActivity(hours: Hour[], exercise: Exercise, vulnerable: boolean) {
  const window = bestWindow(hours, vulnerable);
  return window
    ? {
        mode: "outdoor" as const,
        exercise,
        time: window.time,
        aqi: window.aqi,
        dominantPollutant: window.dominantPollutant,
      }
    : { mode: "indoor" as const, exercise, time: null, aqi: null, dominantPollutant: null };
}

export type WeatherReading = {
  temperature_2m: number | null;
  relative_humidity_2m: number | null;
  wind_speed_10m: number | null;
  weather_code: number | null;
};

export type AssistantEnvironment = {
  source: "Open-Meteo CAMS model forecast";
  location: { name: string; lat: number; lon: number };
  updatedAt: string | null;
  current: {
    time: string;
    aqi: number | null;
    dominantPollutant: Pollutant | null;
    readings: PollutantReadings;
  } | null;
  forecast: {
    time: string;
    aqi: number | null;
    dominantPollutant: Pollutant | null;
    readings: PollutantReadings;
  }[];
  weather: WeatherReading | null;
};

export type AssistantFamily = {
  name: string;
  children: number;
  adults: number;
  seniors: number;
  commute: keyof typeof factors;
  exercise: Exercise;
};

export function buildAssistantEnvironment(args: {
  cityName: string;
  cityLat: number;
  cityLon: number;
  hours: Hour[];
  updatedAt: string | null;
  weather: WeatherReading | null;
}): AssistantEnvironment {
  const toPoint = (hour: Hour) => ({
    time: hour.time,
    aqi: hour.aqi,
    dominantPollutant: hour.dominantPollutant,
    readings: {
      pm25: hour.pm25,
      pm10: hour.pm10,
      no2: hour.no2,
      ozone: hour.ozone,
      co: hour.co,
      so2: hour.so2,
    },
  });
  return {
    source: "Open-Meteo CAMS model forecast",
    location: { name: args.cityName, lat: args.cityLat, lon: args.cityLon },
    updatedAt: args.updatedAt,
    current: args.hours[0] ? toPoint(args.hours[0]) : null,
    forecast: args.hours.slice(0, 24).map(toPoint),
    weather: args.weather,
  };
}

export type Message = { role: "user" | "assistant"; content: string };
export type Household = {
  name: string;
  children: number;
  adults: number;
  seniors: number;
  commute: keyof typeof factors;
  exercise: Exercise;
  checklist: Record<string, boolean>;
  trips: { date: string; distance: number; mode: keyof typeof factors }[];
  messages: Message[];
};
export const initialHousehold: Household = {
  name: "My family",
  children: 0,
  adults: 1,
  seniors: 0,
  commute: "metro",
  exercise: "walking",
  checklist: {},
  trips: [],
  messages: [],
};