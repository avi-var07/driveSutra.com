import api from "./api";

export const loginAPI = (email, password) =>
  api.post("/auth/login", { email, password });

export const registerAPI = (data) =>
  api.post("/auth/register", data);

export const sendOTP = (email) =>
  api.post("/auth/send-otp", { email });

export const verifyOTP = (email, otp) =>
  api.post("/auth/verify-otp", { email, otp });

export const changePasswordAPI = (oldPassword, newPassword) =>
  api.post("/auth/change-password", { oldPassword, newPassword });

export const updateProfileAPI = (profile) =>
  api.post("/auth/update-profile", profile);

export const logoutAPI = () =>
  api.post("/auth/logout");

export const getUserSessionsAPI = () =>
  api.get("/auth/sessions");
