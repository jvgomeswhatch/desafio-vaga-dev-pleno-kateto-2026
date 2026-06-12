export function WhyUs() {
  const items = [
    {
      icon: "🔒",
      title: "Skins verificadas",
      desc: "Cada item é inspecionado antes da venda. Float, pattern e autenticidade confirmados.",
    },
    {
      icon: "💬",
      title: "Atendimento humano",
      desc: "Sem bots. Um vendedor especialista fala com você pelo WhatsApp para fechar o melhor negócio.",
    },
    {
      icon: "⚡",
      title: "Resposta em até 2h",
      desc: "Nosso time responde rápido. De segunda a sábado, das 9h às 22h.",
    },
    {
      icon: "🤝",
      title: "Negociação direta",
      desc: "Preço justo, sem taxas escondidas. Você negocia diretamente com quem conhece o item.",
    },
  ];

  return (
    <section style={{
      background: "var(--color-bg-elevated)",
      borderTop: "1px solid var(--color-border-subtle)",
      borderBottom: "1px solid var(--color-border-subtle)",
      padding: "var(--space-8) 0",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 var(--space-5)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "var(--space-7)" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            color: "var(--color-brand)", letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase", marginBottom: "var(--space-3)",
          }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
            Por que a CRATE//BR
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
          </div>
          <h2 style={{
            fontSize: "var(--text-3xl)", letterSpacing: "var(--tracking-tight)",
            textTransform: "uppercase",
          }}>
            Comprar skin não precisa<br />
            <span style={{ color: "var(--color-brand)" }}>ser complicado</span>
          </h2>
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "var(--space-4)",
        }}>
          {items.map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "var(--color-bg-surface)",
                border: "1px solid var(--color-border-default)",
                borderTop: "2px solid var(--color-brand)",
                borderRadius: "var(--radius-sm)",
                padding: "var(--space-5)",
              }}
            >
              <div style={{ fontSize: "var(--text-2xl)", marginBottom: "var(--space-3)" }}>{icon}</div>
              <h3 style={{
                fontFamily: "var(--font-display)", fontSize: "var(--text-lg)",
                fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)",
                textTransform: "uppercase", color: "var(--color-text-primary)",
                marginBottom: "var(--space-2)",
              }}>{title}</h3>
              <p style={{
                fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
                lineHeight: "var(--leading-snug)",
              }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
