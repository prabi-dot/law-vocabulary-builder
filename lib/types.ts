export type ReviewStatus = "new" | "known" | "review";

export type SortOption = "updated" | "created" | "alphabetical";

export interface VocabEntry {
  id: string;
  term: string;
  definition: string;
  example: string;
  classId: string;
  createdAt: string;
  updatedAt: string;
  doodleData?: string | null;
  reviewStatus?: ReviewStatus;
  reviewDueAt?: string | null;
  lastReviewedAt?: string | null;
  aiSuggestions?: string[];
}

export interface ClassFolder {
  id: string;
  name: string;
  color?: string;
  order?: number;
}

export interface EntryInput {
  term: string;
  definition: string;
  example: string;
  classId: string;
}

export interface AppStateContextValue {
  classes: ClassFolder[];
  entries: VocabEntry[];
  isLoaded: boolean;
  addClass: (name: string) => ClassFolder;
  addEntry: (input: EntryInput) => VocabEntry;
  updateEntry: (id: string, updates: EntryInput) => VocabEntry | null;
  updateReviewState: (
    id: string,
    reviewStatus: ReviewStatus,
    reviewDueAt: string | null,
  ) => VocabEntry | null;
  saveAiSuggestions: (id: string, aiSuggestions: string[]) => VocabEntry | null;
  saveDoodle: (id: string, doodleData: string | null) => VocabEntry | null;
  deleteEntry: (id: string) => void;
}
