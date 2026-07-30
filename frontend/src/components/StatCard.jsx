function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
          {label}
        </span>
        {Icon && (
          <Icon size={16} style={{ color: accent || "var(--text-dim)" }} />
        )}
      </div>
      <div className="font-mono text-2xl font-semibold" style={{ color: accent || "var(--text)" }}>
        {value}
      </div>
    </div>
  );
}

export default StatCard;
