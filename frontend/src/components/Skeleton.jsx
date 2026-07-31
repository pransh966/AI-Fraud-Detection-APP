function Skeleton({ className = "", style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />;
}

export function SkeletonRows({ rows = 4, cols = 4 }) {
  return (
    <div className="stagger">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5" style={{ width: c === 0 ? "40px" : "90px" }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default Skeleton;
