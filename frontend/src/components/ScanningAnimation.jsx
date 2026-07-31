import { useEffect, useRef, useState } from "react";
import { LuRadar, LuCpu, LuDatabase } from "react-icons/lu";

// Simulated, non-linear progress: fast at first, eases toward 92% and waits
// there until the real response lands — then the parent flips `done`.
function useSimulatedProgress(active) {
  const [pct, setPct] = useState(0);
  const raf = useRef(null);
  const start = useRef(null);

  useEffect(() => {
    if (!active) {
      setPct(0);
      return;
    }
    start.current = performance.now();
    const step = (t) => {
      const elapsed = (t - start.current) / 1000;
      const eased = 92 * (1 - Math.exp(-elapsed / 2.4));
      setPct(eased);
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [active]);

  return pct;
}

function ScanningAnimation({ active, rowPreviews = [], fileName }) {
  const pct = useSimulatedProgress(active);
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    if (!active || rowPreviews.length === 0) return;
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % rowPreviews.length);
    }, 900);
    return () => clearInterval(id);
  }, [active, rowPreviews.length]);

  const current = rowPreviews[tickerIndex];

  return (
    <div
      className="rounded-xl border p-8 flex flex-col items-center text-center relative overflow-hidden"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{ background: "linear-gradient(135deg, var(--accent), #9b51e0)" }}
      />

      {/* Radar */}
      <div className="relative w-24 h-24 mb-5 flex items-center justify-center">
        <span
          className="absolute inset-0 rounded-full radar-ring"
          style={{ border: "1.5px solid var(--accent)" }}
        />
        <span
          className="absolute inset-0 rounded-full radar-ring"
          style={{ border: "1.5px solid var(--accent)", animationDelay: "0.7s" }}
        />
        <span
          className="absolute inset-0 rounded-full radar-ring"
          style={{ border: "1.5px solid var(--accent)", animationDelay: "1.4s" }}
        />
        <div
          className="absolute inset-2 rounded-full radar-sweep"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(62,99,221,0.55), transparent 35%)",
          }}
        />
        <div
          className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <LuRadar size={20} className="text-[color:var(--accent)]" style={{ color: "var(--accent)" }} />
        </div>
      </div>

      <p className="relative text-sm font-semibold">
        Scoring {fileName ? <span className="font-mono">{fileName}</span> : "your file"}…
      </p>
      <p className="relative text-xs mt-1" style={{ color: "var(--text-dim)" }}>
        Running the model and computing SHAP explanations for every row.
      </p>

      {/* Progress bar */}
      <div className="relative w-full max-w-sm mt-5">
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div
            className="h-full progress-stripes rounded-full transition-[width] duration-300 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(90deg, var(--accent), #9b51e0)",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px] font-mono" style={{ color: "var(--text-dim)" }}>
          <span className="flex items-center gap-1">
            <LuCpu size={11} className="dot-flash" /> model inference
          </span>
          <span>{Math.round(pct)}%</span>
        </div>
      </div>

      {/* Live row ticker */}
      <div
        className="relative w-full max-w-sm mt-5 h-8 rounded-lg border overflow-hidden flex items-center px-3"
        style={{ borderColor: "var(--border)", background: "var(--surface-2)" }}
      >
        <LuDatabase size={12} style={{ color: "var(--text-dim)" }} className="shrink-0 mr-2" />
        {current ? (
          <span key={tickerIndex} className="ticker-row text-[11px] font-mono truncate" style={{ color: "var(--text-dim)" }}>
            {current}
          </span>
        ) : (
          <span className="text-[11px] font-mono" style={{ color: "var(--text-dim)" }}>
            Streaming row-level predictions…
          </span>
        )}
      </div>
    </div>
  );
}

export default ScanningAnimation;
