const STYLES = {
  High: "bg-[#e5484d]/10 text-[#e5484d] border-[#e5484d]/30",
  Medium: "bg-[#d3982a]/10 text-[#d3982a] border-[#d3982a]/30",
  Low: "bg-[#2fb677]/10 text-[#2fb677] border-[#2fb677]/30",
};

function RiskBadge({ level }) {
  const style = STYLES[level] || "bg-white/5 text-[#8b93a7] border-white/10";

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium uppercase tracking-wide transition-transform duration-150 hover:scale-105 ${style}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full bg-current ${level === "High" ? "pulse-ring" : ""}`} />
      {level || "Unknown"}
    </span>
  );
}

export default RiskBadge;
