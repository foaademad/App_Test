import { isApiConfigured } from "../api/apiClient";
import {
  createCounterApi,
  decrementCounterApi,
  deleteCounterApi,
  getAllCountersApi,
  incrementCounterApi,
  resetCounterApi,
  updateCounterApi,
} from "../api/counterApi";
import {
  getCounterByLocalId,
  getCounters,
  getPendingQueue,
  saveCounters,
  savePendingQueue,
} from "./storageService";

let activeSync = false;

const toRemotePayload = (counter, deviceId) => ({
  deviceId,
  title: counter.title,
  icon: counter.icon,
  color: counter.color,
  dailyGoal: counter.dailyGoal,
  currentValue: counter.currentValue,
  isArchived: counter.isArchived,
});

const ensureRemoteId = async (deviceId, localId) => {
  const counter = await getCounterByLocalId(deviceId, localId);
  if (!counter) {
    return "";
  }
  if (counter.remoteId) {
    return counter.remoteId;
  }

  const created = await createCounterApi(toRemotePayload(counter, deviceId));
  const counters = await getCounters(deviceId);
  const index = counters.findIndex((item) => item.localId === localId);
  if (index >= 0) {
    counters[index] = {
      ...counters[index],
      remoteId: created.id,
      updatedAt: new Date().toISOString(),
    };
    await saveCounters(deviceId, counters);
  }
  return created.id;
};

const processQueueItem = async (deviceId, item) => {
  if (item.type === "create") {
    await ensureRemoteId(deviceId, item.localId);
    return;
  }

  if (item.type === "delete") {
    const remoteId = item.remoteId || (await ensureRemoteId(deviceId, item.localId));
    if (remoteId) {
      await deleteCounterApi(remoteId, deviceId);
    }
    return;
  }

  const remoteId = await ensureRemoteId(deviceId, item.localId);
  if (!remoteId) {
    return;
  }

  if (item.type === "update") {
    const counter = await getCounterByLocalId(deviceId, item.localId);
    if (!counter) {
      return;
    }
    await updateCounterApi(remoteId, toRemotePayload(counter, deviceId));
    return;
  }

  if (item.type === "increment") {
    await incrementCounterApi(remoteId, { deviceId, amount: item.amount || 1 });
    return;
  }

  if (item.type === "decrement") {
    await decrementCounterApi(remoteId, { deviceId, amount: item.amount || 1 });
    return;
  }

  if (item.type === "reset") {
    await resetCounterApi(remoteId, { deviceId });
  }
};

const mergeRemoteCounters = async (deviceId) => {
  const remoteCounters = await getAllCountersApi(deviceId);
  const localCounters = await getCounters(deviceId);
  const byRemoteId = new Map();

  for (const localCounter of localCounters) {
    if (localCounter.remoteId) {
      byRemoteId.set(localCounter.remoteId, localCounter);
    }
  }

  const merged = remoteCounters.map((remoteCounter) => {
    const existing = byRemoteId.get(remoteCounter.id);
    return {
      localId: existing?.localId || `local-${remoteCounter.id}`,
      remoteId: remoteCounter.id,
      deviceId: remoteCounter.deviceId,
      title: remoteCounter.title,
      icon: remoteCounter.icon,
      color: remoteCounter.color,
      dailyGoal: remoteCounter.dailyGoal,
      currentValue: remoteCounter.currentValue,
      isArchived: remoteCounter.isArchived,
      createdAt: remoteCounter.createdAt || existing?.createdAt || new Date().toISOString(),
      updatedAt: remoteCounter.updatedAt || new Date().toISOString(),
    };
  });

  await saveCounters(deviceId, merged);
  return merged;
};

export const syncNow = async (deviceId) => {
  if (!isApiConfigured || activeSync) {
    return false;
  }

  activeSync = true;
  try {
    const queue = await getPendingQueue(deviceId);
    if (queue.length > 0) {
      const remaining = [];
      for (const item of queue) {
        try {
          await processQueueItem(deviceId, item);
        } catch {
          remaining.push(item);
        }
      }
      await savePendingQueue(deviceId, remaining);
    }

    await mergeRemoteCounters(deviceId);
    return true;
  } catch {
    return false;
  } finally {
    activeSync = false;
  }
};
