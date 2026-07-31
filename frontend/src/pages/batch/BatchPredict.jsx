import { useRef, useState, useCallback, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  LuUpload,
  LuFileSpreadsheet,
  LuDownload,
  LuLoaderCircle,
  LuSparkles,
  LuTriangleAlert,
  LuShieldCheck,
  LuLayers,
  LuGauge,
  LuX,
  LuRefreshCw,
} from "react-icons/lu";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
} from "recharts";
import { predictBatch, downloadBatchFile, fetchBatchResultBuffer } from "../../services/batchService";
import ThresholdSlider from "../../components/ThresholdSlider";
import BatchResultsTable from "../../components/BatchResultsTable";
import ScanningAnimation from "../../components/ScanningAnimation";
import RowDetailDrawer from "../../components/RowDetailDrawer";
import ProbabilityHistogram from "../../components/ProbabilityHistogram";
import { previewFileRows } from "../../utils/parseFilePreview";
import useCountUp from "../../hooks/useCountUp";

const RISK_COLORS = { High: "#e5484d", Medium: "#d3982a", Low: "#2fb677" };
const THRESHOLD_PRESETS = [
  { label: "Aggressive", value: 0.2 },
  { label: "Balanced", value: 0.5 },
  { label: "Conservative", value: 0.75 },
];

function StatTile({ label, value, icon: Icon, gradient }) {
  const numeric = typeof value === "number";
  const animated = useCountUp(numeric ? value : 0);
  const display = numeric ? Math.round(animated) : value;

  return (
    <div
      className="relative rounded-xl border p-4 overflow-hidden transition-transform duration-300 hover:-translate-y-0.5"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="absolute inset-0 opacity-10" style={{ background: gradient }} />
      <div className="relative flex items-center justify-between mb-2">
        <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
          {label}
        </span>
        <Icon size={15} className="icon-pop" style={{ color: "var(--text-dim)" }} />
      </div>
      <div className="relative font-mono text-2xl font-bold tabular-nums">{display}</div>
    </div>
  );
}

