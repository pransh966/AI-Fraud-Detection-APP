import useCountUp from "../hooks/useCountUp";

function StatCard({ label, value, icon: Icon, accent }) {
  const numeric = typeof value === "number";
  const animated = useCountUp(numeric ? value : 0);
  const display = numeric ? Math.round(animated) : value;

  return (
    <div
      className="hover-lift rounded-xl border p-5 relative overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {accent && (
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ background: `radial-gradient(circle at 100% 0%, ${accent}, transparent 65%)` }}
        />
      )}
      <div className="relative flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
          {label}
        </span>
        {Icon && (
          <Icon size={16} className="icon-pop" style={{ color: accent || "var(--text-dim)" }} />
        )}
      </div>
      <div className="relative font-mono text-2xl font-semibold tabular-nums" style={{ color: accent || "var(--text)" }}>
        {display}
      </div>
    </div>
  );
}

export default StatCard;
