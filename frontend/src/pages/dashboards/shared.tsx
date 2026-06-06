import type { ReactNode } from "react";

export const pageStyle = {
  minHeight: "100vh",
  backgroundColor: "var(--bg)",
  color: "var(--text)",
  padding: "32px 24px",
} as const;

export const cardStyle = {
  backgroundColor: "var(--bg-surface)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-lg)",
  padding: "20px",
  boxShadow: "var(--shadow-sm)",
} as const;

export const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  backgroundColor: "var(--bg)",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-md)",
  color: "var(--text)",
  marginBottom: "10px",
} as const;

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      borderRadius: "999px",
      padding: "4px 10px",
      fontSize: "11px",
      fontFamily: "var(--font-mono)",
      fontWeight: 700,
      backgroundColor: "var(--accent-muted)",
      color: "var(--accent)",
    }}>
      {children}
    </span>
  );
}

export function getApiError(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const maybeResponse = error as { response?: { data?: { error?: string } } };
    return maybeResponse.response?.data?.error || fallback;
  }

  return fallback;
}
