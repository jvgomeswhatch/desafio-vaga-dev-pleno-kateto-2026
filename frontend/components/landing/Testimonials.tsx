const TESTIMONIALS = [
  {
    initials: "F.S",
    name: "Felipe Silva",
    city: "São Paulo, SP",
    text: "Comprei minha Karambit Doppler e fui atendido em menos de uma hora. O vendedor me mandou o inspect link antes de fechar. Confiança total.",
    skin: "★ Karambit | Doppler",
  },
  {
    initials: "R.M",
    name: "Rodrigo Martins",
    city: "Curitiba, PR",
    text: "Procurava uma AK Redline ST™ com float específico. O Marcelo achou em dois dias. Preço abaixo do mercado e entrega no mesmo dia.",
    skin: "AK-47 | Redline ST™",
  },
  {
    initials: "G.O",
    name: "Gabriel Oliveira",
    city: "Belo Horizonte, MG",
    text: "Já comprei três skins aqui. Processo simples, atendimento rápido pelo WhatsApp e nunca tive problema. Recomendo sem hesitar.",
    skin: "AWP | Dragon Lore",
  },
];

export function Testimonials() {
  return (
    <section style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-8) var(--space-5)" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "var(--space-7)" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
          fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
          color: "var(--color-brand)", letterSpacing: "var(--tracking-widest)",
          textTransform: "uppercase", marginBottom: "var(--space-3)",
        }}>
          <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
          Depoimentos
          <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
        </div>
        <h2 style={{
          fontSize: "var(--text-3xl)", letterSpacing: "var(--tracking-tight)",
          textTransform: "uppercase",
        }}>
          Quem já comprou,<br />
          <span style={{ color: "var(--color-brand)" }}>volta sempre</span>
        </h2>
      </div>

      {/* Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "var(--space-4)",
      }}>
        {TESTIMONIALS.map(({ initials, name, city, text, skin }) => (
          <div
            key={name}
            style={{
              background: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-5)",
              display: "flex", flexDirection: "column", gap: "var(--space-4)",
            }}
          >
            {/* Stars */}
            <div style={{ color: "var(--color-accent)", fontSize: "var(--text-sm)", letterSpacing: "var(--space-1)" }}>
              ★★★★★
            </div>

            {/* Text */}
            <p style={{
              fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
              lineHeight: "var(--leading-relaxed)", flex: 1,
            }}>
              &ldquo;{text}&rdquo;
            </p>

            {/* Skin badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "var(--space-1)",
              padding: "2px 8px",
              background: "var(--color-brand-bg)", border: "1px solid var(--color-brand-dim)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
              color: "var(--color-brand)", letterSpacing: "var(--tracking-wide)",
              alignSelf: "flex-start",
            }}>
              ▸ {skin}
            </div>

            {/* Author */}
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--space-3)",
              paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-subtle)",
            }}>
              <div style={{
                width: 36, height: 36,
                background: "var(--color-bg-raised)",
                border: "1px solid var(--color-brand)",
                borderRadius: "var(--radius-pill)",
                display: "grid", placeItems: "center",
                fontFamily: "var(--font-display)", fontSize: "var(--text-xs)",
                fontWeight: "var(--weight-bold)", color: "var(--color-brand)",
                flexShrink: 0,
              }}>
                {initials}
              </div>
              <div>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "var(--text-sm)",
                  fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)",
                  color: "var(--color-text-primary)",
                }}>{name}</div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                  color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wide)",
                }}>{city}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
