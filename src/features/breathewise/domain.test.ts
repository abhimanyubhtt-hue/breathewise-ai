import { describe, it, expect } from "vitest";
import { aqiStatus, emissions, bestWindow } from "./domain";
describe("Environmental integrity", () => {
  it("does not invent a status when AQI is unavailable", () =>
    expect(aqiStatus(null).label).toBe("Unavailable"));
  it("labels US AQI 301 as hazardous", () => expect(aqiStatus(301).label).toBe("Hazardous"));
  it("calculates estimated car emissions using 0.192 kg per km", () =>
    expect(emissions(10, "car")).toBe(1.92));
  it("estimates zero operational cycling emissions", () =>
    expect(emissions(10, "cycling")).toBe(0));
  it("does not recommend elevated exposure to vulnerable members", () =>
    expect(
      bestWindow(
        [{ time: "2026-11-19T10:00", aqi: 120, pm25: 30, pm10: 40, no2: 10, ozone: 20 }],
        true,
      ),
    ).toBeNull());
});
