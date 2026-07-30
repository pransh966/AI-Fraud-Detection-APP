const SEGMENTS = 24;

function colorFor(pct) {
  if (pct >= 70) return "#e5484d";
  if (pct >= 40) return "#d3982a";
  return "#2fb677";
}

function ProbabilityMeter({ probability, size = "md" }) {
  const pct = Math.round((probability || 0) * 100);
  const filled = Math.round((pct / 100) * SEGMENTS);
  const color = colorFor(pct);
  const height = size === "lg" ? "h-4" : "h-2.5";

  return (
    <div className="w-full">
      <div className={`flex gap-[3px] ${height}`}>
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-[1px] transition-colors duration-300"
            style={{
              background: i < filled ? color : "var(--border)",
              boxShadow: i < filled ? `0 0 6px ${color}55` : "none",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] font-mono text-[color:var(--text-dim)] uppercase tracking-wider">
          fraud signal
        </span>
        <span
          className="text-xs font-mono font-semibold"
          style={{ color }}
        >
          {pct}%
        </span>
      </div>
    </div>
  );
}

export default ProbabilityMeter;
