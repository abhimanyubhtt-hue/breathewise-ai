import { createFileRoute } from "@tanstack/react-router";
import { Family } from "@/features/breathewise/views";
export const Route = createFileRoute("/family")({
  head: () => ({
    meta: [
      { title: "Family Planner · BreatheWise AI" },
      {
        name: "description",
        content: "Daily schedules with extra care for vulnerable family members.",
      },
      { property: "og:title", content: "Family Planner · BreatheWise AI" },
      {
        property: "og:description",
        content: "Daily schedules with extra care for vulnerable family members.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Family,
});
