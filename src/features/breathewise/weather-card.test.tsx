import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WeatherCard } from "./views";
import type { WeatherReading } from "./domain";

const weatherState = { current: null as WeatherReading | null };

vi.mock("./context", () => ({
  useBreathe: () => ({
    environment: { data: { weather: weatherState.current } },
    t: (en: string) => en,
  }),
}));

function renderCard(weather: WeatherReading | null) {
  weatherState.current = weather;
  render(<WeatherCard />);
}

describe("WeatherCard", () => {
  it("renders readings when every field is available", () => {
    renderCard({
      temperature_2m: 24.4,
      relative_humidity_2m: 55,
      wind_speed_10m: 8.2,
      weather_code: 0,
    });
    expect(screen.getByText("24")).toBeInTheDocument();
    expect(screen.getByText("8.2")).toBeInTheDocument();
    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("Mostly clear")).toBeInTheDocument();
  });

  it("shows a dash instead of 0 when temperature is missing", () => {
    renderCard({
      temperature_2m: null,
      relative_humidity_2m: 55,
      wind_speed_10m: 8.2,
      weather_code: 0,
    });
    const temperature = screen.getByText("°C").previousElementSibling;
    expect(temperature?.textContent).toBe("—");
    expect(screen.getByText("8.2")).toBeInTheDocument();
  });

  it("shows dashes for wind and humidity when they are missing", () => {
    renderCard({
      temperature_2m: 24.4,
      relative_humidity_2m: null,
      wind_speed_10m: null,
      weather_code: 1,
    });
    expect(screen.getByText("24")).toBeInTheDocument();
    const wind = screen.getByText("km/h").previousElementSibling;
    expect(wind?.textContent).toBe("—");
    const humidity = screen.getByText("%").previousElementSibling;
    expect(humidity?.textContent).toBe("—");
  });

  it("shows the unavailable label and dashes when there is no weather object", () => {
    renderCard(null);
    expect(screen.getByText("Weather unavailable")).toBeInTheDocument();
    const temperature = screen.getByText("°C").previousElementSibling;
    expect(temperature?.textContent).toBe("—");
  });
});
