import { useEffect, useState } from "react";
import { LuUserRound, LuCheck } from "react-icons/lu";
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

  if (loading) {
    return <p style={{ color: "var(--text-dim)" }}>Loading profile…</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold">Profile</h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-dim)" }}>
          Manage your account details.
        </p>
      </div>

      <div className="max-w-lg rounded-xl border p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="flex items-center gap-3 mb-6 pb-6 border-b" style={{ borderColor: "var(--border)" }}>
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center"
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
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)]"
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
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none focus:border-[color:var(--accent)]"
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm disabled:opacity-60"
            style={{ background: "var(--accent)", color: "#ffffff" }}
          >
            {saved && <LuCheck size={16} />}
            {saving ? "Saving…" : saved ? "Saved" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
