import { useState } from "react";
import {
  LuScanSearch,
  LuLoaderCircle,
  LuIndianRupee,
  LuShieldCheck,
  LuCircleAlert,
  LuSparkles,
} from "react-icons/lu";
import { predictTransaction } from "../../services/predictionService";
import RiskBadge from "../../components/RiskBadge";
import ProbabilityMeter from "../../components/ProbabilityMeter";
import TopFactors from "../../components/TopFactors";

const PRODUCT_CODES = [
  { value: "W", label: "W — Wallet / general purchase" },
  { value: "C", label: "C — Cash-like transfer" },
  { value: "R", label: "R — Recurring / subscription" },
  { value: "H", label: "H — Hotel / travel" },
  { value: "S", label: "S — Services" },
];
const CARD_TYPES = ["visa", "mastercard", "american express", "discover"];
const CARD_CLASS = ["debit", "credit"];
const DEVICE_TYPES = ["desktop", "mobile"];

const USD_TO_INR = 83;

const initialForm = {
  TransactionAmt: "",
  hour: "12",
  ProductCD: "W",
  card1: "",
  card2: "",
  card3: "",
  card4: "visa",
  card5: "",
  card6: "debit",
  dist1: "",
  P_emaildomain: "",
  R_emaildomain: "",
  DeviceType: "desktop",
  DeviceInfo: "",
};

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
        {label}
      </label>
      {children}
      {hint && (
        <p className="text-[11px] mt-1" style={{ color: "var(--text-dim)" }}>
          {hint}
        </p>
      )}
    </div>
  );
}

const inputStyle = {
  background: "var(--surface-2)",
  borderColor: "var(--border)",
  color: "var(--text)",
};

const inputClass =
  "w-full px-3 py-2 rounded-lg border text-sm outline-none transition-all duration-200 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]";

