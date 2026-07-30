import { useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  LuScanSearch,
  LuTriangleAlert,
  LuShieldCheck,
  LuLayers,
} from "react-icons/lu";
import StatCard from "../../components/StatCard";
import RiskBadge from "../../components/RiskBadge";
import {
  getDashboardSummary,
  getDashboardStatistics,
  getRecentPredictions,
} from "../../services/dashboardService";

const RISK_COLORS = { High: "#e5484d", Medium: "#d3982a", Low: "#2fb677" };

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [s, st, r] = await Promise.all([
          getDashboardSummary(),
          getDashboardStatistics(),
          getRecentPredictions(),
        ]);
        setSummary(s);
        setStats(st);
        setRecent(r);
      } catch {
        setError("Couldn't load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const riskData = stats
    ? [
        { name: "High", value: stats.high_risk },
        { name: "Medium", value: stats.medium_risk },
        { name: "Low", value: stats.low_risk },
      ].filter((d) => d.value > 0)
    : [];

  if (loading) {
    return <p style={{ color: "var(--text-dim)" }}>Loading dashboard…</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          A live view of your fraud detection activity.
        </p>
      </div>

      {error && (
        <p className="text-sm mb-6" style={{ color: "#e5484d" }}>{error}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total predictions"
          value={summary?.total_predictions ?? 0}
          icon={LuScanSearch}
        />
        <StatCard
          label="Flagged as fraud"
          value={summary?.fraud_predictions ?? 0}
          icon={LuTriangleAlert}
          accent="var(--risk-high)"
        />
        <StatCard
          label="Legitimate"
          value={summary?.legitimate_predictions ?? 0}
          icon={LuShieldCheck}
          accent="var(--risk-low)"
        />
        <StatCard
          label="Batch files processed"
          value={summary?.total_batches ?? 0}
          icon={LuLayers}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div
          className="lg:col-span-2 rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-dim)" }}>
            Risk breakdown
          </h2>
          {riskData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div style={{ width: 140, height: 140 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={riskData}
                      dataKey="value"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {riskData.map((entry) => (
                        <Cell key={entry.name} fill={RISK_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {riskData.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-sm">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: RISK_COLORS[d.name] }}
                    />
                    <span style={{ color: "var(--text-dim)" }}>{d.name}</span>
                    <span className="font-mono">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              No predictions yet — run a scan to see your risk profile.
            </p>
          )}
          <div className="mt-4 pt-4 border-t flex justify-between" style={{ borderColor: "var(--border)" }}>
            <span className="text-xs" style={{ color: "var(--text-dim)" }}>Fraud rate</span>
            <span className="font-mono text-sm font-semibold">{stats?.fraud_rate ?? 0}%</span>
          </div>
        </div>

        <div
          className="lg:col-span-3 rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-dim)" }}>
            Recent predictions
          </h2>
          {recent.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Nothing here yet. Your last five scans will show up in this list.
            </p>
          ) : (
            <div className="space-y-2.5">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: "var(--surface-2)" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                      #{item.id}
                    </span>
                    <span className="text-sm font-medium">{item.prediction}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: "var(--text-dim)" }}>
                      {Math.round(item.probability * 100)}%
                    </span>
                    <RiskBadge level={item.risk_level} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
