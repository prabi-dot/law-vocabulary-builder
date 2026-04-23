import { FutureModulePage } from "@/components/future-module-page";

export default function ReviewPage() {
  return (
    <FutureModulePage
      title="Review mode is next in line"
      badge="Phase 2"
      description="This future release turns your saved terms into flashcards with reveal-first definitions and a lightweight known/review-again workflow."
      highlights={[
        "Only show cards that are due for review",
        "Reveal definition and hypo after recall",
        "Mark terms as known or review again",
      ]}
    />
  );
}
