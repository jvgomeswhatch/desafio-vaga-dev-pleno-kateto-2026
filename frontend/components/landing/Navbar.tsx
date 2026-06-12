export function Navbar() {
  return (
    <header style={{
      position: "sticky", top: 0,
      background: "var(--color-bg-overlay)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--color-border-subtle)",
      zIndex: "var(--z-sticky)" as never,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 var(--space-5)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 56,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <div style={{
            width: 32, height: 32,
            background: "var(--color-brand)", color: "var(--color-text-inverse)",
            display: "grid", placeItems: "center",
            fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)",
            fontSize: "var(--text-lg)", letterSpacing: "var(--tracking-wider)",
            clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
          }}>C</div>
          <span style={{
            fontFamily: "var(--font-display)", fontWeight: "var(--weight-bold)",
            letterSpacing: "var(--tracking-wider)", fontSize: "var(--text-base)",
          }}>
            CRATE<span style={{ color: "var(--color-brand)" }}>//</span>BR
          </span>
        </div>

        <nav style={{ display: "flex", gap: "var(--space-5)", alignItems: "center" }}>
          <a href="#vitrine" className="nav-link" style={{
            display: "inline-flex", alignItems: "center",
            padding: "var(--space-2) var(--space-3)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)", letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            transition: "all var(--duration-fast) var(--ease-out)",
          }}>
            Vitrine
          </a>
          <a href="#quero" className="nav-link" style={{
            display: "inline-flex", alignItems: "center",
            padding: "var(--space-2) var(--space-3)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            color: "var(--color-text-secondary)", letterSpacing: "var(--tracking-wider)",
            textTransform: "uppercase",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-sm)",
            transition: "all var(--duration-fast) var(--ease-out)",
          }}>
            Solicitar
          </a>
          <a href="/login" className="nav-vendedores" style={{
            display: "inline-flex", alignItems: "center",
            padding: "var(--space-2) var(--space-3)",
            background: "var(--color-brand-bg)",
            color: "var(--color-brand)",
            border: "1px solid var(--color-brand-dim)",
            borderRadius: "var(--radius-sm)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-wider)", textTransform: "uppercase",
            transition: "all var(--duration-fast) var(--ease-out)",
          }}>
            Área do Vendedor
          </a>
        </nav>
      </div>
    </header>
  );
}
