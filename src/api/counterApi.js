import apiClient, { unwrapResponse } from "./apiClient";

export const createCounterApi = async (payload) => {
  const res = await apiClient.post("/api/v1/counters", payload);
  return unwrapResponse(res);
};

export const getAllCountersApi = async (deviceId) => {
  const res = await apiClient.get("/api/v1/counters", {
    params: { deviceId },
  });
  return unwrapResponse(res);
};

export const getCounterByIdApi = async (counterId, deviceId) => {
  const res = await apiClient.get(`/api/v1/counters/${counterId}`, {
    params: { deviceId },
  });
  return unwrapResponse(res);
};

export const updateCounterApi = async (counterId, payload) => {
  const res = await apiClient.put(`/api/v1/counters/${counterId}`, payload);
  return unwrapResponse(res);
};

export const deleteCounterApi = async (counterId, deviceId) => {
  const res = await apiClient.delete(`/api/v1/counters/${counterId}`, {
    params: { deviceId },
  });
  return unwrapResponse(res);
};

export const incrementCounterApi = async (counterId, payload) => {
  const res = await apiClient.patch(`/api/v1/counters/${counterId}/increment`, payload);
  return unwrapResponse(res);
};

export const decrementCounterApi = async (counterId, payload) => {
  const res = await apiClient.patch(`/api/v1/counters/${counterId}/decrement`, payload);
  return unwrapResponse(res);
};

export const resetCounterApi = async (counterId, payload) => {
  const res = await apiClient.patch(`/api/v1/counters/${counterId}/reset`, payload);
  return unwrapResponse(res);
};

export const getCounterHistoryApi = async (counterId, deviceId, limit = 30) => {
  const res = await apiClient.get(`/api/v1/counters/${counterId}/history`, {
    params: { deviceId, limit },
  });
  return unwrapResponse(res);
};
