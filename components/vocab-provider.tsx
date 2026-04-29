"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  type AppData,
  createClassFolder,
  createEntry,
  defaultAppData,
  loadAppData,
  saveAppData,
} from "@/lib/storage";
import type {
  AppStateContextValue,
  ClassFolder,
  EntryInput,
  VocabEntry,
} from "@/lib/types";

const VocabContext = createContext<AppStateContextValue | null>(null);

export function VocabProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(defaultAppData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const initialData = loadAppData();
    setData(initialData);
    setIsLoaded(true);

    function syncFromStorage(event: StorageEvent) {
      if (event.key) {
        const nextData = loadAppData();
        setData(nextData);
      }
    }

    window.addEventListener("storage", syncFromStorage);
    return () => window.removeEventListener("storage", syncFromStorage);
  }, []);

  function commit(updater: (current: AppData) => AppData) {
    setData((current) => {
      const next = updater(current);
      saveAppData(next);
      return next;
    });
  }

  function addClass(name: string) {
    const cleanedName = name.trim();
    if (!cleanedName) {
      throw new Error("Class name cannot be empty.");
    }

    const existingClass = data.classes.find(
      (folder) => folder.name.toLowerCase() === cleanedName.toLowerCase(),
    );

    if (existingClass) {
      return existingClass;
    }

    const classFolder = createClassFolder(cleanedName, data.classes.length);

    commit((current) => ({
      ...current,
      classes: [...current.classes, classFolder],
    }));

    return classFolder;
  }

  function addEntry(input: EntryInput) {
    const entry = createEntry(input);

    commit((current) => ({
      ...current,
      entries: [entry, ...current.entries],
    }));

    return entry;
  }

  function updateEntry(id: string, updates: EntryInput) {
    let updatedEntry: VocabEntry | null = null;

    commit((current) => {
      const entries = current.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        updatedEntry = {
          ...entry,
          term: updates.term.trim(),
          definition: updates.definition.trim(),
          example: updates.example.trim(),
          classId: updates.classId,
          updatedAt: new Date().toISOString(),
        };

        return updatedEntry;
      });

      return {
        ...current,
        entries,
      };
    });

    return updatedEntry;
  }

  function deleteEntry(id: string) {
    commit((current) => ({
      ...current,
      entries: current.entries.filter((entry) => entry.id !== id),
    }));
  }

  function updateReviewState(
    id: string,
    reviewStatus: "new" | "known" | "review",
    reviewDueAt: string | null,
  ) {
    let updatedEntry: VocabEntry | null = null;

    commit((current) => {
      const entries = current.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        updatedEntry = {
          ...entry,
          reviewStatus,
          reviewDueAt,
          lastReviewedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        return updatedEntry;
      });

      return {
        ...current,
        entries,
      };
    });

    return updatedEntry;
  }

  function saveAiSuggestions(id: string, aiSuggestions: string[]) {
    let updatedEntry: VocabEntry | null = null;

    commit((current) => {
      const entries = current.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        updatedEntry = {
          ...entry,
          aiSuggestions,
          updatedAt: new Date().toISOString(),
        };

        return updatedEntry;
      });

      return {
        ...current,
        entries,
      };
    });

    return updatedEntry;
  }

  function saveDoodle(id: string, doodleData: string | null) {
    let updatedEntry: VocabEntry | null = null;

    commit((current) => {
      const entries = current.entries.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }

        updatedEntry = {
          ...entry,
          doodleData,
          updatedAt: new Date().toISOString(),
        };

        return updatedEntry;
      });

      return {
        ...current,
        entries,
      };
    });

    return updatedEntry;
  }

  const value = useMemo<AppStateContextValue>(
    () => ({
      classes: data.classes,
      entries: data.entries,
      isLoaded,
      addClass,
      addEntry,
      updateEntry,
      updateReviewState,
      saveAiSuggestions,
      saveDoodle,
      deleteEntry,
    }),
    [data.classes, data.entries, isLoaded],
  );

  return <VocabContext.Provider value={value}>{children}</VocabContext.Provider>;
}

export function useVocabStore(): AppStateContextValue {
  const context = useContext(VocabContext);

  if (!context) {
    throw new Error("useVocabStore must be used inside VocabProvider.");
  }

  return context;
}

export function useClassMap(classes: ClassFolder[]) {
  return useMemo(
    () =>
      classes.reduce<Record<string, ClassFolder>>((accumulator, folder) => {
        accumulator[folder.id] = folder;
        return accumulator;
      }, {}),
    [classes],
  );
}
