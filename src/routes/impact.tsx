import { createFileRoute } from "@tanstack/react-router";
import { Impact } from "@/features/breathewise/views";
export const Route = createFileRoute("/impact")({
  head: () => ({
    meta: [
      { title: "Green Impact · BreatheWise AI" },
      {
        name: "description",
        content: "Compare estimated transport emissions and log greener journeys.",
      },
      { property: "og:title", content: "Green Impact · BreatheWise AI" },
      {
        property: "og:description",
        content: "Compare estimated transport emissions and log greener journeys.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Impact,
});
