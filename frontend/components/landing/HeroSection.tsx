import { LeadForm } from "@/components/LeadForm";

export function HeroSection() {
  return (
    <section
      style={{
        position: "relative",
        overflow: "hidden",
        paddingTop: "var(--space-9)",
        paddingBottom: "var(--space-8)",
      }}
    >
      {/* Radial glow background */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(207,106,50,0.15), transparent 70%)",
      }} />

      <div style={{
        maxWidth: 1200, margin: "0 auto",
        padding: "0 var(--space-5)",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "var(--space-8)",
        position: "relative",
      }}
        className="hero-grid"
      >
        {/* Left — copy */}
        <div>
          {/* Killfeed eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
            padding: "var(--space-2) var(--space-3)",
            background: "rgba(0,0,0,0.55)", borderLeft: "2px solid var(--color-brand)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            letterSpacing: "var(--tracking-wider)", textTransform: "uppercase",
            whiteSpace: "nowrap", marginBottom: "var(--space-5)",
          }}>
            <span style={{ color: "var(--color-brand)", fontWeight: "var(--weight-bold)" }}>CRATE//BR</span>
            <span style={{ color: "var(--color-text-disabled)" }}>›</span>
            <span style={{ color: "var(--color-accent)", fontWeight: "var(--weight-medium)" }}>SKINS VERIFICADAS · ATENDIMENTO HUMANO</span>
          </div>

          <h1 style={{
            fontSize: "clamp(2.25rem, 6vw, var(--text-5xl))",
            fontWeight: "var(--weight-bold)",
            letterSpacing: "var(--tracking-tight)",
            lineHeight: 0.95,
            textTransform: "uppercase",
            marginBottom: "var(--space-5)",
          }}>
            COMPRE SKINS<br />
            RARAS DE CS2<br />
            <span style={{ color: "var(--color-brand)" }}>COM SEGURANÇA</span>
          </h1>

          <p style={{
            fontSize: "var(--text-lg)",
            color: "var(--color-text-secondary)",
            maxWidth: "46ch",
            lineHeight: "var(--leading-snug)",
            marginBottom: "var(--space-6)",
          }}>
            Dragon Lore, Karambit Doppler, Howl e dezenas de skins verificadas.
            Negocie com especialistas via WhatsApp e receba com segurança.
          </p>

          {/* Trust chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginBottom: "var(--space-7)" }}>
            {[
              "✓ Skins verificadas",
              "✓ Resposta em 2h",
              "✓ Atendimento via WhatsApp",
              "✓ Negociação direta",
            ].map((item) => (
              <span key={item} style={{
                display: "inline-flex", alignItems: "center",
                padding: "var(--space-1) var(--space-3)",
                background: "rgba(207,106,50,0.08)",
                border: "1px solid rgba(207,106,50,0.2)",
                borderRadius: "var(--radius-sm)",
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                color: "var(--color-brand)", letterSpacing: "var(--tracking-wide)",
              }}>
                {item}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: "var(--space-4)", paddingTop: "var(--space-5)",
            borderTop: "1px solid var(--color-border-subtle)",
          }}>
            {[
              { value: "500+", label: "Skins vendidas" },
              { value: "4.9★", label: "Avaliação média" },
              { value: "< 2h", label: "Tempo de resposta" },
            ].map(({ value, label }) => (
              <div key={label}>
                <div style={{
                  fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)",
                  fontWeight: "var(--weight-bold)", color: "var(--color-text-primary)",
                  letterSpacing: "var(--tracking-tight)",
                }}>
                  {value}
                </div>
                <div style={{
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                  color: "var(--color-text-muted)", letterSpacing: "var(--tracking-widest)",
                  textTransform: "uppercase", marginTop: "var(--space-1)",
                }}>
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — inline form */}
        <div id="quero">
          <div style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-6)",
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, var(--color-brand), var(--color-accent), var(--color-brand))",
            }} />

            <div style={{ marginBottom: "var(--space-5)" }}>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                color: "var(--color-brand)", letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase", marginBottom: "var(--space-2)",
              }}>
                Solicitar agora
              </div>
              <h2 style={{
                fontSize: "var(--text-2xl)", letterSpacing: "var(--tracking-tight)",
                textTransform: "uppercase", marginBottom: "var(--space-1)",
              }}>
                Quer uma skin específica?
              </h2>
              <p style={{
                fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-snug)",
              }}>
                Preencha abaixo e um vendedor entra em contato pelo WhatsApp.
              </p>
            </div>

            <LeadForm />
          </div>
        </div>
      </div>

    </section>
  );
}
