import { useRef, useState } from "react";
import { LuUpload, LuFileSpreadsheet, LuDownload, LuLoaderCircle } from "react-icons/lu";
import { predictBatch, downloadBatchFile } from "../../services/batchService";

function BatchPredict() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const acceptFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".csv") || f.name.endsWith(".xlsx");
    if (!ok) {
      setError("Only .csv or .xlsx files are supported.");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await predictBatch(file);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Batch prediction failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Batch Predict</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Upload a CSV or Excel file to scan many transactions at once.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            acceptFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-xl border-2 border-dashed p-10 flex flex-col items-center text-center cursor-pointer transition-colors"
          style={{
            borderColor: dragOver ? "var(--accent)" : "var(--border)",
            background: dragOver ? "var(--accent-soft)" : "var(--surface)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={(e) => acceptFile(e.target.files?.[0])}
          />
          {file ? (
            <>
              <LuFileSpreadsheet size={30} style={{ color: "var(--accent)" }} />
              <p className="mt-3 text-sm font-medium">{file.name}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                {(file.size / 1024).toFixed(1)} KB — click to replace
              </p>
            </>
          ) : (
            <>
              <LuUpload size={26} style={{ color: "var(--text-dim)" }} />
              <p className="mt-3 text-sm font-medium">Drop a file here, or click to browse</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                Supports .csv and .xlsx
              </p>
            </>
          )}
        </div>

        {error && (
          <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50"
          style={{ background: "var(--accent)", color: "#ffffff" }}
        >
          {loading ? (
            <><LuLoaderCircle className="animate-spin" size={16} /> Processing batch…</>
          ) : (
            "Run batch prediction"
          )}
        </button>
      </form>

      {result && (
        <div
          className="mt-8 max-w-2xl rounded-xl border p-6"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--accent)" }}>
            Batch complete
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
            <div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>Total</p>
              <p className="font-mono text-lg font-semibold">{result.total_transactions}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>Fraud</p>
              <p className="font-mono text-lg font-semibold" style={{ color: "var(--risk-high)" }}>
                {result.fraud_transactions}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>Legitimate</p>
              <p className="font-mono text-lg font-semibold" style={{ color: "var(--risk-low)" }}>
                {result.legitimate_transactions}
              </p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-dim)" }}>Avg. probability</p>
              <p className="font-mono text-lg font-semibold">
                {(result.average_fraud_probability * 100).toFixed(1)}%
              </p>
            </div>
          </div>
          <button
            onClick={() => downloadBatchFile(result.output_file)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/[0.03]"
            style={{ borderColor: "var(--border)" }}
          >
            <LuDownload size={15} /> Download results (.xlsx)
          </button>
        </div>
      )}
    </div>
  );
}

export default BatchPredict;
