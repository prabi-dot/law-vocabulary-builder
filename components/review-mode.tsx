"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useClassMap, useVocabStore } from "@/components/vocab-provider";
import { getDueEntries, nextReviewDate } from "@/lib/study-tools";
import type { VocabEntry } from "@/lib/types";

export function ReviewMode() {
  const { entries, classes, isLoaded, updateReviewState } = useVocabStore();
  const classMap = useClassMap(classes);
  const [selectedClassId, setSelectedClassId] = useState("all");
  const [revealed, setRevealed] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);

  const dueEntries = useMemo(
    () =>
      getDueEntries(entries)
        .filter((entry) =>
          selectedClassId === "all" ? true : entry.classId === selectedClassId,
        )
        .sort((left, right) => {
          const leftDue = left.reviewDueAt
            ? new Date(left.reviewDueAt).getTime()
            : 0;
          const rightDue = right.reviewDueAt
            ? new Date(right.reviewDueAt).getTime()
            : 0;

          return leftDue - rightDue;
        }),
    [entries, selectedClassId],
  );

  const currentCard = dueEntries[0];
  const knownCount = entries.filter((entry) => entry.reviewStatus === "known").length;
  const needsReviewCount = entries.filter(
    (entry) => entry.reviewStatus !== "known",
  ).length;

  function gradeCard(nextStatus: "known" | "review") {
    if (!currentCard) {
      return;
    }

    updateReviewState(currentCard.id, nextStatus, nextReviewDate(nextStatus));
    setRevealed(false);
    setSessionCount((count) => count + 1);
  }

  return (
    <section className="review-page">
      <div className="hero-card">
        <div>
          <span className="phase-badge">Active recall</span>
          <h1>Review terms like flashcards, not a static list.</h1>
          <p>
            Test yourself first, reveal the answer only after recall, and mark
            what should come back tomorrow versus what feels solid.
          </p>
        </div>
        <div className="stats-grid" aria-label="Review statistics">
          <article className="stat-card">
            <strong>{dueEntries.length}</strong>
            <span>Due now</span>
          </article>
          <article className="stat-card">
            <strong>{knownCount}</strong>
            <span>Marked known</span>
          </article>
          <article className="stat-card">
            <strong>{sessionCount}</strong>
            <span>Reviewed this session</span>
          </article>
        </div>
      </div>

      {!isLoaded ? (
        <article className="empty-card">
          <h3>Loading review queue</h3>
          <p>Your flashcards will appear here in a moment.</p>
        </article>
      ) : !entries.length ? (
        <article className="empty-card">
          <h3>No terms to review yet</h3>
          <p>Add vocabulary on the dashboard first, then come back to study it.</p>
          <Link href="/" className="primary-button">
            Go to dashboard
          </Link>
        </article>
      ) : (
        <div className="review-grid">
          <section className="review-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Study mode</p>
                <h2>Flashcard review</h2>
              </div>
              <span className="muted-label">{needsReviewCount} still in rotation</span>
            </div>

            <div className="review-toolbar">
              <label>
                <span>Class filter</span>
                <select
                  value={selectedClassId}
                  onChange={(event) => {
                    setSelectedClassId(event.target.value);
                    setRevealed(false);
                  }}
                >
                  <option value="all">All classes</option>
                  {classes.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {currentCard ? (
              <article className="flashcard">
                <div className="flashcard-top">
                  <p className="entry-class">
                    {classMap[currentCard.classId]?.name ?? "Unsorted"}
                  </p>
                  <span className="review-status-pill">
                    {labelForStatus(currentCard.reviewStatus)}
                  </span>
                </div>
                <h3>{currentCard.term}</h3>
                <p className="prompt-copy">
                  Try to define the term and think of a fact pattern before
                  revealing the answer.
                </p>

                {revealed ? (
                  <div className="flashcard-answer">
                    <div>
                      <strong>Definition</strong>
                      <p>{currentCard.definition}</p>
                    </div>
                    <div>
                      <strong>Example or hypo</strong>
                      <p>{currentCard.example}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flashcard-hidden">
                    <p>Answer hidden until you’re ready.</p>
                  </div>
                )}

                <div className="detail-actions">
                  {!revealed ? (
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => setRevealed(true)}
                    >
                      Reveal answer
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="primary-button"
                        onClick={() => gradeCard("known")}
                      >
                        Known
                      </button>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => gradeCard("review")}
                      >
                        Review again
                      </button>
                    </>
                  )}
                  <Link href={`/terms/${currentCard.id}`} className="text-link">
                    Open term detail
                  </Link>
                </div>
              </article>
            ) : (
              <article className="empty-card">
                <h3>No cards due right now</h3>
                <p>
                  You have cleared the current queue for this filter. Add more
                  terms or come back when review-again cards are due.
                </p>
              </article>
            )}
          </section>

          <aside className="review-sidebar">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Queue</p>
                <h2>Coming up</h2>
              </div>
              <span className="muted-label">{dueEntries.length} cards</span>
            </div>

            <div className="review-list">
              {dueEntries.slice(0, 6).map((entry: VocabEntry, index) => (
                <article
                  key={entry.id}
                  className={index === 0 ? "review-list-item active" : "review-list-item"}
                >
                  <div>
                    <strong>{entry.term}</strong>
                    <span>{classMap[entry.classId]?.name ?? "Unsorted"}</span>
                  </div>
                  <small>{labelForStatus(entry.reviewStatus)}</small>
                </article>
              ))}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}

function labelForStatus(status: VocabEntry["reviewStatus"]) {
  if (status === "known") {
    return "Known";
  }

  if (status === "review") {
    return "Review again";
  }

  return "New";
}
