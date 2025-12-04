import React, { useState } from "react";

export default function RegisterForm({ switchToLogin }) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOTP = () => {
    if (!form.email) return;
    setOtpSent(true);
    // backend later: send OTP
  };

  const handleVerifyOTP = () => {
    if (!otp) return;
    setEmailVerified(true);
    // backend later: verify OTP
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!emailVerified) return;
    // backend later: register user
  };

  return (
    <div className="max-w-md w-full backdrop-blur-md bg-white/4 border border-white/6 rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent mb-8">
        Create Account 🌱
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={form.firstName}
            onChange={handleChange}
            required
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={form.lastName}
            onChange={handleChange}
            required
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 transition"
          />
        </div>

        {/* Email + Verify */}
        <div>
          <div className="flex gap-2">
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={emailVerified}
              className={`flex-1 px-4 py-3 bg-white/5 border ${
                emailVerified
                  ? "border-emerald-400/50"
                  : "border-white/10"
              } rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 transition`}
            />

            {!emailVerified ? (
              <button
                type="button"
                onClick={handleSendOTP}
                className="px-4 py-2 whitespace-nowrap rounded-lg border border-emerald-400/40 bg-emerald-400/20 text-emerald-300 font-semibold hover:brightness-110 transition"
              >
                Verify
              </button>
            ) : (
              <span className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40 flex items-center">
                ✓ Verified
              </span>
            )}
          </div>

          {/* OTP Field */}
          {otpSent && !emailVerified && (
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 transition"
              />
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-400 to-sky-400 text-slate-900 font-semibold hover:brightness-110 transition"
              >
                Submit
              </button>
            </div>
          )}
        </div>

        {/* Password fields */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 transition"
        />

        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-400/50 transition"
        />

        <button
          type="submit"
          disabled={!emailVerified || loading}
          className="w-full bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400 text-slate-900 font-bold py-3 rounded-lg shadow-lg hover:brightness-110 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-300">
        Already have an account?{" "}
        <button
          onClick={switchToLogin}
          className="text-emerald-400 font-semibold hover:underline transition"
        >
          Login
        </button>
      </p>
    </div>
  );
}
