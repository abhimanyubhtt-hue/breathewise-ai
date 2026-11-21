import { describe, it, expect } from "vitest";
import {
  aqiStatus,
  clampMemberCount,
  deriveUsAqi,
  emissions,
  planDailyActivity,
  type Hour,
  type PollutantIndices,
  type PollutantReadings,
} from "./domain";

const emptyReadings: PollutantReadings = {
  pm25: null,
  pm10: null,
  no2: null,
  ozone: null,
  co: null,
  so2: null,
};
const emptyIndices: PollutantIndices = {
  pm25: null,
  pm10: null,
  no2: null,
  ozone: null,
  co: null,
  so2: null,
};
const sampleHour: Hour = {
  time: "2026-11-20T10:00",
  aqi: 80,
  dominantPollutant: "pm25",
  aqiByPollutant: { ...emptyIndices, pm25: 80 },
  ...emptyReadings,
  pm25: 20,
};

describe("US AQI integrity", () => {
  it("uses the highest valid pollutant-specific US sub-index as AQI and names that pollutant", () => {
    const result = deriveUsAqi(
      { ...emptyReadings, pm25: 20, pm10: 40, no2: 15 },
      { ...emptyIndices, pm25: 80, pm10: 35, no2: 42 },
    );
    expect(result.aqi).toBe(80);
    expect(result.dominantPollutant).toBe("pm25");
  });

  it("ignores a pollutant AQI when its concentration is missing or invalid", () => {
    const result = deriveUsAqi(
      { ...emptyReadings, pm25: null, pm10: -1, ozone: 18 },
      { ...emptyIndices, pm25: 240, pm10: 220, ozone: 36 },
    );
    expect(result.aqi).toBe(36);
    expect(result.dominantPollutant).toBe("ozone");
    expect(result.aqiByPollutant.pm25).toBeNull();
    expect(result.aqiByPollutant.pm10).toBeNull();
  });

  it("returns unavailable when no valid concentration supports an index", () => {
    const result = deriveUsAqi(emptyReadings, { ...emptyIndices, pm25: 80 });
    expect(result.aqi).toBeNull();
    expect(result.dominantPollutant).toBeNull();
  });

  it("does not invent an air-quality category when AQI is unavailable", () => {
    expect(aqiStatus(null).label).toBe("Unavailable");
  });

  it("labels US AQI 301 as hazardous", () => {
    expect(aqiStatus(301).label).toBe("Hazardous");
  });
});

describe("Estimated transport emissions", () => {
  it("uses 0.192 kg CO2 per solo-car passenger-kilometre", () => {
    expect(emissions(10, "car")).toBe(1.92);
  });
  it("uses 0.041 kg CO2 per public-transport passenger-kilometre", () => {
    expect(emissions(10, "metro")).toBeCloseTo(0.41);
  });
  it("uses 0.064 kg CO2 per passenger-kilometre for a three-person carpool", () => {
    expect(emissions(10, "carpool")).toBeCloseTo(0.64);
  });
  it("estimates zero operational cycling emissions", () => {
    expect(emissions(10, "cycling")).toBe(0);
  });
  it("does not produce a negative estimate for invalid distances", () => {
    expect(emissions(-10, "car")).toBe(0);
    expect(emissions(Number.NaN, "car")).toBe(0);
  });
});

describe("Family planner", () => {
  it("keeps member counts within the 0–20 limits", () => {
    expect(clampMemberCount(-4)).toBe(0);
    expect(clampMemberCount(24)).toBe(20);
  });

  it("uses the preferred exercise in an available suitable forecast window", () => {
    const result = planDailyActivity([sampleHour], "running", false);
    expect(result).toMatchObject({ mode: "outdoor", exercise: "running", time: "2026-11-20T10:00" });
  });

  it("keeps vulnerable family members indoors when the available AQI is above 100", () => {
    const result = planDailyActivity([{ ...sampleHour, aqi: 120 }], "walking", true);
    expect(result.mode).toBe("indoor");
  });
});