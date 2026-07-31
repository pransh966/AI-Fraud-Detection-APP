import * as XLSX from "xlsx";

// Reads the first N rows of a File (csv/xlsx) client-side, purely for the
// cosmetic "scanning" ticker — never sent anywhere, never blocks the real
// upload to the backend.
export async function previewFileRows(file, limit = 12) {
  if (!file) return [];
  try {
    const buf = await file.arrayBuffer();
    const workbook = XLSX.read(buf, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
    const idCol = Object.keys(rows[0] || {}).find((k) =>
      /^(id|transactionid|txn|tx_id)$/i.test(k)
    );
    const amtCol = Object.keys(rows[0] || {}).find((k) =>
      /amount|amt/i.test(k)
    );
    return rows.slice(0, limit).map((r, i) => {
      const id = idCol ? r[idCol] : i + 1;
      const amt = amtCol ? r[amtCol] : null;
      return amt !== null && amt !== ""
        ? `row ${id} — amount ${amt} — scoring…`
        : `row ${id} — scoring…`;
    });
  } catch {
    return [];
  }
}

// Best-effort parser for a per-row "Top Factors" cell coming back from the
// batch output file. Backends tend to serialize this as either JSON
// (e.g. [{"feature":"amt","weight":0.31,"impact":"increases_risk"}]) or a
// flat human string (e.g. "amt (+0.31), country (-0.12)"). We try both.
export function parseTopFactorsCell(value) {
  if (value === null || value === undefined || value === "") return [];
  if (Array.isArray(value)) return value;

  const str = String(value).trim();

  // Try JSON first
  try {
    const parsed = JSON.parse(str);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    /* not JSON, fall through */
  }

  // Fall back to parsing "name (+0.31), name2 (-0.12)" / "name: 0.31" style strings
  return str
    .split(/[,;]\s*(?=[A-Za-z_])/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(/^(.+?)[\s:(]+([+-]?\d*\.?\d+)\)?$/);
      if (!match) return { feature: chunk, label: chunk, weight: null, impact: null };
      const [, name, num] = match;
      const weight = Math.abs(parseFloat(num));
      const impact = parseFloat(num) >= 0 ? "increases_risk" : "decreases_risk";
      return { feature: name.trim(), label: name.trim(), weight, impact };
    });
}
