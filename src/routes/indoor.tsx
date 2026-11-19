import { createFileRoute } from "@tanstack/react-router";
import { Indoor } from "@/features/breathewise/views";
export const Route = createFileRoute("/indoor")({
  head: () => ({
    meta: [
      { title: "Indoor Protection · BreatheWise AI" },
      {
        name: "description",
        content: "Room guidance and private household protection checklists.",
      },
      { property: "og:title", content: "Indoor Protection · BreatheWise AI" },
      {
        property: "og:description",
        content: "Room guidance and private household protection checklists.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Indoor,
});
