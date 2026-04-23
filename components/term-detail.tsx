"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useVocabStore } from "@/components/vocab-provider";

export function TermDetail({ termId }: { termId: string }) {
  const router = useRouter();
  const { classes, entries, isLoaded, addClass, updateEntry, deleteEntry } =
    useVocabStore();
  const entry = entries.find((item) => item.id === termId);
  const [term, setTerm] = useState("");
  const [definition, setDefinition] = useState("");
  const [example, setExample] = useState("");
  const [classId, setClassId] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry) {
      setTerm(entry.term);
      setDefinition(entry.definition);
      setExample(entry.example);
      setClassId(entry.classId);
    }
  }, [entry]);

  if (isLoaded && !entry) {
    return (
      <section className="detail-layout">
        <article className="detail-card">
          <p className="eyebrow">Missing term</p>
          <h1>This entry could not be found.</h1>
          <p>
            It may have been deleted from local storage or opened from an older
            link.
          </p>
          <Link href="/" className="primary-button">
            Back to dashboard
          </Link>
        </article>
      </section>
    );
  }

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!entry) {
      return;
    }

    if (!term.trim() || !definition.trim() || !example.trim()) {
      setError("Term, definition, and example are all required.");
      return;
    }

    let resolvedClassId = classId;

    try {
      if (newClassName.trim()) {
        resolvedClassId = addClass(newClassName).id;
        setClassId(resolvedClassId);
        setNewClassName("");
      }

      if (!resolvedClassId) {
        setError("Choose a class before saving.");
        return;
      }

      updateEntry(entry.id, {
        term,
        definition,
        example,
        classId: resolvedClassId,
      });

      setError("");
      setMessage("Term updated in your notebook.");
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to update this term.",
      );
    }
  }

  function handleDelete() {
    if (!entry) {
      return;
    }

    const confirmed = window.confirm(
      `Delete "${entry.term}" from your notebook?`,
    );

    if (!confirmed) {
      return;
    }

    deleteEntry(entry.id);
    router.push("/");
  }

  return (
    <section className="detail-layout">
      <article className="detail-card">
        <div className="detail-header">
          <div>
            <p className="eyebrow">Entry detail</p>
            <h1>{entry?.term ?? "Loading..."}</h1>
          </div>
          <Link href="/" className="secondary-button">
            Back to dashboard
          </Link>
        </div>

        <form className="entry-form" onSubmit={handleSave}>
          <label>
            <span>Term</span>
            <input value={term} onChange={(event) => setTerm(event.target.value)} />
          </label>
          <label>
            <span>Class</span>
            <select
              value={classId}
              onChange={(event) => setClassId(event.target.value)}
            >
              {classes.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Definition</span>
            <textarea
              rows={5}
              value={definition}
              onChange={(event) => setDefinition(event.target.value)}
            />
          </label>
          <label>
            <span>Example or hypo</span>
            <textarea
              rows={5}
              value={example}
              onChange={(event) => setExample(event.target.value)}
            />
          </label>
          <label>
            <span>Create a new class on save</span>
            <input
              value={newClassName}
              onChange={(event) => setNewClassName(event.target.value)}
              placeholder="Professional Responsibility"
            />
          </label>

          {error ? <p className="form-message error">{error}</p> : null}
          {message ? <p className="form-message success">{message}</p> : null}

          <div className="detail-actions">
            <button type="submit" className="primary-button">
              Save changes
            </button>
            <button
              type="button"
              className="danger-button"
              onClick={handleDelete}
            >
              Delete term
            </button>
          </div>
        </form>
      </article>
    </section>
  );
}
