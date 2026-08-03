import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuShieldHalf, LuLoaderCircle, LuArrowRight,  LuEye, LuEyeOff } from "react-icons/lu";
import { loginUser } from "../../services/authService";
import useAuth from "../../hooks/useAuth";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      className="min-h-screen flex justify-center items-center px-4 relative overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute -top-32 -left-24 w-96 h-96 rounded-full blur-3xl opacity-25 animate-blob"
        style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-32 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 animate-blob-slow"
        style={{ background: "radial-gradient(circle, #9b51e0, transparent 70%)" }}
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
          Sign in to your fraud detection console
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 stagger">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="jane@company.com"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-(--accent) transition-colors"
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-lg border text-sm outline-none focus:border-(--accent) transition-colors"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--text-dim)" }}
                tabIndex={-1}
              >
                {showPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
            style={{ color: "#ffffff" }}
          >
            {loading ? (
              <><LuLoaderCircle className="animate-spin" size={16} /> Signing in…</>
            ) : (
              <>Sign in <LuArrowRight size={15} /></>
            )}
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
