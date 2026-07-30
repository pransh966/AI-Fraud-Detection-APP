import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuShieldHalf } from "react-icons/lu";
import { loginUser } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const data = await loginUser(email, password);

      login(data.access_token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex justify-center items-center px-4"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl border p-9"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center gap-2.5 justify-center mb-1">
          <LuShieldHalf size={26} style={{ color: "var(--accent)" }} />
          <span className="font-display font-semibold text-lg tracking-tight">
            Sentinel<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "var(--text-dim)" }}>
          Sign in to your fraud detection console
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="jane@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-dim)" }}>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium" style={{ color: "var(--accent)" }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
