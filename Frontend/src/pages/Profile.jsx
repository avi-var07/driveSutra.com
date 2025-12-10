import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { changePasswordAPI, updateProfileAPI } from "../services/authService";

const LinkedInIcon = ({ className = "w-5 h-5", ...props }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
    <path d="M4.98 3.5A2.5 2.5 0 102 6a2.5 2.5 0 002.98-2.5zM3 8.98h4v12H3v-12zm7.5 0h3.84v1.66h.05c.54-1.02 1.86-2.09 3.83-2.09 4.1 0 4.86 2.7 4.86 6.21V21h-4v-5.02c0-1.2-.02-2.75-1.68-2.75-1.68 0-1.94 1.31-1.94 2.66V21h-4v-12z"/>
  </svg>
);


function ProfileHeader() {
  const { user, updateUser } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

  const initials = `${(user?.firstName || "")[0] || ""}${(user?.lastName || "")[0] || ""}`.toUpperCase();

  const save = async () => {
    setSaving(true);
    try {
      const res = await updateProfileAPI({ firstName, lastName, avatar });
      if (res.data?.success) {
        updateUser(res.data.user);
        setEditMode(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div
        className="w-28 h-28 rounded-2xl flex items-center justify-center text-black font-extrabold text-xl"
        style={{ background: "linear-gradient(135deg,#34d399,#60a5fa)" }}
      >
        {avatar ? (
          <img src={avatar} alt="avatar" className="w-28 h-28 object-cover rounded-2xl" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-black font-extrabold text-2xl">
            {initials}
          </div>
        )}
      </div>

      {!editMode ? (
        <>
          <h2 className="text-2xl font-semibold">
            {user?.firstName} {user?.lastName}
          </h2>
          <div className="text-sm muted">{user?.email} • Level: {user?.level || 1}</div>

          <p className="text-sm text-center text-gray-300 mt-2 px-4">
            Driving towards a greener future with smart habits.
          </p>

          <div className="w-full grid grid-cols-3 gap-4 text-center mt-4">
            <div>
              <div className="text-lg font-extrabold">{user?.ecoScore ?? 0}</div>
              <div className="text-xs muted">Eco Score</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">—</div>
              <div className="text-xs muted">Trips</div>
            </div>
            <div>
              <div className="text-lg font-extrabold">—</div>
              <div className="text-xs muted">KM Driven</div>
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            <button className="cta" onClick={() => setEditMode(true)}>Edit Profile</button>
            <button
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-300"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              Settings
            </button>
          </div>
        </>
      ) : (
        <div className="w-full mt-4 space-y-3">
          <div>
            <label className="text-sm muted block mb-1">First Name</label>
            <input className="glass-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm muted block mb-1">Last Name</label>
            <input className="glass-input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <div>
            <label className="text-sm muted block mb-1">Avatar URL</label>
            <input
              className="glass-input"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3">
            <button className="cta" onClick={save} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              className="px-4 py-2 rounded-lg border border-white/10 text-gray-300"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [pwOld, setPwOld] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwMsg, setPwMsg] = useState(null);

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const res = await updateProfileAPI({ firstName, lastName, avatar });

      if (res.data?.success) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    try {
      const res = await changePasswordAPI(pwOld, pwNew);

      if (res.data?.success) {
        setPwMsg({ ok: true, text: res.data.message });
        setPwOld("");
        setPwNew("");
      } else {
        setPwMsg({ ok: false, text: res.data?.message });
      }
    } catch (err) {
      setPwMsg({ ok: false, text: err.response?.data?.message || err.message });
    }
  };

  return (
    <>
      {/* BACKGROUND CSS + STAR EFFECT */}
      <style>{`
        .profile-bg { position: fixed; inset: 0; z-index: 0; overflow: hidden;
          background: linear-gradient(to bottom, #0b0b2b, #1b2735 70%, #090a0f); }
        .stars { position: absolute; width: 2px; height: 2px;
          box-shadow: 2vw 5vh 2px white, 6vw 12vh 1px white, 10vw 8vh 2px white,
          15vw 15vh 1px white, 22vw 22vh 1px white, 28vw 12vh 2px white,
          32vw 32vh 1px white, 38vw 18vh 2px white, 42vw 35vh 1px white;
          animation: twinkle 8s infinite linear; }
        .floating { animation: floatSmooth 7s ease-in-out infinite; }
        .glass { background: rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.06); backdrop-filter:blur(14px); }
        .elevated { box-shadow:0 24px 60px rgba(1,6,23,0.7); border-radius:16px; }
        .cta { background: linear-gradient(90deg,#34d399,#60a5fa); color:#000; padding:10px 16px; border-radius:10px; font-weight:700; }
        .muted { color:#bfc7d1; }
        .glass-input { width:100%; padding:12px 14px; border-radius:10px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.04); color:#e6eef8; }
      `}</style>

      <div className="profile-bg" aria-hidden>
        <div className="stars" />
      </div>

      {/* MAIN UI */}
      <main className="w-full min-h-screen relative z-10 flex items-start justify-center px-6 pt-28 pb-24 text-white">
        <div
          className="w-full max-w-6xl p-10 glass rounded-2xl elevated floating grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          {/* LEFT PROFILE CARD */}
          <section className="flex flex-col items-center gap-5 p-8 rounded-xl glass elevated">
            <ProfileHeader />
          </section>

          {/* RIGHT SECTION */}
          <section className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* CHANGE PASSWORD */}
            <div className="p-8 rounded-xl glass elevated">
              <h3 className="font-semibold text-lg">Change Password</h3>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm muted mb-1 block">Current Password</label>
                  <input type="password" className="glass-input" value={pwOld} onChange={(e) => setPwOld(e.target.value)} />
                </div>

                <div>
                  <label className="text-sm muted mb-1 block">New Password</label>
                  <input type="password" className="glass-input" value={pwNew} onChange={(e) => setPwNew(e.target.value)} />
                </div>

                <div className="flex items-center gap-3">
                  <button className="cta" onClick={handleChangePassword}>Save Password</button>
                  {pwMsg && (
                    <span className={pwMsg.ok ? "text-green-400" : "text-red-400"}>
                      {pwMsg.text}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* VEHICLE DETAILS */}
            <div className="p-8 rounded-xl glass elevated">
              <h3 className="font-semibold text-lg">Vehicle Details</h3>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-sm muted block mb-1">Vehicle Name</label>
                  <input className="glass-input" value="Fortuner" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Vehicle Type</label>
                  <input className="glass-input" value="Diesel" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Efficiency Score</label>
                  <input className="glass-input" value="87%" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Tire Pressure</label>
                  <input className="glass-input" value="Optimal" readOnly />
                </div>

                <div>
                  <label className="text-sm muted block mb-1">Last Service</label>
                  <input className="glass-input" value="12 Oct 2025" readOnly />
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </>
  );
}
