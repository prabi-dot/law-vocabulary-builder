import type { ReviewStatus, VocabEntry } from "@/lib/types";

export function getDueEntries(entries: VocabEntry[]) {
  const now = Date.now();

  return entries.filter((entry) => {
    if (!entry.reviewDueAt) {
      return true;
    }

    return new Date(entry.reviewDueAt).getTime() <= now;
  });
}

export function nextReviewDate(status: ReviewStatus) {
  const next = new Date();

  if (status === "known") {
    next.setDate(next.getDate() + 3);
    return next.toISOString();
  }

  if (status === "review") {
    next.setDate(next.getDate() + 1);
    return next.toISOString();
  }

  return null;
}

export function buildStudyPack(entry: VocabEntry) {
  const classLabel = entry.classId.replace(/-/g, " ");
  const keyword = extractKeyword(entry.term);
  const verb = inferVerb(entry.definition);

  return [
    `Definition upgrade: In plain language, ${entry.term} is best understood as ${normalizeSentence(entry.definition)} Focus on when it matters in ${classLabel}.`,
    `Quiz prompt: How would you explain ${entry.term} from memory before looking at your notes, and what fact pattern would make ${keyword} matter most?`,
    `Hypo generator: Write a two-sentence scenario where someone must decide whether ${entry.term} ${verb}. Then explain which fact is doing the most legal work.`,
    `Recall check: Can you define ${entry.term}, spot it in a fact pattern, and connect it back to this example: ${normalizeSentence(entry.example)}`,
  ];
}

function extractKeyword(term: string) {
  return term.trim().split(/\s+/).slice(-1)[0]?.toLowerCase() || "it";
}

function inferVerb(definition: string) {
  const normalized = definition.toLowerCase();

  if (normalized.includes("enforce")) {
    return "makes a promise enforceable";
  }

  if (normalized.includes("duty")) {
    return "creates or limits a duty";
  }

  if (normalized.includes("liability")) {
    return "changes who may be liable";
  }

  if (normalized.includes("court")) {
    return "changes what a court can do";
  }

  return "becomes legally important";
}

function normalizeSentence(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}
