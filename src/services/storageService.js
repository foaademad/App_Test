import AsyncStorage from "@react-native-async-storage/async-storage";
import { getTodayKey } from "../utils/formatters";

const DEVICE_ID_KEY = "daily-counter:deviceId";

const countersKey = (deviceId) => `daily-counter:counters:${deviceId}`;
const historyKey = (deviceId) => `daily-counter:history:${deviceId}`;
const queueKey = (deviceId) => `daily-counter:queue:${deviceId}`;

const readJson = async (key, fallback) => {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) {
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJson = async (key, value) => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

export const getDeviceId = async () => {
  return AsyncStorage.getItem(DEVICE_ID_KEY);
};

export const setDeviceId = async (deviceId) => {
  await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId);
};

export const getCounters = async (deviceId) => {
  return readJson(countersKey(deviceId), []);
};

export const saveCounters = async (deviceId, counters) => {
  await writeJson(countersKey(deviceId), counters);
};

export const getCounterByLocalId = async (deviceId, localId) => {
  const counters = await getCounters(deviceId);
  return counters.find((counter) => counter.localId === localId) || null;
};

export const upsertCounter = async (deviceId, updatedCounter) => {
  const counters = await getCounters(deviceId);
  const index = counters.findIndex((item) => item.localId === updatedCounter.localId);

  if (index < 0) {
    counters.unshift(updatedCounter);
  } else {
    counters[index] = updatedCounter;
  }

  await saveCounters(deviceId, counters);
  return counters;
};

export const removeCounter = async (deviceId, localId) => {
  const counters = await getCounters(deviceId);
  const filtered = counters.filter((counter) => counter.localId !== localId);
  await saveCounters(deviceId, filtered);
  return filtered;
};

export const getHistory = async (deviceId) => {
  return readJson(historyKey(deviceId), []);
};

export const saveHistory = async (deviceId, historyRows) => {
  await writeJson(historyKey(deviceId), historyRows);
};

export const updateTodayHistory = async (deviceId, counter) => {
  const historyRows = await getHistory(deviceId);
  const today = getTodayKey();
  const index = historyRows.findIndex(
    (row) => row.counterId === counter.localId && row.date === today
  );

  const nextRecord = {
    id: index >= 0 ? historyRows[index].id : `${today}-${counter.localId}`,
    counterId: counter.localId,
    deviceId,
    date: today,
    value: counter.currentValue,
    goal: counter.dailyGoal,
    completed: counter.currentValue >= counter.dailyGoal,
    createdAt: index >= 0 ? historyRows[index].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    historyRows[index] = nextRecord;
  } else {
    historyRows.unshift(nextRecord);
  }

  await saveHistory(deviceId, historyRows);
  return nextRecord;
};

export const getCounterHistory = async (deviceId, localId, limit = 30) => {
  const historyRows = await getHistory(deviceId);
  return historyRows
    .filter((row) => row.counterId === localId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
};

export const getPendingQueue = async (deviceId) => {
  return readJson(queueKey(deviceId), []);
};

export const savePendingQueue = async (deviceId, queue) => {
  await writeJson(queueKey(deviceId), queue);
};

export const enqueueAction = async (deviceId, action) => {
  const queue = await getPendingQueue(deviceId);
  queue.push(action);
  await savePendingQueue(deviceId, queue);
  return queue;
};
