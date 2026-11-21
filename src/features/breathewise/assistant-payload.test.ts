import { describe, it, expect } from "vitest";
import { assistantEnvironmentSchema, assistantFamilySchema } from "./data.functions";
import { buildAssistantEnvironment, type Hour } from "./domain";

const hour: Hour = {
  time: "2026-11-21T10:00",
  aqi: 80,
  dominantPollutant: "pm25",
  aqiByPollutant: {
    pm25: 80,
    pm10: null,
    no2: null,
    ozone: null,
    co: null,
    so2: null,
  },
  pm25: 20,
  pm10: 40,
  no2: 15,
  ozone: 18,
  co: 200,
  so2: 5,
};

const baseArgs = {
  cityName: "New Delhi",
  cityLat: 28.6139,
  cityLon: 77.209,
  hours: [hour],
  updatedAt: "2026-11-21T10:00:00.000Z",
  weather: {
    temperature_2m: 24.4,
    relative_humidity_2m: 55,
    wind_speed_10m: 8.2,
    weather_code: 0,
  },
};

describe("buildAssistantEnvironment", () => {
  it("produces a payload that passes the server assistantEnvironmentSchema", () => {
    const payload = buildAssistantEnvironment(baseArgs);
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(true);
  });

  it("carries the current hour, the location, and the weather reading", () => {
    const payload = buildAssistantEnvironment(baseArgs);
    expect(payload.current?.time).toBe("2026-11-21T10:00");
    expect(payload.current?.aqi).toBe(80);
    expect(payload.location).toEqual({
      name: "New Delhi",
      lat: 28.6139,
      lon: 77.209,
    });
    expect(payload.weather?.temperature_2m).toBe(24.4);
    expect(payload.updatedAt).toBe("2026-11-21T10:00:00.000Z");
  });

  it("caps the forecast at 24 hours", () => {
    const payload = buildAssistantEnvironment({
      ...baseArgs,
      hours: Array.from({ length: 48 }, (_, i) => ({
        ...hour,
        time: `2026-11-21T${String(i % 24).padStart(2, "0")}:00`,
      })),
    });
    expect(payload.forecast).toHaveLength(24);
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(true);
  });

  it("keeps the payload schema-valid when every reading is missing", () => {
    const payload = buildAssistantEnvironment({
      ...baseArgs,
      hours: [
        {
          time: "2026-11-21T10:00",
          aqi: null,
          dominantPollutant: null,
          aqiByPollutant: {
            pm25: null,
            pm10: null,
            no2: null,
            ozone: null,
            co: null,
            so2: null,
          },
          pm25: null,
          pm10: null,
          no2: null,
          ozone: null,
          co: null,
          so2: null,
        },
      ],
      weather: null,
      updatedAt: null,
    });
    expect(payload.current).not.toBeNull();
    expect(payload.current?.aqi).toBeNull();
    expect(payload.weather).toBeNull();
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(true);
  });

  it("returns a null current hour when no forecast hours exist", () => {
    const payload = buildAssistantEnvironment({ ...baseArgs, hours: [] });
    expect(payload.current).toBeNull();
    expect(payload.forecast).toEqual([]);
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(true);
  });
});

describe("assistantEnvironmentSchema rejects malformed payloads", () => {
  it("rejects an unknown source label", () => {
    const payload = { ...buildAssistantEnvironment(baseArgs), source: "Some other model" };
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects a negative AQI value", () => {
    const payload = buildAssistantEnvironment(baseArgs);
    if (payload.current) payload.current.aqi = -5;
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects an out-of-range latitude in the location", () => {
    const payload = buildAssistantEnvironment(baseArgs);
    payload.location.lat = 120;
    expect(assistantEnvironmentSchema.safeParse(payload).success).toBe(false);
  });

  it("rejects a forecast with more than 24 hours", () => {
    const payload = buildAssistantEnvironment(baseArgs);
    const oversized = {
      ...payload,
      forecast: Array.from({ length: 25 }, (_, i) => ({
        time: `2026-11-21T${String(i % 24).padStart(2, "0")}:00`,
        aqi: 80,
        dominantPollutant: "pm25" as const,
        readings: {
          pm25: 20,
          pm10: 40,
          no2: 15,
          ozone: 18,
          co: 200,
          so2: 5,
        },
      })),
    };
    expect(assistantEnvironmentSchema.safeParse(oversized).success).toBe(false);
  });
});

describe("assistantFamilySchema", () => {
  const family = {
    name: "My family",
    children: 1,
    adults: 2,
    seniors: 0,
    commute: "metro",
    exercise: "walking",
  } as const;

  it("accepts a valid family profile", () => {
    expect(assistantFamilySchema.safeParse(family).success).toBe(true);
  });

  it("rejects zero adults", () => {
    expect(assistantFamilySchema.safeParse({ ...family, adults: 0 }).success).toBe(false);
  });

  it("rejects an unknown commute mode", () => {
    expect(
      assistantFamilySchema.safeParse({ ...family, commute: "helicopter" }).success,
    ).toBe(false);
  });
});
