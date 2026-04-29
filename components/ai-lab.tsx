"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useClassMap, useVocabStore } from "@/components/vocab-provider";
import { buildStudyPack } from "@/lib/study-tools";

export function AiLab() {
  const { classes, entries, isLoaded, saveAiSuggestions } = useVocabStore();
  const classMap = useClassMap(classes);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [notice, setNotice] = useState("");

  const sortedEntries = useMemo(
    () =>
      [...entries].sort((left, right) => left.term.localeCompare(right.term)),
    [entries],
  );

  const selectedEntry = sortedEntries.find((entry) => entry.id === selectedTermId);
  const suggestions = selectedEntry?.aiSuggestions ?? [];

  useEffect(() => {
    if (!selectedTermId && sortedEntries[0]) {
      setSelectedTermId(sortedEntries[0].id);
    }
  }, [selectedTermId, sortedEntries]);

  function handleGenerate() {
    if (!selectedEntry) {
      return;
    }

    const nextSuggestions = buildStudyPack(selectedEntry);
    saveAiSuggestions(selectedEntry.id, nextSuggestions);
    setNotice(`Generated a new study pack for ${selectedEntry.term}.`);
  }

  return (
    <section className="ai-page">
      <div className="hero-card">
        <div>
          <span className="phase-badge">Study generator</span>
          <h1>Turn saved notes into practice prompts instantly.</h1>
          <p>
            This local-first lab creates AI-style study prompts from your own
            vocabulary entries, without needing sign-in or API keys.
          </p>
        </div>
        <div className="stats-grid" aria-label="AI lab statistics">
          <article className="stat-card">
            <strong>{entries.length}</strong>
            <span>Terms available</span>
          </article>
          <article className="stat-card">
            <strong>{entries.filter((entry) => entry.aiSuggestions?.length).length}</strong>
            <span>Study packs saved</span>
          </article>
          <article className="stat-card">
            <strong>4</strong>
            <span>Prompt types per pack</span>
          </article>
        </div>
      </div>

      {!isLoaded ? (
        <article className="empty-card">
          <h3>Loading study lab</h3>
          <p>Your terms and saved prompts will appear here shortly.</p>
        </article>
      ) : !sortedEntries.length ? (
        <article className="empty-card">
          <h3>No terms available yet</h3>
          <p>Add vocabulary first so the lab has something to transform into prompts.</p>
          <Link href="/" className="primary-button">
            Go to dashboard
          </Link>
        </article>
      ) : (
        <div className="ai-grid">
          <section className="ai-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Lab controls</p>
                <h2>Prompt generator</h2>
              </div>
              <span className="muted-label">Built from your own notes</span>
            </div>

            <label className="entry-form">
              <span>Choose a term</span>
              <select
                value={selectedTermId}
                onChange={(event) => {
                  setSelectedTermId(event.target.value);
                  setNotice("");
                }}
              >
                {sortedEntries.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.term} · {classMap[entry.classId]?.name ?? "Unsorted"}
                  </option>
                ))}
              </select>
            </label>

            {selectedEntry ? (
              <article className="selected-term-card">
                <div>
                  <p className="entry-class">
                    {classMap[selectedEntry.classId]?.name ?? "Unsorted"}
                  </p>
                  <h3>{selectedEntry.term}</h3>
                </div>
                <p>{selectedEntry.definition}</p>
              </article>
            ) : null}

            <div className="detail-actions">
              <button type="button" className="primary-button" onClick={handleGenerate}>
                Generate study pack
              </button>
              {selectedEntry ? (
                <Link href={`/terms/${selectedEntry.id}`} className="text-link">
                  Open term detail
                </Link>
              ) : null}
            </div>

            {notice ? <p className="form-message success">{notice}</p> : null}

            <div className="ai-note">
              <strong>How this works</strong>
              <p>
                This version creates local AI-style prompts from your saved
                definitions and examples so the feature works immediately for
                demos and practice sessions.
              </p>
            </div>
          </section>

          <aside className="ai-sidebar">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Study pack</p>
                <h2>Generated prompts</h2>
              </div>
              <span className="muted-label">{suggestions.length} prompts</span>
            </div>

            {suggestions.length ? (
              <div className="ai-suggestions">
                {suggestions.map((suggestion, index) => (
                  <article key={`${selectedTermId}-${index}`} className="ai-card">
                    <strong>Prompt {index + 1}</strong>
                    <p>{suggestion}</p>
                  </article>
                ))}
              </div>
            ) : (
              <article className="empty-card compact-empty">
                <h3>No study pack yet</h3>
                <p>Generate prompts for a term and they will stay saved locally here.</p>
              </article>
            )}
          </aside>
        </div>
      )}
    </section>
  );
}
