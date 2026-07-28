import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
      console.error(err);

      setError(
        err.response?.data?.detail || "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex justify-center items-center">

      <div className="bg-slate-800 p-10 rounded-xl shadow-lg w-full max-w-md">

        <h1 className="text-3xl text-white font-bold text-center mb-8">
          AI Fraud Detection
        </h1>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            className="w-full p-3 rounded bg-slate-700 text-white mb-4 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 rounded bg-slate-700 text-white mb-4 outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-400 mb-4">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded font-semibold"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

        <p className="text-gray-400 mt-6 text-center">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-400 hover:underline"
          >
            Register
          </Link>
        </p>

      </div>

    </div>
  );
}

export default Login;