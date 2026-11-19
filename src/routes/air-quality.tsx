import { createFileRoute } from "@tanstack/react-router";
import { AirQuality } from "@/features/breathewise/views";
export const Route = createFileRoute("/air-quality")({
  head: () => ({
    meta: [
      { title: "Air Quality · BreatheWise AI" },
      {
        name: "description",
        content: "Hourly pollution forecasts and transparent US AQI guidance.",
      },
      { property: "og:title", content: "Air Quality · BreatheWise AI" },
      {
        property: "og:description",
        content: "Hourly pollution forecasts and transparent US AQI guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AirQuality,
});
