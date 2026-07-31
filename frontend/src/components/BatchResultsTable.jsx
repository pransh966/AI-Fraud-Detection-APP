import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { LuSearch, LuArrowUpDown, LuLoaderCircle } from "react-icons/lu";
import RiskBadge from "./RiskBadge";

const PAGE_SIZE = 10;
const RISK_FILTERS = ["All", "High", "Medium", "Low"];

function BatchResultsTable({ buffer, onRowClick }) {
  const [rows, setRows] = useState([]);
  const [parsing, setParsing] = useState(true);
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [sort, setSort] = useState({ key: "Probability", dir: "desc" });
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!buffer) return;
    setParsing(true);
    try {
      const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
      const workbook = XLSX.read(bytes, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setRows(data);
    } catch {
      setRows([]);
    } finally {
      setParsing(false);
    }
    setPage(1);
  }, [buffer]);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    const preferred = ["TransactionAmt", "Label", "Probability", "Risk Level", "Top Factors"];
    const keys = Object.keys(rows[0]);
    const ordered = preferred.filter((k) => keys.includes(k));
    const rest = keys.filter((k) => !ordered.includes(k) && k !== "Prediction");
    return [...ordered, ...rest.slice(0, 2)];
  }, [rows]);

  const filtered = useMemo(() => {
    let out = rows;
    if (riskFilter !== "All") {
      out = out.filter((r) => String(r["Risk Level"]) === riskFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return out;
  }, [rows, search, riskFilter]);

  const sorted = useMemo(() => {
    const out = [...filtered];
    out.sort((a, b) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      const an = Number(av);
      const bn = Number(bv);
      let cmp;
      if (!Number.isNaN(an) && !Number.isNaN(bn) && av !== "" && bv !== "") {
        cmp = an - bn;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sort.dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key) => {
    setSort((s) =>
      s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  };

  if (parsing) {
    return (
      <div className="flex items-center gap-2 text-sm py-8 justify-center" style={{ color: "var(--text-dim)" }}>
        <LuLoaderCircle className="animate-spin" size={16} /> Rendering live results table…
      </div>
    );
  }

  if (rows.length === 0) return null;

  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border-b" style={{ borderColor: "var(--border)" }}>
        <div className="relative flex-1">
          <LuSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-dim)" }} />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search rows…"
            className="w-full pl-8 pr-3 py-2 rounded-lg border text-sm outline-none"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
          />
        </div>
        <span className="hidden sm:inline text-[11px] shrink-0" style={{ color: "var(--text-dim)" }}>
          Click a row for per-transaction SHAP →
        </span>
        <div className="flex gap-1.5">
          {RISK_FILTERS.map((r) => (
            <button
              key={r}
              onClick={() => { setRiskFilter(r); setPage(1); }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors"
              style={{
                borderColor: "var(--border)",
                background: riskFilter === r ? "var(--accent)" : "transparent",
                color: riskFilter === r ? "#fff" : "var(--text-dim)",
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "var(--surface-2)" }}>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => toggleSort(col)}
                  className="text-left px-4 py-2.5 text-xs font-semibold uppercase tracking-wide cursor-pointer select-none whitespace-nowrap"
                  style={{ color: "var(--text-dim)" }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col}
                    <LuArrowUpDown size={11} style={{ opacity: sort.key === col ? 1 : 0.35 }} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className="border-t transition-colors hover:bg-white/[0.02] cursor-pointer"
                style={{ borderColor: "var(--border)" }}
              >
                {columns.map((col) => (
                  <td key={col} className="px-4 py-2.5 whitespace-nowrap font-mono text-xs">
                    {col === "Risk Level" ? (
                      <RiskBadge level={row[col]} />
                    ) : col === "Probability" ? (
                      <span
                        style={{
                          color:
                            Number(row[col]) >= 0.5
                              ? "var(--risk-high)"
                              : Number(row[col]) >= 0.25
                              ? "var(--risk-medium)"
                              : "var(--risk-low)",
                        }}
                      >
                        {(Number(row[col]) * 100).toFixed(1)}%
                      </span>
                    ) : col === "Label" ? (
                      <span
                        className="not-mono font-sans font-medium"
                        style={{ color: row[col] === "Fraud" ? "var(--risk-high)" : "var(--text)" }}
                      >
                        {row[col]}
                      </span>
                    ) : (
                      String(row[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t text-xs" style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}>
        <span>
          Showing {pageRows.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} rows
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1 rounded-md border disabled:opacity-30"
            style={{ borderColor: "var(--border)" }}
          >
            Prev
          </button>
          <span className="font-mono">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1 rounded-md border disabled:opacity-30"
            style={{ borderColor: "var(--border)" }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default BatchResultsTable;
