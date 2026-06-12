import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-5)",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 400,
          background: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border-default)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, var(--color-brand), var(--color-accent), var(--color-brand))",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            marginBottom: "var(--space-7)",
          }}
        >
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
            }}
          >
            CRATE<span style={{ color: "var(--color-brand)" }}>//</span>BR
          </span>
        </div>

        <div style={{ marginBottom: "var(--space-6)" }}>
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
            Área restrita
          </div>
          <h1
            style={{
              fontSize: "var(--text-2xl)",
              letterSpacing: "var(--tracking-tight)",
              textTransform: "uppercase",
            }}
          >
            Acesso de Vendedores
          </h1>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
