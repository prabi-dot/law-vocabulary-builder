"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useClassMap, useVocabStore } from "@/components/vocab-provider";
import type { VocabEntry } from "@/lib/types";

const CANVAS_WIDTH = 760;
const CANVAS_HEIGHT = 420;

export function DoodleStudio() {
  const { classes, entries, isLoaded, saveDoodle } = useVocabStore();
  const classMap = useClassMap(classes);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const hasStrokeRef = useRef(false);
  const [selectedTermId, setSelectedTermId] = useState("");
  const [message, setMessage] = useState("");
  const [lineWidth, setLineWidth] = useState(3);

  const sortedEntries = useMemo(
    () =>
      [...entries].sort(
        (left, right) =>
          new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      ),
    [entries],
  );

  const selectedEntry = sortedEntries.find((entry) => entry.id === selectedTermId);

  useEffect(() => {
    if (!selectedTermId && sortedEntries[0]) {
      setSelectedTermId(sortedEntries[0].id);
    }
  }, [selectedTermId, sortedEntries]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "#16202a";
    context.lineWidth = lineWidth;

    if (!selectedEntry?.doodleData) {
      hasStrokeRef.current = false;
      return;
    }

    const image = new Image();
    image.onload = () => {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      context.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      hasStrokeRef.current = true;
    };
    image.src = selectedEntry.doodleData;
  }, [selectedEntry?.id, selectedEntry?.doodleData, lineWidth]);

  function getContext() {
    const canvas = canvasRef.current;
    if (!canvas) {
      return null;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return null;
    }

    context.strokeStyle = "#16202a";
    context.lineWidth = lineWidth;
    context.lineCap = "round";
    context.lineJoin = "round";
    return { canvas, context };
  }

  function getCoordinates(
    event: ReactPointerEvent<HTMLCanvasElement>,
    canvas: HTMLCanvasElement,
  ) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    const setup = getContext();
    if (!setup) {
      return;
    }

    const { canvas, context } = setup;
    const { x, y } = getCoordinates(event, canvas);
    drawingRef.current = true;
    hasStrokeRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x, y);
    context.stroke();
    setMessage("");
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    const setup = getContext();
    if (!setup) {
      return;
    }

    const { canvas, context } = setup;
    const { x, y } = getCoordinates(event, canvas);
    context.lineTo(x, y);
    context.stroke();
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) {
      return;
    }

    drawingRef.current = false;
    canvasRef.current?.releasePointerCapture(event.pointerId);
  }

  function handleSave() {
    if (!selectedEntry || !canvasRef.current) {
      return;
    }

    const dataUrl = canvasRef.current.toDataURL("image/png");
    saveDoodle(selectedEntry.id, hasStrokeRef.current ? dataUrl : null);
    setMessage(
      hasStrokeRef.current
        ? `Saved doodle for ${selectedEntry.term}.`
        : `Cleared doodle for ${selectedEntry.term}.`,
    );
  }

  function handleClear() {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }

    context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    hasStrokeRef.current = false;
    setMessage("Canvas cleared. Save to remove the stored doodle.");
  }

  const doodledEntries = sortedEntries.filter((entry) => entry.doodleData);

  return (
    <section className="doodle-page">
      <div className="hero-card doodle-hero">
        <div>
          <span className="phase-badge">Visual memory</span>
          <h1>Sketch legal concepts beside your notes.</h1>
          <p>
            Turn abstract terms into memorable visuals with quick diagrams,
            symbols, arrows, and exam-trigger doodles tied to the term itself.
          </p>
        </div>
        <div className="stats-grid" aria-label="Doodle statistics">
          <article className="stat-card">
            <strong>{entries.length}</strong>
            <span>Available terms</span>
          </article>
          <article className="stat-card">
            <strong>{doodledEntries.length}</strong>
            <span>Saved doodles</span>
          </article>
          <article className="stat-card">
            <strong>{entries.length - doodledEntries.length}</strong>
            <span>Open for sketching</span>
          </article>
        </div>
      </div>

      {!isLoaded ? (
        <article className="empty-card">
          <h3>Loading your notebook</h3>
          <p>Your saved terms will appear here in a moment.</p>
        </article>
      ) : !sortedEntries.length ? (
        <article className="empty-card">
          <h3>No terms to sketch yet</h3>
          <p>Add a few vocabulary entries first, then come back to attach visual cues.</p>
          <Link href="/" className="primary-button">
            Go to dashboard
          </Link>
        </article>
      ) : (
        <div className="doodle-grid">
          <section className="doodle-panel">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Studio</p>
                <h2>Doodle canvas</h2>
              </div>
              <span className="muted-label">
                {selectedEntry?.doodleData ? "Saved sketch loaded" : "New sketch"}
              </span>
            </div>

            <div className="doodle-controls">
              <label>
                <span>Term</span>
                <select
                  value={selectedTermId}
                  onChange={(event) => {
                    setSelectedTermId(event.target.value);
                    setMessage("");
                  }}
                >
                  {sortedEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.term} · {classMap[entry.classId]?.name ?? "Unsorted"}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Pen size</span>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={lineWidth}
                  onChange={(event) => setLineWidth(Number(event.target.value))}
                />
              </label>
            </div>

            {selectedEntry ? (
              <div className="selected-term-card">
                <div>
                  <p className="entry-class">
                    {classMap[selectedEntry.classId]?.name ?? "Unsorted"}
                  </p>
                  <h3>{selectedEntry.term}</h3>
                </div>
                <p>{selectedEntry.definition}</p>
              </div>
            ) : null}

            <div className="canvas-frame">
              <canvas
                ref={canvasRef}
                className="doodle-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              />
            </div>

            <div className="detail-actions">
              <button type="button" className="primary-button" onClick={handleSave}>
                Save doodle
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleClear}
              >
                Clear canvas
              </button>
              {selectedEntry ? (
                <Link href={`/terms/${selectedEntry.id}`} className="text-link">
                  Open term detail
                </Link>
              ) : null}
            </div>

            {message ? <p className="form-message success">{message}</p> : null}
          </section>

          <aside className="doodle-sidebar">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Gallery</p>
                <h2>Saved sketches</h2>
              </div>
              <span className="muted-label">{doodledEntries.length} stored</span>
            </div>

            <div className="doodle-gallery">
              {doodledEntries.length ? (
                doodledEntries.map((entry: VocabEntry) => (
                  <button
                    key={entry.id}
                    type="button"
                    className={
                      selectedTermId === entry.id
                        ? "doodle-thumb active"
                        : "doodle-thumb"
                    }
                    onClick={() => {
                      setSelectedTermId(entry.id);
                      setMessage("");
                    }}
                  >
                    <img src={entry.doodleData ?? ""} alt={`Doodle for ${entry.term}`} />
                    <div>
                      <strong>{entry.term}</strong>
                      <span>{classMap[entry.classId]?.name ?? "Unsorted"}</span>
                    </div>
                  </button>
                ))
              ) : (
                <article className="empty-card compact-empty">
                  <h3>No doodles saved yet</h3>
                  <p>Pick a term, sketch a memory cue, and save it to start the gallery.</p>
                </article>
              )}
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
