import Image from "next/image";
import { FEATURED_SKINS } from "@/lib/skins-data";
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
  if (f < 0.07) return "Factory New";
  if (f < 0.15) return "Minimal Wear";
  if (f < 0.38) return "Field-Tested";
  if (f < 0.45) return "Well-Worn";
  return "Battle-Scarred";
};

export function FeaturedSkins() {
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
            Destaques
            <span style={{ display: "inline-block", width: 24, height: 1, background: "var(--color-brand)" }} />
          </div>
          <h2 style={{
            fontSize: "var(--text-3xl)", letterSpacing: "var(--tracking-tight)",
            textTransform: "uppercase", marginBottom: "var(--space-2)",
          }}>
            As skins mais cobiçadas
          </h2>
          <p style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--text-sm)",
            color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wide)",
          }}>
            Itens verificados · Entrega rápida · Melhor preço
          </p>
        </div>

        {/* Featured grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "var(--space-5)",
        }}>
          {FEATURED_SKINS.map((skin) => {
            const color = rarityColor[skin.rarity];
            const pct = `${(skin.float * 100).toFixed(0)}%`;

            return (
              <a
                key={skin.id}
                href="#quero"
                style={{
                  display: "flex", flexDirection: "column",
                  background: "var(--color-bg-surface)",
                  border: `1px solid var(--color-border-default)`,
                  borderTop: `3px solid ${color}`,
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  textDecoration: "none",
                  transition: "all var(--duration-base) var(--ease-out)",
                }}
                className="featured-card"
              >
                {/* Image */}
                <div style={{
                  position: "relative",
                  background: `radial-gradient(ellipse at center, ${color}22, var(--color-bg-base) 70%)`,
                  padding: "var(--space-6) var(--space-4)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  minHeight: 220,
                }}>
                  <Image
                    src={skin.imageUrl}
                    alt={`${skin.weapon} | ${skin.name}`}
                    width={340}
                    height={215}
                    style={{ objectFit: "contain", maxHeight: 215, width: "auto" }}
                    priority
                  />
                  {/* Badges */}
                  <div style={{ position: "absolute", top: "var(--space-3)", right: "var(--space-3)", display: "flex", gap: "var(--space-1)" }}>
                    {skin.stattrak && (
                      <span style={{
                        padding: "2px 6px",
                        background: "var(--color-brand)", color: "var(--color-text-inverse)",
                        fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                        fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-widest)",
                        borderRadius: "var(--radius-sm)",
                      }}>ST™</span>
                    )}
                    <span style={{
                      padding: "2px 6px",
                      background: "rgba(10,14,19,0.8)", backdropFilter: "blur(4px)",
                      border: `1px solid ${color}40`,
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                      color, letterSpacing: "var(--tracking-widest)",
                      borderRadius: "var(--radius-sm)",
                    }}>{rarityLabel[skin.rarity]}</span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)", flex: 1 }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                      color: "var(--color-text-muted)", letterSpacing: "var(--tracking-widest)",
                      textTransform: "uppercase", marginBottom: "var(--space-1)",
                    }}>{skin.weapon}</div>
                    <div style={{
                      fontFamily: "var(--font-display)", fontSize: "var(--text-xl)",
                      fontWeight: "var(--weight-bold)", letterSpacing: "var(--tracking-wide)",
                      color: "var(--color-text-primary)",
                    }}>{skin.name}</div>
                    <div style={{
                      fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)",
                      color: "var(--color-text-muted)", marginTop: "var(--space-1)",
                    }}>{wearLabel(skin.float)} · {skin.float.toFixed(4)}</div>
                  </div>

                  {/* Float meter */}
                  <div>
                    <div style={{
                      width: "100%", height: 4, borderRadius: "var(--radius-sm)", position: "relative",
                      background: "linear-gradient(90deg, var(--color-success) 0%, var(--color-success) 7%, var(--color-info) 7%, var(--color-info) 15%, var(--color-accent) 15%, var(--color-accent) 38%, var(--color-brand) 38%, var(--color-brand) 45%, var(--color-danger) 45%, var(--color-danger) 100%)",
                    }}>
                      <div style={{
                        position: "absolute", top: -3, left: pct,
                        width: 2, height: 10,
                        background: "var(--color-text-primary)",
                        boxShadow: "0 0 4px rgba(0,0,0,0.8)",
                        transform: "translateX(-1px)",
                      }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    paddingTop: "var(--space-3)", borderTop: "1px solid var(--color-border-subtle)",
                    marginTop: "auto",
                  }}>
                    <div>
                      <div style={{
                        fontFamily: "var(--font-mono)", fontSize: "var(--text-2xs)",
                        color: "var(--color-text-muted)", letterSpacing: "var(--tracking-wide)",
                        marginBottom: 2,
                      }}>PREÇO</div>
                      <div style={{
                        fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)",
                        fontWeight: "var(--weight-bold)", color: "var(--color-brand)",
                        letterSpacing: "var(--tracking-tight)", lineHeight: 1,
                      }}>
                        <small style={{
                          fontSize: "var(--text-sm)", color: "var(--color-text-secondary)",
                          fontWeight: "var(--weight-regular)", marginRight: "var(--space-1)",
                        }}>R$</small>
                        {skin.price}
                      </div>
                    </div>
                    <span style={{
                      display: "inline-flex", alignItems: "center",
                      padding: "var(--space-2) var(--space-4)",
                      background: "var(--color-brand)", color: "var(--color-text-inverse)",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-display)", fontSize: "var(--text-sm)",
                      fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-wider)",
                      textTransform: "uppercase",
                    }}>Quero</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

    </section>
  );
}
