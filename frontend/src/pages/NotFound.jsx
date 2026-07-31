import { Link } from "react-router-dom";
import { LuTriangleAlert, LuArrowLeft } from "react-icons/lu";

function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob"
        style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-15 animate-blob-slow"
        style={{ background: "radial-gradient(circle, #9b51e0, transparent 70%)" }}
      />
      <div className="page-enter relative flex flex-col items-center gap-4">
        <LuTriangleAlert size={32} className="icon-pop" style={{ color: "var(--accent)" }} />
        <h1 className="font-display text-3xl font-semibold gradient-text">404</h1>
        <p style={{ color: "var(--text-dim)" }}>This page doesn't exist.</p>
        <Link
          to="/dashboard"
          className="btn-gradient mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ color: "#ffffff" }}
        >
          <LuArrowLeft size={15} /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
