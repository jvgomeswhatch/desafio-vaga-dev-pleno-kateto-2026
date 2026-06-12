import Image from "next/image";
import { SKINS } from "@/lib/skins-data";
import type { Rarity } from "@/types";

const rarityColor: Record<Rarity, string> = {
  consumer:   "var(--color-rarity-consumer)",
  industrial: "var(--color-rarity-industrial)",
  milspec:    "var(--color-rarity-milspec)",
  restricted: "var(--color-rarity-restricted)",
  classified: "var(--color-rarity-classified)",
  covert:     "var(--color-rarity-covert)",
  knife:      "var(--color-rarity-knife)",
};

const rarityLabel: Record<Rarity, string> = {
  consumer:   "Consumer",
  industrial: "Industrial",
  milspec:    "Mil-Spec",
  restricted: "Restricted",
  classified: "Classified",
  covert:     "Covert",
  knife:      "★ Knife",
};

const wearLabel = (f: number) => {
  if (f < 0.07) return "FN";
  if (f < 0.15) return "MW";
  if (f < 0.38) return "FT";
  if (f < 0.45) return "WW";
  return "BS";
};

export function SkinGrid() {
  return (
    <section id="vitrine" style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--space-8) var(--space-5)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "var(--space-3)", marginBottom: "var(--space-6)" }}>
        <div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "var(--space-2)",
            fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
            color: "var(--color-brand)", letterSpacing: "var(--tracking-widest)",
            textTransform: "uppercase", marginBottom: "var(--space-2)",
          }}>
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
            Catálogo
          </div>
          <h2 style={{ fontSize: "var(--text-3xl)", letterSpacing: "var(--tracking-tight)", textTransform: "uppercase" }}>
            Todas as skins
          </h2>
        </div>
        <a href="#quero" className="solicite-link" style={{
          display: "inline-flex", alignItems: "center",
          padding: "var(--space-2) var(--space-4)",
          background: "var(--color-brand-bg)", color: "var(--color-brand)",
          border: "1px solid var(--color-brand)",
          borderRadius: "var(--radius-sm)",
          fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
          letterSpacing: "var(--tracking-wider)", textTransform: "uppercase",
          transition: "all var(--duration-base) var(--ease-out)",
        }}>
          Não achou o que quer? Solicite →
        </a>
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
        gap: "var(--space-4)",
      }}>
        {SKINS.map((skin) => {
          const color = rarityColor[skin.rarity];
          const pct = `${(skin.float * 100).toFixed(0)}%`;

          return (
            <a
              key={skin.id}
              href="#quero"
              style={{
                display: "flex", flexDirection: "column",
                background: "var(--color-bg-elevated)",
                border: `1px solid var(--color-border-default)`,
                borderLeft: `3px solid ${color}`,
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                textDecoration: "none",
                transition: "all var(--duration-base) var(--ease-out)",
              }}
              className="skin-grid-card"
            >
              {/* Image area */}
              <div style={{
                background: `radial-gradient(ellipse at center, ${color}12, var(--color-bg-base) 70%)`,
                padding: "var(--space-4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
                aspectRatio: "16/9",
              }}>
                <Image
                  src={skin.imageUrl}
                  alt={`${skin.weapon} | ${skin.name}`}
                  width={220}
                  height={138}
                  style={{ objectFit: "contain", maxHeight: 120, width: "auto" }}
                />
                {skin.stattrak && (
                  <span style={{
                    position: "absolute", top: "var(--space-2)", left: "var(--space-2)",
                    padding: "1px 5px",
                    background: "var(--color-brand)", color: "var(--color-text-inverse)",
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                    fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-widest)",
                    borderRadius: "var(--radius-sm)",
                  }}>ST™</span>
                )}
                <span style={{
                  position: "absolute", top: "var(--space-2)", right: "var(--space-2)",
                  padding: "1px 5px",
                  background: "rgba(10,14,19,0.75)", backdropFilter: "blur(4px)",
                  border: `1px solid ${color}40`,
                  fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                  color, letterSpacing: "var(--tracking-widest)",
                  borderRadius: "var(--radius-sm)",
                }}>{rarityLabel[skin.rarity]}</span>
              </div>

              {/* Body */}
              <div style={{ padding: "var(--space-3)", display: "flex", flexDirection: "column", gap: "var(--space-2)", flex: 1 }}>
                <div>
                  <div style={{
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                    color: "var(--color-text-muted)", letterSpacing: "var(--tracking-widest)",
                    textTransform: "uppercase",
                  }}>{skin.weapon}</div>
                  <div style={{
                    fontFamily: "var(--font-display)", fontSize: "var(--text-base)",
                    fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wide)",
                    color: "var(--color-text-primary)",
                  }}>{skin.name}</div>
                </div>

                {/* Float meter */}
                <div style={{
                  width: "100%", height: 3, borderRadius: "var(--radius-sm)", position: "relative",
                  background: "linear-gradient(90deg, var(--color-success) 0%, var(--color-success) 7%, var(--color-info) 7%, var(--color-info) 15%, var(--color-accent) 15%, var(--color-accent) 38%, var(--color-brand) 38%, var(--color-brand) 45%, var(--color-danger) 45%, var(--color-danger) 100%)",
                }}>
                  <div style={{
                    position: "absolute", top: -2, left: pct,
                    width: 2, height: 7,
                    background: "var(--color-text-primary)",
                    transform: "translateX(-1px)",
                  }} />
                </div>

                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-border-subtle)",
                  marginTop: "auto",
                }}>
                  <div>
                    <span style={{
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                      color: "var(--color-text-muted)",
                    }}>{wearLabel(skin.float)} · </span>
                    <span style={{
                      fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
                      fontWeight: "var(--weight-bold)", color: "var(--color-brand)",
                    }}>
                      <small style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)", fontWeight: "var(--weight-regular)" }}>R$ </small>
                      {skin.price}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                    color: "var(--color-brand)", letterSpacing: "var(--tracking-wider)",
                    textTransform: "uppercase",
                  }}>Quero →</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>

    </section>
  );
}
