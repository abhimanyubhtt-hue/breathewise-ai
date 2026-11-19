import { createFileRoute } from "@tanstack/react-router";
import { Assistant } from "@/features/breathewise/views";
export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant · BreatheWise AI" },
      {
        name: "description",
        content: "Practical environmental wellness guidance from BreatheWise AI.",
      },
      { property: "og:title", content: "AI Assistant · BreatheWise AI" },
      {
        property: "og:description",
        content: "Practical environmental wellness guidance from BreatheWise AI.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assistant,
});
