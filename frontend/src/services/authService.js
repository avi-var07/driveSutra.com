import api from "./api";

export const loginAPI = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerAPI = (data) =>
  api.post("/auth/register", data);

export const sendOTP = (email) =>
  api.post("/auth/send-otp", { email });

export const verifyOTP = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });
