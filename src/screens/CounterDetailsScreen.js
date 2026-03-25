import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import AppButton from "../components/AppButton";
import LoadingView from "../components/LoadingView";
import useCounters from "../hooks/useCounters";
import colors from "../constants/colors";
import { formatDate, toProgress } from "../utils/formatters";

export default function CounterDetailsScreen({ route, navigation }) {
  const { counterId } = route.params;
  const {
    getCounter,
    getHistory,
    incrementCounter,
    decrementCounter,
    resetCounter,
    deleteCounter,
  } = useCounters();

  const [counter, setCounter] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [counterResult, historyResult] = await Promise.all([
        getCounter(counterId),
        getHistory(counterId, 14),
      ]);
      setCounter(counterResult);
      setHistory(historyResult);
    } catch {
      Alert.alert("Error", "Failed to load counter details.");
    } finally {
      setLoading(false);
    }
  }, [counterId, getCounter, getHistory]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleReset = () => {
    Alert.alert("Reset Counter", "Are you sure you want to reset this counter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: async () => {
          await resetCounter(counterId);
          await loadData();
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert("Delete Counter", "This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCounter(counterId);
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return <LoadingView message="Loading details..." />;
  }
  if (!counter) {
    return <LoadingView message="Counter not found." />;
  }

  const progress = Math.round(toProgress(counter.currentValue, counter.dailyGoal) * 100);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>{counter.title}</Text>
        <Text style={styles.value}>{counter.currentValue}</Text>
        <Text style={styles.meta}>Goal: {counter.dailyGoal}</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.meta}>{progress}% completed</Text>
      </View>

      <View style={styles.actionsColumn}>
        <AppButton
          title="Increment"
          onPress={async () => {
            await incrementCounter(counterId);
            await loadData();
          }}
        />
        <AppButton
          title="Decrement"
          variant="secondary"
          onPress={async () => {
            await decrementCounter(counterId);
            await loadData();
          }}
        />
        <AppButton title="Reset" variant="secondary" onPress={handleReset} />
        <AppButton
          title="Edit Counter"
          variant="secondary"
          onPress={() => navigation.navigate("AddEditCounter", { mode: "edit", counterId })}
        />
        <AppButton title="Delete Counter" variant="secondary" onPress={handleDelete} />
      </View>

      <Text style={styles.sectionTitle}>Recent History</Text>
      {history.length === 0 ? <Text style={styles.emptyText}>No history yet.</Text> : null}
      {history.map((row) => (
        <View key={row.id} style={styles.historyCard}>
          <Text style={styles.historyDate}>{formatDate(row.date)}</Text>
          <Text style={styles.historyMeta}>
            Value: {row.value} | Goal: {row.goal} | {row.completed ? "Completed" : "In Progress"}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  value: {
    fontSize: 42,
    fontWeight: "700",
    color: colors.text,
    marginVertical: 6,
  },
  meta: {
    color: colors.mutedText,
    fontSize: 13,
  },
  progressTrack: {
    marginTop: 8,
    marginBottom: 6,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.success,
  },
  actionsColumn: {
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  emptyText: {
    color: colors.mutedText,
  },
  historyCard: {
    marginTop: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
  },
  historyDate: {
    fontSize: 14,
    color: colors.text,
    fontWeight: "600",
  },
  historyMeta: {
    fontSize: 13,
    color: colors.mutedText,
    marginTop: 4,
  },
});
