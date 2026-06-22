export function Feature({ icon, title, text }) {
  return (
    <article className="feature-item">
      <span>{icon}</span>
      <strong>{title}</strong>
      <p>{text}</p>
    </article>
  );
}