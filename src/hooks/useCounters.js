import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getStatsApi } from "../api/statsApi";
import { isApiConfigured, isBackendRequired, isSecureApiConfigured } from "../api/apiClient";
import useDeviceId from "./useDeviceId";
import {
  enqueueAction,
  getCounterByLocalId,
  getCounterHistory,
  getCounters,
  removeCounter,
  saveCounters,
  updateTodayHistory,
  upsertCounter,
} from "../services/storageService";
import { syncNow } from "../services/syncService";

const CountersContext = createContext(null);

const createLocalId = () => `local_${Date.now()}_${Math.random().toString(16).slice(2, 10)}`;

const sortByUpdatedAtDesc = (counters) => {
  return [...counters].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
};

export function CountersProvider({ children }) {
  const { deviceId, loading: deviceLoading } = useDeviceId();
  const [counters, setCounters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const loadCounters = useCallback(async () => {
    if (!deviceId) {
      return [];
    }
    const stored = await getCounters(deviceId);
    const sorted = sortByUpdatedAtDesc(stored);
    setCounters(sorted);
    return sorted;
  }, [deviceId]);

  const trySync = useCallback(async () => {
    if (!deviceId || !isApiConfigured) {
      return false;
    }
    setSyncing(true);
    const ok = await syncNow(deviceId);
    await loadCounters();
    setSyncing(false);
    return ok;
  }, [deviceId, loadCounters]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isBackendRequired && !isApiConfigured) {
        throw new Error("Backend is required but API base URL is missing or invalid.");
      }
      if (isApiConfigured && !isSecureApiConfigured) {
        setError("Insecure API URL detected. Use HTTPS before store release.");
      }
      // API-first: when backend is configured, sync first then read local mirror.
      if (isApiConfigured) {
        const synced = await trySync();
        if (!synced) {
          const syncMessage = isBackendRequired
            ? "Could not sync with server. Backend is required."
            : "Could not sync with server. Showing local data.";
          setError(syncMessage);
          if (isBackendRequired) {
            throw new Error(syncMessage);
          }
        }
      }
      const data = await loadCounters();
      return data;
    } catch (refreshError) {
      setError(refreshError.message || "Failed to load counters.");
      return [];
    } finally {
      setLoading(false);
    }
  }, [loadCounters, trySync]);

  const createCounter = useCallback(
    async ({ title, icon, color, dailyGoal, currentValue }) => {
      const now = new Date().toISOString();
      const counter = {
        localId: createLocalId(),
        remoteId: "",
        deviceId,
        title: String(title).trim(),
        icon,
        color,
        dailyGoal: Number(dailyGoal),
        currentValue: Number(currentValue || 0),
        isArchived: false,
        createdAt: now,
        updatedAt: now,
      };
      await upsertCounter(deviceId, counter);
      await updateTodayHistory(deviceId, counter);
      await enqueueAction(deviceId, { type: "create", localId: counter.localId });
      await loadCounters();
      if (isApiConfigured) {
        const synced = await trySync();
        if (!synced) {
          const syncMessage = isBackendRequired
            ? "Server sync failed. Backend is required."
            : "Saved locally. Server sync pending.";
          setError(syncMessage);
          if (isBackendRequired) {
            throw new Error(syncMessage);
          }
        }
      }
      return counter;
    },
    [deviceId, loadCounters, trySync]
  );

  const updateCounter = useCallback(
    async (localId, updates) => {
      const existing = await getCounterByLocalId(deviceId, localId);
      if (!existing) {
        throw new Error("Counter not found.");
      }
      const updated = {
        ...existing,
        ...updates,
        dailyGoal: updates.dailyGoal ? Number(updates.dailyGoal) : existing.dailyGoal,
        currentValue:
          updates.currentValue !== undefined
            ? Math.max(0, Number(updates.currentValue))
            : existing.currentValue,
        updatedAt: new Date().toISOString(),
      };
      await upsertCounter(deviceId, updated);
      await updateTodayHistory(deviceId, updated);
      await enqueueAction(deviceId, { type: "update", localId });
      await loadCounters();
      if (isApiConfigured) {
        const synced = await trySync();
        if (!synced) {
          const syncMessage = isBackendRequired
            ? "Server sync failed. Backend is required."
            : "Updated locally. Server sync pending.";
          setError(syncMessage);
          if (isBackendRequired) {
            throw new Error(syncMessage);
          }
        }
      }
      return updated;
    },
    [deviceId, loadCounters, trySync]
  );

  const deleteCounter = useCallback(
    async (localId) => {
      const existing = await getCounterByLocalId(deviceId, localId);
      await removeCounter(deviceId, localId);
      await enqueueAction(deviceId, {
        type: "delete",
        localId,
        remoteId: existing?.remoteId || "",
      });
      await loadCounters();
      if (isApiConfigured) {
        const synced = await trySync();
        if (!synced) {
          const syncMessage = isBackendRequired
            ? "Server sync failed. Backend is required."
            : "Deleted locally. Server sync pending.";
          setError(syncMessage);
          if (isBackendRequired) {
            throw new Error(syncMessage);
          }
        }
      }
    },
    [deviceId, loadCounters, trySync]
  );

  const changeCounterValue = useCallback(
    async (localId, type, amount = 1) => {
      const existing = await getCounterByLocalId(deviceId, localId);
      if (!existing) {
        throw new Error("Counter not found.");
      }

      let nextValue = existing.currentValue;
      if (type === "increment") {
        nextValue += amount;
      } else if (type === "decrement") {
        nextValue = Math.max(0, nextValue - amount);
      } else if (type === "reset") {
        nextValue = 0;
      }

      const updated = {
        ...existing,
        currentValue: nextValue,
        updatedAt: new Date().toISOString(),
      };

      await upsertCounter(deviceId, updated);
      await updateTodayHistory(deviceId, updated);
      await enqueueAction(deviceId, { type, localId, amount });
      await loadCounters();
      if (isApiConfigured) {
        const synced = await trySync();
        if (!synced) {
          const syncMessage = isBackendRequired
            ? "Server sync failed. Backend is required."
            : "Saved locally. Server sync pending.";
          setError(syncMessage);
          if (isBackendRequired) {
            throw new Error(syncMessage);
          }
        }
      }
      return updated;
    },
    [deviceId, loadCounters, trySync]
  );

  const incrementCounter = useCallback(
    async (localId) => changeCounterValue(localId, "increment", 1),
    [changeCounterValue]
  );

  const decrementCounter = useCallback(
    async (localId) => changeCounterValue(localId, "decrement", 1),
    [changeCounterValue]
  );

  const resetCounter = useCallback(
    async (localId) => changeCounterValue(localId, "reset", 0),
    [changeCounterValue]
  );

  const getCounter = useCallback(
    async (localId) => {
      return getCounterByLocalId(deviceId, localId);
    },
    [deviceId]
  );

  const getHistory = useCallback(
    async (localId, limit = 30) => {
      return getCounterHistory(deviceId, localId, limit);
    },
    [deviceId]
  );

  const getStats = useCallback(async () => {
    if (isApiConfigured) {
      try {
        const apiStats = await getStatsApi(deviceId);
        return {
          totalCounters: apiStats.totalCounters || 0,
          completedGoalsToday: apiStats.completedToday || 0,
          totalCountToday: apiStats.totalCountToday || 0,
        };
      } catch {
        // Falls back to local summary below.
      }
    }

    const stored = await getCounters(deviceId);
    return {
      totalCounters: stored.length,
      completedGoalsToday: stored.filter((item) => item.currentValue >= item.dailyGoal)
        .length,
      totalCountToday: stored.reduce((sum, item) => sum + item.currentValue, 0),
    };
  }, [deviceId]);

  const value = useMemo(
    () => ({
      deviceId,
      counters,
      loading: loading || deviceLoading,
      syncing,
      error,
      refresh,
      createCounter,
      updateCounter,
      deleteCounter,
      incrementCounter,
      decrementCounter,
      resetCounter,
      getCounter,
      getHistory,
      getStats,
    }),
    [
      deviceId,
      counters,
      loading,
      deviceLoading,
      syncing,
      error,
      refresh,
      createCounter,
      updateCounter,
      deleteCounter,
      incrementCounter,
      decrementCounter,
      resetCounter,
      getCounter,
      getHistory,
      getStats,
    ]
  );

  return <CountersContext.Provider value={value}>{children}</CountersContext.Provider>;
}

export default function useCounters() {
  const context = useContext(CountersContext);
  if (!context) {
    throw new Error("useCounters must be used inside CountersProvider.");
  }
  return context;
}
