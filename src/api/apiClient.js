import axios from "axios";

const baseURL = "https://test.carlink.market";
const requireBackendEnv = String(process.env.EXPO_PUBLIC_REQUIRE_BACKEND || "").toLowerCase();

export const isApiConfigured = Boolean(baseURL);
export const isSecureApiConfigured = baseURL.startsWith("https://");
export const isBackendRequired = requireBackendEnv === "true" || requireBackendEnv === "1";

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const unwrapResponse = (response) => {
  const payload = response?.data;
  if (!payload?.success) {
    throw new Error(payload?.message || "Request failed.");
  }
  return payload.data;
};

export default apiClient;
