import apiClient, { unwrapResponse } from "./apiClient";

export const getStatsApi = async (deviceId) => {
  const res = await apiClient.get("/api/v1/stats", {
    params: { deviceId },
  });
  return unwrapResponse(res);
};
