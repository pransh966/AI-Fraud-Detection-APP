import { LuX } from "react-icons/lu";
import RiskBadge from "./RiskBadge";
import TopFactors from "./TopFactors";
import { parseTopFactorsCell } from "../utils/parseFilePreview";

function RowDetailDrawer({ row, onClose }) {
  if (!row) return null;

  const probability = Number(row["Probability"]);
  const factors = parseTopFactorsCell(row["Top Factors"]).filter(
    (f) => f.weight !== null && !Number.isNaN(f.weight)
  );
  const entries = Object.entries(row).filter(
    ([k]) => !["Top Factors"].includes(k)
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="drawer-in relative w-full max-w-md h-full overflow-y-auto border-l p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-lg font-bold">Row detail</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/[0.06] transition-colors"
          >
            <LuX size={16} />
          </button>
        </div>
        <div className="flex items-center gap-2 mb-5">
          {!Number.isNaN(probability) && (
            <span className="font-mono text-sm" style={{ color: "var(--text-dim)" }}>
              {(probability * 100).toFixed(1)}% risk
            </span>
          )}
          {row["Risk Level"] && <RiskBadge level={row["Risk Level"]} />}
        </div>

        {factors.length > 0 && (
          <div
            className="rounded-xl border p-4 mb-5"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <TopFactors factors={factors} />
          </div>
        )}

        <h4 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-dim)" }}>
          All fields
        </h4>
        <div className="space-y-1.5">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-center justify-between text-xs py-1.5 border-b last:border-0"
              style={{ borderColor: "var(--border)" }}
            >
              <span style={{ color: "var(--text-dim)" }}>{k}</span>
              <span className="font-mono">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RowDetailDrawer;
