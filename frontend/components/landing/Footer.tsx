export function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid var(--color-border-subtle)",
      padding: "var(--space-6) var(--space-5)",
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "var(--space-3)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{
            width: 24, height: 24,
            background: "var(--color-brand)", color: "var(--color-text-inverse)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)",
            fontSize: "var(--text-sm)", clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
          }}>C</div>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wide)",
          }}>
            CRATE<span style={{ color: "var(--color-brand)" }}>{"//"}</span>BR © 2026
          </span>
        </div>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
          color: "var(--color-text-disabled)", letterSpacing: "var(--tracking-wide)",
          textTransform: "uppercase",
        }}>
          Não afiliado à Valve Corporation
        </span>
      </div>
    </footer>
  );
}
