import { useEffect, useState } from "react";
import { LuTrash2, LuDownload, LuFileStack } from "react-icons/lu";
import {
  getBatchHistory,
  deleteBatchHistoryItem,
  deleteAllBatchHistory,
  downloadBatchFile,
} from "../../services/batchService";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function BatchHistory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getBatchHistory();
      setItems(data);
      setError("");
    } catch (err) {
      // Backend returns 404 when there is no batch history yet — treat as empty.
      if (err.response?.status === 404) {
        setItems([]);
        setError("");
      } else {
        setError("Couldn't load batch history.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    await deleteBatchHistoryItem(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleDeleteAll = async () => {
    if (!window.confirm("Delete all batch history? This can't be undone.")) return;
    await deleteAllBatchHistory();
    setItems([]);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold">Batch History</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
            Every batch file you've run through the model.
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleDeleteAll}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-[#e5484d]/[0.08]"
            style={{ borderColor: "var(--border)", color: "#e5484d" }}
          >
            <LuTrash2 size={15} /> Clear all
          </button>
        )}
      </div>

      {loading && <p style={{ color: "var(--text-dim)" }}>Loading…</p>}
      {error && <p style={{ color: "#e5484d" }}>{error}</p>}

      {!loading && !error && items.length === 0 && (
        <div
          className="rounded-xl border p-10 flex flex-col items-center text-center"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <LuFileStack size={28} style={{ color: "var(--text-dim)" }} />
          <p className="mt-3 text-sm" style={{ color: "var(--text-dim)" }}>
            No batch files yet. Upload one from Batch Predict to see it here.
          </p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b" style={{ borderColor: "var(--border)" }}>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>ID</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Total</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Fraud</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Legitimate</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Avg. probability</th>
                <th className="px-5 py-3 font-medium" style={{ color: "var(--text-dim)" }}>Date</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                  <td className="px-5 py-3 font-mono text-xs" style={{ color: "var(--text-dim)" }}>#{item.id}</td>
                  <td className="px-5 py-3 font-mono">{item.total_transactions}</td>
                  <td className="px-5 py-3 font-mono" style={{ color: "var(--risk-high)" }}>{item.fraud_transactions}</td>
                  <td className="px-5 py-3 font-mono" style={{ color: "var(--risk-low)" }}>{item.legitimate_transactions}</td>
                  <td className="px-5 py-3 font-mono">{(item.average_probability * 100).toFixed(1)}%</td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--text-dim)" }}>{formatDate(item.created_at)}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => downloadBatchFile(item.filename)}
                        className="p-1.5 rounded-md hover:bg-white/[0.05] transition-colors"
                        title="Download"
                      >
                        <LuDownload size={15} style={{ color: "var(--text-dim)" }} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-md hover:bg-[#e5484d]/[0.1] transition-colors"
                        title="Delete"
                      >
                        <LuTrash2 size={15} style={{ color: "var(--text-dim)" }} />
                      </button>
                    </div>
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

export default BatchHistory;
