import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuShieldHalf, LuLoaderCircle, LuCheck, LuArrowRight } from "react-icons/lu";
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
      className="min-h-screen flex justify-center items-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute -top-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-25 animate-blob"
        style={{ background: "radial-gradient(circle, #9b51e0, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob-slow"
        style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
      />

      <div
        className="page-enter relative w-full max-w-md rounded-2xl border p-9"
        style={{ background: "var(--surface)", borderColor: "var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center gap-2.5 justify-center mb-1">
          <LuShieldHalf size={26} className="icon-pop" style={{ color: "var(--accent)" }} />
          <span className="font-display font-semibold text-lg tracking-tight">
            Sentinel<span className="gradient-text">AI</span>
          </span>
        </div>
        <p className="text-center text-sm mb-8" style={{ color: "var(--text-dim)" }}>
          Create an account to start scanning transactions
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 stagger">
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
            <p className="check-pop flex items-center gap-1.5 text-sm rounded-lg px-3 py-2" style={{ color: "var(--risk-low)", background: "rgba(52,211,153,0.08)" }}>
              <LuCheck size={15} /> Account created. Redirecting to login…
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
            style={{ color: "#ffffff" }}
          >
            {loading ? (
              <><LuLoaderCircle className="animate-spin" size={16} /> Creating account…</>
            ) : (
              <>Create account <LuArrowRight size={15} /></>
            )}
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