function BatchPredict() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [threshold, setThreshold] = useState(0.2);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [fileBuffer, setFileBuffer] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [rowPreviews, setRowPreviews] = useState([]);
  const [parsedRows, setParsedRows] = useState([]);
  const [selectedRow, setSelectedRow] = useState(null);
  const lastRunThreshold = useRef(null);

  const acceptFile = (f) => {
    if (!f) return;
    const ok = f.name.endsWith(".csv") || f.name.endsWith(".xlsx");
    if (!ok) {
      setError("Only .csv or .xlsx files are supported.");
      return;
    }
    setError("");
    setFile(f);
    setResult(null);
    setFileBuffer(null);
    setRowPreviews([]);
    previewFileRows(f).then(setRowPreviews);
  };

  // Parse the returned result file client-side once, so we can drive the
  // probability histogram alongside the row table without a second fetch.
  useEffect(() => {
    if (!fileBuffer) {
      setParsedRows([]);
      return;
    }
    try {
      const bytes = fileBuffer instanceof Uint8Array ? fileBuffer : new Uint8Array(fileBuffer);
      const workbook = XLSX.read(bytes, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      setParsedRows(XLSX.utils.sheet_to_json(sheet, { defval: "" }));
    } catch {
      setParsedRows([]);
    }
  }, [fileBuffer]);

  const runBatch = useCallback(
    async (activeFile, activeThreshold, { silent } = {}) => {
      if (!activeFile) return;
      silent ? setRefreshing(true) : setLoading(true);
      setError("");
      try {
        const res = await predictBatch(activeFile, activeThreshold);
        setResult(res);
        lastRunThreshold.current = activeThreshold;
        const buf = await fetchBatchResultBuffer(res.output_file);
        setFileBuffer(buf);
      } catch (err) {
        setError(err.response?.data?.detail || "Batch prediction failed.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    runBatch(file, threshold);
  };

  // Live re-run: once a result exists, releasing the slider at a new
  // threshold re-scores the same file instantly — no re-upload needed.
  const handleThresholdCommit = () => {
    if (result && file && threshold !== lastRunThreshold.current) {
      runBatch(file, threshold, { silent: true });
    }
  };

  const clearFile = () => {
    setFile(null);
    setResult(null);
    setFileBuffer(null);
    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const shapData = (result?.top_factors || []).map((f) => ({
    ...f,
    signedWeight: f.impact === "increases_risk" ? f.weight : -f.weight,
  }));

  return (
    <div className="space-y-6 page-enter">
      {/* Gradient hero */}
      <div
        className="relative rounded-2xl border p-6 sm:p-8 overflow-hidden"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(62,99,221,0.25) 0%, rgba(155,81,224,0.18) 45%, rgba(62,99,221,0.05) 100%)",
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-30"
          style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2 mb-2">
          <LuSparkles size={16} style={{ color: "var(--accent)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Live batch intelligence
          </span>
        </div>
        <h1 className="relative font-display text-2xl sm:text-3xl font-bold">Batch Fraud Scan</h1>
        <p className="relative text-sm mt-1.5 max-w-xl" style={{ color: "var(--text-dim)" }}>
          Upload a CSV or Excel file, dial in a decision threshold, and get instant
          model-explained (SHAP) results across every transaction — no re-upload needed
          to try a different cutoff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: upload + threshold */}
        <div className="lg:col-span-2 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                acceptFile(e.dataTransfer.files?.[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-xl border-2 border-dashed p-8 flex flex-col items-center text-center cursor-pointer transition-all duration-200"
              style={{
                borderColor: dragOver ? "var(--accent)" : "var(--border)",
                background: dragOver
                  ? "var(--accent-soft)"
                  : "linear-gradient(160deg, var(--surface) 0%, var(--surface-2) 100%)",
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
                  <LuFileSpreadsheet size={28} style={{ color: "var(--accent)" }} />
                  <p className="mt-3 text-sm font-medium">{file.name}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    {(file.size / 1024).toFixed(1)} KB — click to replace
                  </p>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); clearFile(); }}
                    className="mt-3 inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border"
                    style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                  >
                    <LuX size={11} /> Remove
                  </button>
                </>
              ) : (
                <>
                  <LuUpload size={24} style={{ color: "var(--text-dim)" }} />
                  <p className="mt-3 text-sm font-medium">Drop a file here, or click to browse</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-dim)" }}>
                    Supports .csv and .xlsx
                  </p>
                </>
              )}
            </div>

            <ThresholdSlider
              value={threshold}
              onChange={setThreshold}
              onCommit={handleThresholdCommit}
              disabled={loading}
            />

            <div className="flex items-center gap-1.5">
              {THRESHOLD_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setThreshold(p.value);
                    if (result && file) runBatch(file, p.value, { silent: true });
                  }}
                  className="flex-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-150 hover:-translate-y-0.5 disabled:opacity-40"
                  style={{
                    borderColor: Math.abs(threshold - p.value) < 0.005 ? "var(--accent)" : "var(--border)",
                    color: Math.abs(threshold - p.value) < 0.005 ? "var(--accent)" : "var(--text-dim)",
                    background: Math.abs(threshold - p.value) < 0.005 ? "var(--accent-soft)" : "transparent",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={!file || loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-50 transition-all duration-200 hover:brightness-110"
              style={{
                background: "linear-gradient(135deg, var(--accent), #9b51e0)",
                color: "#ffffff",
                boxShadow: "0 4px 20px rgba(62,99,221,0.35)",
              }}
            >
              {loading ? (
                <><LuLoaderCircle className="animate-spin" size={16} /> Processing batch…</>
              ) : (
                <><LuGauge size={16} /> Run batch prediction</>
              )}
            </button>

            {result && (
              <p className="text-[11px] text-center" style={{ color: "var(--text-dim)" }}>
                Tip: drag the slider above and release — results update live at the new threshold.
              </p>
            )}
          </form>
        </div>

        {/* Right: live results */}
        <div className="lg:col-span-3 space-y-5">
          {!result && !loading && (
            <div
              className="rounded-xl border p-10 flex flex-col items-center text-center h-full justify-center"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <LuLayers size={26} style={{ color: "var(--text-dim)" }} />
              <p className="text-sm mt-3" style={{ color: "var(--text-dim)" }}>
                Your live results, SHAP breakdown, and per-row table will appear here.
              </p>
            </div>
          )}

          {loading && !result && (
            <ScanningAnimation active={loading} rowPreviews={rowPreviews} fileName={file?.name} />
          )}

          {result && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                  Batch complete
                </h3>
                {refreshing && (
                  <span className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--text-dim)" }}>
                    <LuRefreshCw size={11} className="animate-spin" /> Re-scoring at {threshold.toFixed(2)}…
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 stagger">
                <StatTile
                  label="Total"
                  value={result.total_transactions}
                  icon={LuLayers}
                  gradient="linear-gradient(135deg, #3E63DD, transparent)"
                />
                <StatTile
                  label="Fraud"
                  value={result.fraud_transactions}
                  icon={LuTriangleAlert}
                  gradient="linear-gradient(135deg, #e5484d, transparent)"
                />
                <StatTile
                  label="Legitimate"
                  value={result.legitimate_transactions}
                  icon={LuShieldCheck}
                  gradient="linear-gradient(135deg, #2fb677, transparent)"
                />
                <StatTile
                  label="Avg. probability"
                  value={`${(result.average_fraud_probability * 100).toFixed(1)}%`}
                  icon={LuGauge}
                  gradient="linear-gradient(135deg, #d3982a, transparent)"
                />
              </div>

              <button
                onClick={() => downloadBatchFile(result.output_file)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/[0.03]"
                style={{ borderColor: "var(--border)" }}
              >
                <LuDownload size={15} /> Download full results (.xlsx)
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <div
                  className="hover-lift sm:col-span-2 rounded-xl border p-5 flex items-center gap-4"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <div style={{ width: 96, height: 96 }} className="shrink-0">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={[
                            { name: "Fraud", value: result.fraud_transactions },
                            { name: "Legit", value: result.legitimate_transactions },
                          ].filter((d) => d.value > 0)}
                          dataKey="value"
                          innerRadius={30}
                          outerRadius={46}
                          paddingAngle={4}
                          stroke="none"
                          animationDuration={700}
                        >
                          <Cell fill={RISK_COLORS.High} />
                          <Cell fill={RISK_COLORS.Low} />
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-dim)" }}>
                      Risk split
                    </h3>
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS.High }} />
                      Fraud <span className="font-mono ml-auto">{result.fraud_transactions}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ background: RISK_COLORS.Low }} />
                      Legit <span className="font-mono ml-auto">{result.legitimate_transactions}</span>
                    </div>
                  </div>
                </div>

                {parsedRows.length > 0 && (
                  <div
                    className="hover-lift sm:col-span-3 rounded-xl border p-5"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-dim)" }}>
                      Probability distribution
                    </h3>
                    <ProbabilityHistogram
                      probabilities={parsedRows.map((r) => r["Probability"])}
                      height={130}
                    />
                  </div>
                )}
              </div>

              {shapData.length > 0 && (
                <div
                  className="rounded-xl border p-5"
                  style={{ background: "var(--surface)", borderColor: "var(--border)" }}
                >
                  <h3 className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-dim)" }}>
                    What's driving fraud risk (SHAP)
                  </h3>
                  <p className="text-[11px] mb-4" style={{ color: "var(--text-dim)" }}>
                    Average signed impact across the batch — red pushes toward fraud, green pulls away.
                  </p>
                  <div style={{ width: "100%", height: Math.max(160, shapData.length * 44) }}>
                    <ResponsiveContainer>
                      <BarChart data={shapData} layout="vertical" margin={{ left: 8, right: 16 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: "var(--text-dim)", fontSize: 11 }} stroke="var(--border)" />
                        <YAxis
                          type="category"
                          dataKey="label"
                          width={150}
                          tick={{ fill: "var(--text)", fontSize: 12 }}
                          stroke="var(--border)"
                        />
                        <Tooltip
                          contentStyle={{
                            background: "var(--surface-2)",
                            border: "1px solid var(--border)",
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                          formatter={(v) => [Number(v).toFixed(4), "Signed SHAP impact"]}
                        />
                        <Bar dataKey="signedWeight" radius={[4, 4, 4, 4]}>
                          {shapData.map((d, i) => (
                            <Cell key={i} fill={d.impact === "increases_risk" ? "#e5484d" : "#2fb677"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {fileBuffer && <BatchResultsTable buffer={fileBuffer} onRowClick={setSelectedRow} />}
            </>
          )}
        </div>
      </div>

      {selectedRow && <RowDetailDrawer row={selectedRow} onClose={() => setSelectedRow(null)} />}
    </div>
  );
}

export default BatchPredict;
