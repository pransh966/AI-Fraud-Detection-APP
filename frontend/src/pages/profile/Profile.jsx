import { useEffect, useState } from "react";
import { LuUserRound, LuCheck, LuSparkles } from "react-icons/lu";
import Skeleton from "../../components/Skeleton";
import { getProfile, updateProfile } from "../../services/profileService";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setUsername(data.username);
        setEmail(data.email);
      } catch {
        setError("Couldn't load your profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const data = await updateProfile({ username, email });
      setProfile(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.detail || "Couldn't save your changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div
        className="relative rounded-2xl border p-6 sm:p-8 overflow-hidden mb-6"
        style={{ borderColor: "var(--border)" }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(62,99,221,0.22) 0%, rgba(155,81,224,0.15) 45%, rgba(62,99,221,0.04) 100%)",
          }}
        />
        <div
          className="absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl opacity-25 animate-blob-slow"
          style={{ background: "radial-gradient(circle, #3E63DD, transparent 70%)" }}
        />
        <div className="relative flex items-center gap-2 mb-2">
          <LuSparkles size={16} style={{ color: "var(--accent)" }} />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            Account
          </span>
        </div>
        <h1 className="relative font-display text-2xl sm:text-3xl font-bold">Profile</h1>
        <p className="relative text-sm mt-1.5" style={{ color: "var(--text-dim)" }}>
          Manage your account details.
        </p>
      </div>

      {loading ? (
        <div className="max-w-lg rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
            <Skeleton className="w-11 h-11 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      ) : (
        <div className="hover-lift page-enter max-w-lg rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center icon-pop"
              style={{ background: "var(--accent-soft)" }}
            >
              <LuUserRound size={20} style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="font-medium">{profile?.username}</p>
              <p className="text-xs font-mono" style={{ color: "var(--text-dim)" }}>User ID #{profile?.id}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-dim)" }}>
                Username
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
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
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all duration-200 focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-soft)]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text)" }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm rounded-lg px-3 py-2" style={{ color: "#e5484d", background: "rgba(240,85,91,0.08)" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-gradient flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
              style={{ color: "#ffffff" }}
            >
              {saved && <LuCheck size={16} className="check-pop" />}
              {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Profile;
