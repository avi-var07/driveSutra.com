import mongoose from "mongoose";

const otpTokenSchema = new mongoose.Schema(
  {
    email:   { type: String, required: true },
    code:    { type: String, required: true }, // 6 digit string
    purpose: { type: String, enum: ["register", "forgot"], default: "register" },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// optional: auto delete after expiry using TTL index
otpTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpToken", otpTokenSchema);
