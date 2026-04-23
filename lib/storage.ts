import type { ClassFolder, EntryInput, VocabEntry } from "@/lib/types";

const STORAGE_KEY = "law-vocab-builder:v1";

const starterClasses = [
  "Contracts",
  "Torts",
  "Civil Procedure",
  "Criminal Law",
  "Property",
  "Constitutional Law",
];

export interface AppData {
  version: number;
  classes: ClassFolder[];
  entries: VocabEntry[];
}

export const defaultAppData: AppData = {
  version: 1,
  classes: starterClasses.map((name, index) => createClassFolder(name, index)),
  entries: [],
};

export function loadAppData(): AppData {
  if (typeof window === "undefined") {
    return defaultAppData;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return defaultAppData;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return normalizeAppData(parsed);
  } catch {
    return defaultAppData;
  }
}

export function saveAppData(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function createClassFolder(name: string, order = 0): ClassFolder {
  return {
    id: slugify(name),
    name,
    order,
    color: pickColor(order),
  };
}

export function createEntry(input: EntryInput): VocabEntry {
  const timestamp = new Date().toISOString();

  return {
    id: createId(),
    term: input.term.trim(),
    definition: input.definition.trim(),
    example: input.example.trim(),
    classId: input.classId,
    createdAt: timestamp,
    updatedAt: timestamp,
    doodleData: null,
    reviewStatus: "new",
    reviewDueAt: null,
    lastReviewedAt: null,
    aiSuggestions: [],
  };
}

function normalizeAppData(data: Partial<AppData>): AppData {
  const classes = Array.isArray(data.classes) ? data.classes : defaultAppData.classes;
  const entries = Array.isArray(data.entries) ? data.entries : [];

  return {
    version: 1,
    classes,
    entries: entries.map((entry) => ({
      id: entry.id ?? createId(),
      term: entry.term ?? "",
      definition: entry.definition ?? "",
      example: entry.example ?? "",
      classId: entry.classId ?? classes[0]?.id ?? defaultAppData.classes[0].id,
      createdAt: entry.createdAt ?? new Date().toISOString(),
      updatedAt: entry.updatedAt ?? entry.createdAt ?? new Date().toISOString(),
      doodleData: entry.doodleData ?? null,
      reviewStatus: entry.reviewStatus ?? "new",
      reviewDueAt: entry.reviewDueAt ?? null,
      lastReviewedAt: entry.lastReviewedAt ?? null,
      aiSuggestions: entry.aiSuggestions ?? [],
    })),
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pickColor(index: number) {
  const colors = ["#b76e41", "#6d7d46", "#2f6a73", "#8a6d9e", "#9d5334", "#5165a9"];
  return colors[index % colors.length];
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
