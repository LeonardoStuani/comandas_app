//Leonardo Stuani Godoi
const PageLayout = ({ children, title, actions }) => (
  <div style={{ padding: "24px 32px" }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.025em", margin: 0, color: "var(--ink)" }}>
        {title}
      </h1>
      {actions && (
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
      )}
    </div>
    <div className="card card-pad" style={{ minHeight: 300 }}>
      {children}
    </div>
  </div>
);

export default PageLayout;