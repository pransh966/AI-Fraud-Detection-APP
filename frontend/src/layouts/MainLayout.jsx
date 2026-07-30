import { NavLink, Outlet, useNavigate } from "react-router-dom";
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
    <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>
      <aside
        className="w-64 shrink-0 flex flex-col border-r"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="flex items-center gap-2.5 px-6 h-16 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <LuShieldHalf size={22} style={{ color: "var(--accent)" }} />
          <span className="font-display font-semibold tracking-tight text-[15px]">
            Sentinel<span style={{ color: "var(--accent)" }}>AI</span>
          </span>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[color:var(--text)]"
                    : "text-[color:var(--text-dim)] hover:text-[color:var(--text)] hover:bg-white/[0.03]"
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
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[color:var(--text-dim)] hover:text-[#e5484d] hover:bg-[#e5484d]/[0.06] transition-colors"
          >
            <LuLogOut size={17} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="px-8 py-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default MainLayout;
