import { createFileRoute } from "@tanstack/react-router";
import { Overview } from "@/features/breathewise/views";
import { environmentOptions } from "@/features/breathewise/context";
import { defaultCity } from "@/features/breathewise/domain";
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview · BreatheWise AI" },
      {
        name: "description",
        content:
          "Your daily air-quality forecast, family protection and greener choices in one place.",
      },
      { property: "og:title", content: "Overview · BreatheWise AI" },
      {
        property: "og:description",
        content: "Breathe smarter with model-based air forecasts and family wellness guidance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(environmentOptions(defaultCity)),
  component: Overview,
});
