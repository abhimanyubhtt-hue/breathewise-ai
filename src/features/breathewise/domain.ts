export const defaultCity = { name: "New Delhi", lat: 28.6139, lon: 77.209 };
export const cities = [
  defaultCity,
  { name: "Mumbai", lat: 19.076, lon: 72.8777 },
  { name: "Bengaluru", lat: 12.9716, lon: 77.5946 },
  { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
  { name: "Chennai", lat: 13.0827, lon: 80.2707 },
  { name: "Lucknow", lat: 26.8467, lon: 80.9462 },
];
export function aqiStatus(value: number | null) {
  if (value === null)
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
      advice:
        "Reduce prolonged outdoor exertion. Children and older adults should choose indoor activities.",
    };
  if (value <= 300)
    return {
      label: "Very unhealthy",
      tone: "danger",
      advice:
        "Avoid strenuous outdoor activity. Keep vulnerable family members indoors and use filtered indoor air.",
    };
  return {
    label: "Hazardous",
    tone: "danger",
    advice: "Avoid outdoor physical activity. Stay in a room with filtered air when possible.",
  };
}
export const factors = { car: 0.192, metro: 0.041, cycling: 0, carpool: 0.064 };
export function emissions(distance: number, mode: keyof typeof factors) {
  return Math.max(0, distance) * factors[mode];
}
export type Hour = {
  time: string;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  ozone: number | null;
};
export function bestWindow(hours: Hour[], vulnerable: boolean) {
  const valid = hours
    .slice(0, 24)
    .filter(
      (h) =>
        h.aqi !== null && Number(h.time.slice(11, 13)) >= 7 && Number(h.time.slice(11, 13)) <= 18,
    );
  const best = valid.sort((a, b) => (a.aqi ?? Infinity) - (b.aqi ?? Infinity))[0];
  return best && (best.aqi ?? Infinity) <= (vulnerable ? 100 : 150) ? best : null;
}
export type Message = { role: "user" | "assistant"; content: string };
export type Household = {
  name: string;
  children: number;
  adults: number;
  seniors: number;
  commute: keyof typeof factors;
  exercise: "walking" | "running" | "yoga";
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