function Predict() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    const numeric = ["card1", "card2", "card3", "card5", "dist1"];

    const data = {};
    Object.entries(form).forEach(([key, value]) => {
      if (key === "hour" || key === "TransactionAmt") return;
      if (value === "") return;
      data[key] = numeric.includes(key) ? Number(value) : value;
    });

    data.TransactionAmt = Number(form.TransactionAmt) / USD_TO_INR;
    data.TransactionDT = Number(form.hour) * 3600;

    try {
      const res = await predictTransaction(data);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || "Prediction failed. Check your inputs and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div
        className="relative rounded-2xl border p-6 sm:p-8 overflow-hidden mb-6"
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
        <div className="relative flex items-center gap-2 mb-2">
          <LuSparkles size={16} style={{ color: "var(--accent)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Single transaction
          </span>
        </div>
        <h1 className="relative font-display text-2xl sm:text-3xl font-bold">Predict</h1>
        <p className="relative text-sm mt-1.5" style={{ color: "var(--text-dim)" }}>
          Run a single transaction through the fraud model and get an instant risk verdict.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 rounded-xl border p-6 space-y-7"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Transaction
              </h3>
              <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>Step 1 of 3</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Amount (INR)">
                <div className="relative">
                  <LuIndianRupee
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-dim)" }}
                  />
                  <input
                    type="number" step="1" min="0" required
                    placeholder="2500"
                    className={`${inputClass} pl-8`}
                    style={inputStyle} value={form.TransactionAmt} onChange={update("TransactionAmt")}
                  />
                </div>
              </Field>
              <Field label="Hour of day" hint="When the transaction took place">
                <select
                  className={inputClass}
                  style={inputStyle} value={form.hour} onChange={update("hour")}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </Field>
              <Field label="Product code">
                <select
                  className={inputClass}
                  style={inputStyle} value={form.ProductCD} onChange={update("ProductCD")}
                >
                  {PRODUCT_CODES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </Field>
              <Field label="Distance (dist1)" hint="Distance between billing & shipping address">
                <input
                  type="number" step="0.01" min="0"
                  placeholder="0"
                  className={inputClass}
                  style={inputStyle} value={form.dist1} onChange={update("dist1")}
                />
              </Field>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Card
              </h3>
              <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>Step 2 of 3</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Card1 (issuer id)">
                <input
                  type="number" min="0" placeholder="e.g. 13926"
                  className={inputClass}
                  style={inputStyle} value={form.card1} onChange={update("card1")}
                />
              </Field>
              <Field label="Card2">
                <input
                  type="number" min="0" placeholder="e.g. 404"
                  className={inputClass}
                  style={inputStyle} value={form.card2} onChange={update("card2")}
                />
              </Field>
              <Field label="Card3">
                <input
                  type="number" min="0" placeholder="e.g. 150"
                  className={inputClass}
                  style={inputStyle} value={form.card3} onChange={update("card3")}
                />
              </Field>
              <Field label="Card5">
                <input
                  type="number" min="0" placeholder="e.g. 226"
                  className={inputClass}
                  style={inputStyle} value={form.card5} onChange={update("card5")}
                />
              </Field>
              <Field label="Network">
                <select
                  className={inputClass}
                  style={inputStyle} value={form.card4} onChange={update("card4")}
                >
                  {CARD_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="Card class">
                <select
                  className={inputClass}
                  style={inputStyle} value={form.card6} onChange={update("card6")}
                >
                  {CARD_CLASS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Contact &amp; device
              </h3>
              <span className="text-[11px]" style={{ color: "var(--text-dim)" }}>Step 3 of 3</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Purchaser email domain">
                <input
                  type="text" placeholder="gmail.com"
                  className={inputClass}
                  style={inputStyle} value={form.P_emaildomain} onChange={update("P_emaildomain")}
                />
              </Field>
              <Field label="Recipient email domain">
                <input
                  type="text" placeholder="gmail.com"
                  className={inputClass}
                  style={inputStyle} value={form.R_emaildomain} onChange={update("R_emaildomain")}
                />
              </Field>
              <Field label="Device type">
                <select
                  className={inputClass}
                  style={inputStyle} value={form.DeviceType} onChange={update("DeviceType")}
                >
                  {DEVICE_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Device info" hint="Browser / OS string, if known">
                <input
                  type="text" placeholder="Windows 10 / Chrome 120"
                  className={inputClass}
                  style={inputStyle} value={form.DeviceInfo} onChange={update("DeviceInfo")}
                />
              </Field>
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(229,72,77,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
            style={{ color: "#ffffff" }}
          >
            {loading ? (
              <><LuLoaderCircle className="animate-spin" size={16} /> Scanning…</>
            ) : (
              <><LuScanSearch size={16} /> Run prediction</>
            )}
          </button>
        </form>

        <div
          className="hover-lift lg:col-span-2 rounded-xl border p-6 h-fit lg:sticky lg:top-8"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: "var(--text-dim)" }}>
            Result
          </h3>

          {!result && !loading && (
            <div className="flex flex-col items-center text-center py-10">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4 pulse-ring"
                style={{ background: "var(--accent-soft)" }}
              >
                <LuScanSearch size={20} style={{ color: "var(--accent)" }} />
              </div>
              <p className="text-sm max-w-[220px]" style={{ color: "var(--text-dim)" }}>
                Fill out the transaction details and run a prediction to see the model's verdict here.
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center text-center py-10">
              <LuLoaderCircle className="animate-spin mb-4" size={22} style={{ color: "var(--accent)" }} />
              <p className="text-sm" style={{ color: "var(--text-dim)" }}>
                Running the transaction through the model…
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-5 page-enter">
              <div
                className="flex items-center gap-3 px-4 py-3.5 rounded-lg"
                style={{
                  background: result.label === "Fraud" ? "rgba(229,72,77,0.08)" : "rgba(47,182,119,0.08)",
                }}
              >
                {result.label === "Fraud" ? (
                  <LuCircleAlert size={20} style={{ color: "var(--risk-high)" }} />
                ) : (
                  <LuShieldCheck size={20} style={{ color: "var(--risk-low)" }} />
                )}
                <div className="flex-1">
                  <span
                    className="font-display text-lg font-semibold block"
                    style={{ color: result.label === "Fraud" ? "var(--risk-high)" : "var(--risk-low)" }}
                  >
                    {result.label}
                  </span>
                  <span className="text-xs" style={{ color: "var(--text-dim)" }}>
                    ₹{Number(form.TransactionAmt || 0).toLocaleString("en-IN")} transaction
                  </span>
                </div>
                <RiskBadge level={result.risk_level} />
              </div>

              <ProbabilityMeter probability={result.probability} size="lg" />

              {result.top_factors && result.top_factors.length > 0 && (
                <div className="pt-4 border-t" style={{ borderColor: "var(--border)" }}>
                  <TopFactors factors={result.top_factors} />
                </div>
              )}

              <div className="pt-4 border-t text-sm" style={{ borderColor: "var(--border)" }}>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: "var(--text-dim)" }}>Model output</span>
                  <span className="font-mono">{result.prediction}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span style={{ color: "var(--text-dim)" }}>Probability</span>
                  <span className="font-mono">{result.probability}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Predict;
