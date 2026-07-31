import { useCallback, useEffect, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line } from "recharts";
import {
  LuScanSearch,
  LuTriangleAlert,
  LuShieldCheck,
  LuLayers,
  LuSparkles,
  LuActivity,
  LuPause,
  LuPlay,
} from "react-icons/lu";
import StatCard from "../../components/StatCard";
import RiskBadge from "../../components/RiskBadge";
import Skeleton from "../../components/Skeleton";
import ProbabilityHistogram from "../../components/ProbabilityHistogram";
import ThresholdImpactSimulator from "../../components/ThresholdImpactSimulator";
import {
  getDashboardSummary,
  getDashboardStatistics,
  getRecentPredictions,
} from "../../services/dashboardService";

const POLL_MS = 20000;

const RISK_COLORS = { High: "#e5484d", Medium: "#d3982a", Low: "#2fb677" };

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [live, setLive] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [pulsing, setPulsing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  const load = useCallback(async ({ silent } = {}) => {
    if (!silent) setLoading(true);
    try {
      const [s, st, r] = await Promise.all([
        getDashboardSummary(),
        getDashboardStatistics(),
        getRecentPredictions(),
      ]);
      setSummary(s);
      setStats(st);
      setRecent(r);
      setError("");
      setLastUpdated(new Date());
      if (silent) {
        setPulsing(true);
        setTimeout(() => setPulsing(false), 500);
      }
    } catch {
      setError("Couldn't load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => load({ silent: true }), POLL_MS);
    return () => clearInterval(id);
  }, [live, load]);

  useEffect(() => {
    const id = setInterval(() => {
      if (lastUpdated) setSecondsAgo(Math.round((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [lastUpdated]);

  const riskData = stats
    ? [
        { name: "High", value: stats.high_risk },
        { name: "Medium", value: stats.medium_risk },
        { name: "Low", value: stats.low_risk },
      ].filter((d) => d.value > 0)
    : [];

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
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <LuSparkles size={16} style={{ color: "var(--accent)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
                Live overview
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Dashboard</h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--text-dim)" }}>
              A live view of your fraud detection activity.
            </p>
          </div>

          <button
            onClick={() => setLive((v) => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:-translate-y-0.5"
            style={{
              borderColor: "var(--border)",
              background: "var(--surface)",
              color: live ? "var(--risk-low)" : "var(--text-dim)",
            }}
            title={live ? "Auto-refreshing every 20s — click to pause" : "Auto-refresh paused — click to resume"}
          >
            <span className="relative flex h-2 w-2">
              {live && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full pulse-ring"
                  style={{ background: "var(--risk-low)" }}
                />
              )}
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ background: live ? "var(--risk-low)" : "var(--text-dim)" }}
              />
            </span>
            {live ? "Live" : "Paused"}
            {live ? <LuPause size={12} /> : <LuPlay size={12} />}
            {lastUpdated && (
              <span className={`font-mono ${pulsing ? "count-pulse" : ""}`} style={{ color: "var(--text-dim)" }}>
                · updated {secondsAgo}s ago
              </span>
            )}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm mb-6" style={{ color: "#e5484d" }}>{error}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <Skeleton className="h-3 w-20 mb-4" />
              <Skeleton className="h-7 w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
        <div
          className="hover-lift lg:col-span-2 rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-dim)" }}>
            Risk breakdown
          </h2>
          {loading ? (
            <div className="flex items-center gap-4">
              <Skeleton className="rounded-full" style={{ width: 140, height: 140 }} />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ) : riskData.length > 0 ? (
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
                      animationDuration={700}
                      animationEasing="ease-out"
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
                      className="w-2.5 h-2.5 rounded-full pulse-ring"
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
          className="hover-lift lg:col-span-3 rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-dim)" }}>
            Recent predictions
          </h2>
          {loading ? (
            <div className="space-y-2.5 stagger">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm" style={{ color: "var(--text-dim)" }}>
              Nothing here yet. Your last five scans will show up in this list.
            </p>
          ) : (
            <div className="space-y-2.5 stagger">
              {recent.map((item) => (
                <div
                  key={item.id}
                  className="row-hover flex items-center justify-between px-3 py-2.5 rounded-lg"
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

      {!loading && recent.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <ThresholdImpactSimulator predictions={recent} />
          </div>

          <div
            className="hover-lift lg:col-span-3 rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <h2 className="text-sm font-medium mb-3 flex items-center gap-1.5" style={{ color: "var(--text-dim)" }}>
              <LuActivity size={14} /> Recent probability distribution
            </h2>
            <ProbabilityHistogram probabilities={recent.map((p) => p.probability)} height={140} />
            <div style={{ width: "100%", height: 60 }} className="mt-2">
              <ResponsiveContainer>
                <LineChart data={recent.map((p, i) => ({ i, v: p.probability })).reverse()}>
                  <Line
                    type="monotone"
                    dataKey="v"
                    stroke="var(--accent)"
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive
                    animationDuration={800}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] mt-1 text-right" style={{ color: "var(--text-dim)" }}>
              trend across last {recent.length} scans, oldest → newest
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
