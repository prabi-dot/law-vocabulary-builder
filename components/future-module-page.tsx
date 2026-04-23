import Link from "next/link";

export function FutureModulePage({
  title,
  badge,
  description,
  highlights,
}: {
  title: string;
  badge: string;
  description: string;
  highlights: string[];
}) {
  return (
    <section className="future-page">
      <div className="future-hero">
        <span className="phase-badge">{badge}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <Link href="/" className="primary-button">
          Back to notebook
        </Link>
      </div>
      <div className="future-grid">
        {highlights.map((item) => (
          <article key={item} className="future-card">
            <h2>{item}</h2>
            <p>
              This area is intentionally staged so the personal vocabulary flow
              stays polished before more advanced study tools are layered in.
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
