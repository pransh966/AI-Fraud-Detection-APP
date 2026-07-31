import { useMemo, useState } from "react";
import { LuScale } from "react-icons/lu";

function colorFor(v) {
  if (v <= 0.3) return "#e5484d";
  if (v <= 0.55) return "#d3982a";
  return "#2fb677";
}

// Replays recent predictions against a hypothetical cutoff, purely
// client-side — lets the person feel out precision/recall trade-offs
// without re-running anything on the backend.
function ThresholdImpactSimulator({ predictions }) {
  const [t, setT] = useState(0.5);
  const color = colorFor(t);

  const { flagged, total } = useMemo(() => {
    const probs = predictions.map((p) => Number(p.probability)).filter((v) => !Number.isNaN(v));
    return {
      flagged: probs.filter((p) => p >= t).length,
      total: probs.length,
    };
  }, [predictions, t]);

  const pct = total > 0 ? (flagged / total) * 100 : 0;

  return (
    <div
      className="hover-lift rounded-xl border p-5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-medium flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
          <LuScale size={14} /> Threshold impact simulator
        </h2>
        <span className="font-mono text-xs px-2 py-0.5 rounded-full" style={{ background: `${color}1f`, color }}>
          {t.toFixed(2)}
        </span>
      </div>
      <p className="text-[11px] mb-3" style={{ color: "var(--text-dim)" }}>
        Replays your last {total} predictions against a hypothetical cutoff.
      </p>

      <input
        type="range"
        min={0.1}
        max={0.9}
        step={0.01}
        value={t}
        onChange={(e) => setT(Number(e.target.value))}
        className="live-threshold-slider w-full"
        style={{ "--thumb-color": color }}
      />

      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
          <div
            className="h-full rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%`, background: color }}
          />
        </div>
        <span key={flagged} className="count-pulse font-mono text-sm font-semibold whitespace-nowrap" style={{ color }}>
          {flagged} / {total} flagged
        </span>
      </div>
    </div>
  );
}

export default ThresholdImpactSimulator;
