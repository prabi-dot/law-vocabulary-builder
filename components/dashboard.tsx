"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useClassMap, useVocabStore } from "@/components/vocab-provider";
import type { SortOption, VocabEntry } from "@/lib/types";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "updated", label: "Recently updated" },
  { value: "created", label: "Newest added" },
  { value: "alphabetical", label: "A to Z" },
];

const emptyDraft = {
  term: "",
  definition: "",
  example: "",
};

export function Dashboard() {
  const { classes, entries, isLoaded, addClass, addEntry } = useVocabStore();
  const classMap = useClassMap(classes);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("updated");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState(emptyDraft);
  const [draftClassId, setDraftClassId] = useState("");
  const [customClassName, setCustomClassName] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (!draftClassId && classes[0]) {
      setDraftClassId(classes[0].id);
    }
  }, [classes, draftClassId]);

  const filteredEntries = useMemo(() => {
    const normalizedQuery = deferredQuery;

    const nextEntries = entries.filter((entry: VocabEntry) => {
      const matchesClass =
        selectedClassId === "all" || entry.classId === selectedClassId;

      const matchesSearch =
        !normalizedQuery ||
        entry.term.toLowerCase().includes(normalizedQuery) ||
        entry.definition.toLowerCase().includes(normalizedQuery) ||
        entry.example.toLowerCase().includes(normalizedQuery);

      return matchesClass && matchesSearch;
    });

    return nextEntries.sort((left: VocabEntry, right: VocabEntry) => {
      if (sortBy === "alphabetical") {
        return left.term.localeCompare(right.term);
      }

      const leftDate =
        sortBy === "created"
          ? new Date(left.createdAt).getTime()
          : new Date(left.updatedAt).getTime();
      const rightDate =
        sortBy === "created"
          ? new Date(right.createdAt).getTime()
          : new Date(right.updatedAt).getTime();

      return rightDate - leftDate;
    });
  }, [deferredQuery, entries, selectedClassId, sortBy]);

  const recentCount = entries.filter((entry: VocabEntry) => {
    const updatedAt = new Date(entry.updatedAt).getTime();
    return Date.now() - updatedAt < 1000 * 60 * 60 * 24 * 7;
  }).length;

  function handleCreateEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.term.trim() || !draft.definition.trim() || !draft.example.trim()) {
      setFormError("Term, definition, and example are all required.");
      return;
    }

    let resolvedClassId = draftClassId;

    try {
      if (customClassName.trim()) {
        const newClass = addClass(customClassName);
        resolvedClassId = newClass.id;
      }

      if (!resolvedClassId) {
        setFormError("Choose a class or create a new one.");
        return;
      }

      const nextEntry = addEntry({
        term: draft.term,
        definition: draft.definition,
        example: draft.example,
        classId: resolvedClassId,
      });

      setDraft(emptyDraft);
      setCustomClassName("");
      setFormError("");
      setNotice(`Saved "${nextEntry.term}" to your notebook.`);
      setSelectedClassId("all");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to save your term.",
      );
    }
  }

  function handleCreateClass(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!customClassName.trim()) {
      setFormError("Enter a class name before adding it.");
      return;
    }

    try {
      const nextClass = addClass(customClassName);
      setDraftClassId(nextClass.id);
      setCustomClassName("");
      setFormError("");
      setNotice(`Added ${nextClass.name} to your class folders.`);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Unable to add your class.",
      );
    }
  }

  return (
    <section className="dashboard">
      <div className="hero-card">
        <div>
          <span className="phase-badge">Personal workspace</span>
          <h1>Organize legal terms with clarity.</h1>
          <p>
            Save definitions in your own language, attach a short hypo, and keep
            every concept sorted by course in one focused notebook.
          </p>
        </div>
        <div className="stats-grid" aria-label="Notebook statistics">
          <article className="stat-card">
            <strong>{entries.length}</strong>
            <span>Saved terms</span>
          </article>
          <article className="stat-card">
            <strong>{classes.length}</strong>
            <span>Course folders</span>
          </article>
          <article className="stat-card">
            <strong>{recentCount}</strong>
            <span>Updated this week</span>
          </article>
        </div>
      </div>

      <div className="dashboard-grid">
        <aside className="sidebar-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Quick capture</p>
              <h2>New term</h2>
            </div>
            <span className="muted-label">Required: word, definition, hypo</span>
          </div>

          <form className="entry-form" onSubmit={handleCreateEntry}>
            <label>
              <span>Term</span>
              <input
                value={draft.term}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    term: event.target.value,
                  }))
                }
                placeholder="Consideration"
              />
            </label>
            <label>
              <span>Class</span>
              <select
                value={draftClassId}
                onChange={(event) => setDraftClassId(event.target.value)}
              >
                {classes.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Your definition</span>
              <textarea
                rows={4}
                value={draft.definition}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    definition: event.target.value,
                  }))
                }
                placeholder="A bargained-for exchange that makes a promise enforceable."
              />
            </label>
            <label>
              <span>Example or hypo</span>
              <textarea
                rows={4}
                value={draft.example}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    example: event.target.value,
                  }))
                }
                placeholder="If a seller promises to deliver a laptop in exchange for $500, the exchange can supply consideration."
              />
            </label>
            <button type="submit" className="primary-button">
              Save term
            </button>
          </form>

          <div className="section-heading compact">
            <div>
              <p className="eyebrow">Class folders</p>
              <h3>Add a custom course</h3>
            </div>
          </div>
          <form className="inline-form" onSubmit={handleCreateClass}>
            <input
              value={customClassName}
              onChange={(event) => setCustomClassName(event.target.value)}
              placeholder="Evidence"
            />
            <button type="submit" className="secondary-button">
              Add class
            </button>
          </form>

          {formError ? <p className="form-message error">{formError}</p> : null}
          {notice ? <p className="form-message success">{notice}</p> : null}
        </aside>

        <div className="content-stack">
          <section className="toolbar-card">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Notebook</p>
                <h2>Your saved terms</h2>
              </div>
              <span className="muted-label">
                {isLoaded ? `${filteredEntries.length} results` : "Loading..."}
              </span>
            </div>

            <div className="toolbar">
              <label className="search-field">
                <span className="sr-only">Search terms</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search terms, definitions, or hypos"
                />
              </label>
              <label>
                <span className="sr-only">Filter by class</span>
                <select
                  value={selectedClassId}
                  onChange={(event) => setSelectedClassId(event.target.value)}
                >
                  <option value="all">All classes</option>
                  {classes.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="sr-only">Sort entries</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as SortOption)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="class-strip" aria-label="Class folders">
            <button
              type="button"
              className={selectedClassId === "all" ? "chip active" : "chip"}
              onClick={() => setSelectedClassId("all")}
            >
              All classes
            </button>
            {classes.map((folder) => (
              <button
                key={folder.id}
                type="button"
                className={
                  selectedClassId === folder.id ? "chip active" : "chip"
                }
                onClick={() => setSelectedClassId(folder.id)}
              >
                {folder.name}
              </button>
            ))}
          </section>

          <section className="entries-grid">
            {filteredEntries.length ? (
              filteredEntries.map((entry) => (
                <article key={entry.id} className="entry-card">
                  <div className="entry-card-head">
                    <div>
                      <p className="entry-class">
                        {classMap[entry.classId]?.name ?? "Unsorted"}
                      </p>
                      <h3>{entry.term}</h3>
                    </div>
                    <span className="entry-date">
                      Updated {formatDate(entry.updatedAt)}
                    </span>
                  </div>
                  <p className="entry-definition">{entry.definition}</p>
                  <p className="entry-example">{entry.example}</p>
                  <div className="entry-card-foot">
                    <span className="subtle-note">
                      Created {formatDate(entry.createdAt)}
                    </span>
                    <Link href={`/terms/${entry.id}`} className="text-link">
                      Open detail
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <article className="empty-card">
                <h3>No matches yet</h3>
                <p>
                  Save your first legal term or widen your search to see the full
                  notebook.
                </p>
              </article>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}
