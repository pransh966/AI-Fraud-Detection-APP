import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuShieldHalf } from "react-icons/lu";
import { registerUser } from "../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      await registerUser({ username, email, password });
      setSuccess(true);
      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try a different email.");
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
          Create an account to start scanning transactions
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="jane_doe"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

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
              placeholder="At least 8 characters"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)] transition-colors"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
              {error}
            </p>
          )}

          {success && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: "var(--risk-low)", background: "rgba(52,211,153,0.08)" }}>
              Account created. Redirecting to login…
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-dim)" }}>
          Already have an account?{" "}
          <Link to="/" className="font-medium" style={{ color: "var(--accent)" }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
