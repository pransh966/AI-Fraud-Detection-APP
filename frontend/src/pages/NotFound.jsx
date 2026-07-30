import { Link } from "react-router-dom";
import { LuTriangleAlert } from "react-icons/lu";

function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4 px-4"
      style={{ background: "var(--bg)" }}
    >
      <LuTriangleAlert size={32} style={{ color: "var(--accent)" }} />
      <h1 className="font-display text-3xl font-semibold">404</h1>
      <p style={{ color: "var(--text-dim)" }}>This page doesn't exist.</p>
      <Link
        to="/dashboard"
        className="mt-2 px-4 py-2 rounded-lg text-sm font-semibold"
        style={{ background: "var(--accent)", color: "#ffffff" }}
      >
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFound;
