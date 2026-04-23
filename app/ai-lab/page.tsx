import { FutureModulePage } from "@/components/future-module-page";

export default function AiLabPage() {
  return (
    <FutureModulePage
      title="AI lab for deeper recall"
      badge="Phase 4"
      description="AI stays out of the MVP, but the architecture already leaves room for stronger definitions, quiz generation, and mini hypotheticals."
      highlights={[
        "Improve a student-written definition without replacing their voice",
        "Generate quick quiz questions from saved terms",
        "Create short law-school hypotheticals for active recall",
      ]}
    />
  );
}
