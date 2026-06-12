//Leonardo Stuani Godoi
export const StuaniMark = ({ size = 36 }) => (
  <img
    src="/android-chrome-192x192.png"
    alt="Stuani"
    width={size}
    height={size}
    style={{ borderRadius: Math.round(size * 0.22), display: "block", flexShrink: 0 }}
  />
);

export const StuaniLogo = ({ size = "md", dark = false }) => {
  const markSize = size === "sm" ? 28 : size === "lg" ? 44 : 34;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <StuaniMark size={markSize} />
      {size !== "sm" && (
        <span style={{
          fontSize: 11,
          color: dark ? "rgba(250,247,242,0.55)" : "var(--ink-3)",
          fontFamily: "JetBrains Mono, monospace",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          comandas
        </span>
      )}
    </div>
  );
};