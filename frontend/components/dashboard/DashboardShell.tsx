"use client";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { useLogout } from "@/hooks/useAuth";
import { useKanban } from "@/hooks/useKanban";

export function DashboardShell() {
  const logout = useLogout();
  const { data, isLoading } = useKanban();

  const activeLeads = (!isLoading || data)
    ? (data ? Object.values(data).flat().filter((l) => l.status !== "finalizado").length : 0)
    : null;

  return (
    <div
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Faixa 1 — header sticky com blur */}
      <header
        style={{
          position: "sticky",
          top: 0,
          flexShrink: 0,
          background: "var(--color-bg-overlay)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-border-subtle)",
          zIndex: "var(--z-sticky)" as never,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 var(--space-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: 56,
          }}
        >
          {/* Logo + breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "var(--color-brand)",
                color: "var(--color-text-inverse)",
                display: "grid",
                placeItems: "center",
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-bold)",
                fontSize: "var(--text-lg)",
                letterSpacing: "var(--tracking-wider)",
                clipPath: "polygon(15% 0, 100% 0, 85% 100%, 0 100%)",
              }}
            >
              C
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: "var(--weight-bold)",
                letterSpacing: "var(--tracking-wider)",
                fontSize: "var(--text-base)",
                color: "var(--color-text-primary)",
              }}
            >
              CRATE<span style={{ color: "var(--color-brand)" }}>{"//"}</span>BR
            </span>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                color: "var(--color-text-muted)",
                letterSpacing: "var(--tracking-widest)",
                textTransform: "uppercase",
                borderLeft: "1px solid var(--color-border-default)",
                paddingLeft: "var(--space-3)",
                marginLeft: "var(--space-1)",
              }}
            >
              Kanban
            </span>
          </div>

          {/* Botão Sair */}
          <button
            onClick={logout}
            className="logout-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--space-2) var(--space-3)",
              background: "transparent",
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-brand-dim)",
              borderRadius: "var(--radius-sm)",
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              letterSpacing: "var(--tracking-wider)",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all var(--duration-fast) var(--ease-out)",
            }}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Main — flex column para controlar altura do board */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          maxWidth: 1400,
          width: "100%",
          margin: "0 auto",
          padding: "var(--space-6) var(--space-5)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Faixa 2 — sub-header hierárquico */}
        <div style={{ flexShrink: 0, marginBottom: "var(--space-6)" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-brand)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
              marginBottom: "var(--space-2)",
            }}
          >
            Gestão de Leads
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-3xl)",
              fontWeight: "var(--weight-bold)",
              letterSpacing: "var(--tracking-tight)",
              textTransform: "uppercase",
              color: "var(--color-text-primary)",
              margin: 0,
              marginBottom: "var(--space-3)",
            }}
          >
            Pipeline de Vendas
          </h1>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--color-brand)",
              letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase",
            }}
          >
            {activeLeads === null
              ? "carregando..."
              : activeLeads === 0
              ? "nenhum lead ainda"
              : `${activeLeads} lead${activeLeads !== 1 ? "s" : ""} em atendimento`}
          </div>
        </div>

        {/* Board — ocupa o espaço restante */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <KanbanBoard />
        </div>
      </main>
    </div>
  );
}

