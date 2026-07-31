import { LuShieldAlert, LuScale, LuShieldCheck } from "react-icons/lu";

const MIN = 0.1;
const MAX = 0.9;

function zoneFor(value) {
  if (value <= 0.3) {
    return {
      name: "Aggressive",
      hint: "Flags more transactions — catches more fraud, more false alarms.",
      color: "#e5484d",
      Icon: LuShieldAlert,
    };
  }
  if (value <= 0.55) {
    return {
      name: "Balanced",
      hint: "A middle ground between recall and precision.",
      color: "#d3982a",
      Icon: LuScale,
    };
  }
  return {
    name: "Conservative",
    hint: "Only flags high-confidence fraud — fewer false alarms, may miss some.",
    color: "#2fb677",
    Icon: LuShieldCheck,
  };
}

function ThresholdSlider({ value, onChange, onCommit, disabled }) {
  const zone = zoneFor(value);
  const pct = ((value - MIN) / (MAX - MIN)) * 100;

  return (
    <div
      className="rounded-xl border p-5 relative overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] transition-colors duration-300"
        style={{
          background: `radial-gradient(circle at ${pct}% 0%, ${zone.color}, transparent 60%)`,
        }}
      />

      <div className="relative flex items-center justify-between mb-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
          Decision threshold
        </h3>
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-semibold transition-colors duration-300"
          style={{ background: `${zone.color}1f`, color: zone.color }}
        >
          <zone.Icon size={13} />
          {zone.name}
        </div>
      </div>

      <div className="relative flex items-baseline gap-2 mt-3 mb-4">
        <span
          className="font-mono text-3xl font-bold tabular-nums transition-colors duration-300"
          style={{ color: zone.color }}
        >
          {value.toFixed(2)}
        </span>
        <span className="text-xs" style={{ color: "var(--text-dim)" }}>
          fraud probability cutoff
        </span>
      </div>

      <div className="relative">
        <div
          className="absolute top-1/2 left-0 right-0 h-2 -translate-y-1/2 rounded-full pointer-events-none"
          style={{
            background:
              "linear-gradient(90deg, #e5484d 0%, #d3982a 50%, #2fb677 100%)",
            opacity: disabled ? 0.35 : 0.9,
          }}
        />
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={0.01}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
          onKeyUp={onCommit}
          className="live-threshold-slider relative w-full disabled:cursor-not-allowed"
          style={{ "--thumb-color": zone.color }}
        />
      </div>

      <div className="relative flex items-center justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>
        <span>0.10 · aggressive</span>
        <span>0.90 · conservative</span>
      </div>

      <p className="relative text-[11px] mt-3 leading-relaxed" style={{ color: "var(--text-dim)" }}>
        {zone.hint}
      </p>
    </div>
  );
}

export default ThresholdSlider;
