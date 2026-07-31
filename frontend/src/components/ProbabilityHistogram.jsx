import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer, CartesianGrid } from "recharts";

const BUCKETS = 10;

function colorFor(bucketStart) {
  if (bucketStart >= 0.7) return "#e5484d";
  if (bucketStart >= 0.4) return "#d3982a";
  return "#2fb677";
}

export function buildHistogram(probabilities) {
  const buckets = Array.from({ length: BUCKETS }).map((_, i) => ({
    range: `${(i * 10)}–${(i + 1) * 10}%`,
    start: i / BUCKETS,
    count: 0,
  }));
  probabilities.forEach((p) => {
    const idx = Math.min(BUCKETS - 1, Math.floor(Number(p) * BUCKETS));
    if (!Number.isNaN(idx) && idx >= 0) buckets[idx].count += 1;
  });
  return buckets;
}

function ProbabilityHistogram({ probabilities, height = 160 }) {
  const data = buildHistogram(probabilities);
  const hasData = data.some((d) => d.count > 0);

  if (!hasData) return null;

  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -20, right: 8, top: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="range" tick={{ fill: "var(--text-dim)", fontSize: 9 }} stroke="var(--border)" interval={1} />
          <YAxis tick={{ fill: "var(--text-dim)", fontSize: 10 }} stroke="var(--border)" allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v) => [v, "Transactions"]}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={600}>
            {data.map((d, i) => (
              <Cell key={i} fill={colorFor(d.start)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default ProbabilityHistogram;
