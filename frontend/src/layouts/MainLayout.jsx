import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LuShieldHalf,
  LuLayoutDashboard,
  LuScanSearch,
  LuHistory,
  LuFileStack,
  LuFiles,
  LuUserRound,
  LuLogOut,
} from "react-icons/lu";
import useAuth from "../hooks/useAuth";
import { logoutUser } from "../services/authService";
import LiveBackground from "../components/LiveBackground";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard },
  { to: "/predict", label: "Predict", icon: LuScanSearch },
  { to: "/history", label: "History", icon: LuHistory },
  { to: "/batch-predict", label: "Batch Predict", icon: LuFiles },
  { to: "/batch-history", label: "Batch History", icon: LuFileStack },
  { to: "/profile", label: "Profile", icon: LuUserRound },
];

function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // best-effort; proceed regardless
    }
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex relative" style={{ background: "var(--bg)" }}>
      <LiveBackground />
      <aside
        className="app-shell w-64 shrink-0 flex flex-col border-r backdrop-blur-sm"
        style={{ borderColor: "var(--border)", background: "color-mix(in srgb, var(--surface) 88%, transparent)" }}
      >
        <div
          className="flex items-center gap-2.5 px-6 h-16 border-b relative overflow-hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="absolute -left-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-25 animate-blob-slow"
            style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
          />
          <LuShieldHalf size={22} className="relative icon-pop" style={{ color: "var(--accent)" }} />
          <span className="relative font-display font-semibold tracking-tight text-[15px]">
            Sentinel<span className="gradient-text">AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `nav-glow flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive ? "active text-[color:var(--text)]" : "text-[color:var(--text-dim)] hover:text-[color:var(--text)] hover:bg-white/[0.03] hover:translate-x-0.5"
                }`
              }
              style={({ isActive }) =>
                isActive
                  ? { background: "var(--accent-soft)", color: "var(--accent)" }
                  : {}
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[color:var(--text-dim)] hover:text-[#e5484d] hover:bg-[#e5484d]/[0.06] transition-all duration-200"
          >
            <LuLogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="app-shell flex-1 min-w-0">
        <div key={location.pathname} className="page-enter px-8 py-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
