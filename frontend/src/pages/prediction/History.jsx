import { useEffect, useState } from "react";
import { LuTrash2, LuHistory, LuSparkles } from "react-icons/lu";
import RiskBadge from "../../components/RiskBadge";
import { SkeletonRows } from "../../components/Skeleton";
import {
  getHistory,
  deleteHistoryItem,
  deleteAllHistory,
} from "../../services/predictionService";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function History() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setItems(data);
      setError("");
    } catch {
      setError("Couldn't load prediction history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    setRemovingId(id);
    await deleteHistoryItem(id);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
      setRemovingId(null);
    }, 180);
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all prediction history? This can't be undone.")) return;
    await deleteAllHistory();
    setItems([]);
  };

  return (
    <div>
      <div
        className="relative rounded-2xl border p-6 sm:p-8 overflow-hidden mb-6 flex items-start justify-between gap-4 flex-wrap"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(62,99,221,0.22) 0%, rgba(155,81,224,0.15) 45%, rgba(62,99,221,0.04) 100%)",
          }}
        />
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25 animate-blob-slow"
          style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <LuSparkles size={16} style={{ color: "var(--accent)" }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              Activity log
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold">History</h1>
          <p className="text-sm mt-1.5" style={{ color: "var(--text-dim)" }}>
            Every single-transaction prediction you've run.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-all duration-200 hover:bg-[#e5484d]/[0.08] hover:-translate-y-0.5"
            style={{ borderColor: "var(--border)", color: "#e5484d" }}
          >
            <LuTrash2 size={15} /> Clear all
          </button>
        )}
      </div>

      {loading && (
        <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <SkeletonRows rows={5} cols={5} />
        </div>
      )}
      {error && <p style={{ color: "#e5484d" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div
          className="page-enter rounded-xl border p-10 flex flex-col items-center text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <LuHistory size={28} style={{ color: "var(--text-dim)" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--text-dim)" }}>
            No predictions yet. Run one from the Predict page to see it here.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          className="page-enter rounded-xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--border)" }}>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>ID</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Prediction</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Probability</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Risk</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="stagger">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="row-hover border-b last:border-0 transition-opacity duration-200"
                  style={{ borderColor: "var(--border)", opacity: removingId === item.id ? 0 : 1 }}
                >
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-dim)" }}>#{item.id}</td>
                  <td className="px-5 py-3 font-medium">{item.prediction}</td>
                  <td className="px-5 py-3 font-mono">{(item.probability * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3"><RiskBadge level={item.risk_level} /></td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-dim)" }}>{formatDate(item.created_at)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-md hover:bg-[#e5484d]/[0.1] transition-all duration-150 hover:scale-110"
                      title="Delete"
                    >
                      <LuTrash2 size={15} style={{ color: "var(--text-dim)" }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default History;
