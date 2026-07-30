function TopFactors({ factors }) {
  if (!factors || factors.length === 0) return null;

  const maxWeight = Math.max(...factors.map((f) => f.weight), 0.0001);

  return (
    <div>
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: "var(--text-dim)" }}
      >
        What drove this result
      </h4>
      <div className="space-y-3">
        {factors.map((f) => {
          const pct = Math.max((f.weight / maxWeight) * 100, 6);
          const isRisk = f.impact === "increases_risk";
          const color = isRisk ? "var(--risk-high)" : "var(--risk-low)";

          return (
            <div key={f.feature}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: "var(--text)" }}>
                  {f.label}
                </span>
                <span
                  className="text-[10px] font-mono uppercase tracking-wide"
                  style={{ color }}
                >
                  {isRisk ? "↑ risk" : "↓ risk"}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "var(--border)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] mt-4" style={{ color: "var(--text-dim)" }}>
        Based on SHAP values from the model — only fields you filled in are shown.
      </p>
    </div>
  );
}

export default TopFactors;