import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl, ScrollView, StyleSheet, Text } from "react-native";
import LoadingView from "../components/LoadingView";
import StatCard from "../components/StatCard";
import colors from "../constants/colors";
import useCounters from "../hooks/useCounters";

export default function StatsScreen() {
  const { getStats } = useCounters();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    const data = await getStats();
    setStats(data);
  }, [getStats]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  if (!stats) {
    return <LoadingView message="Loading statistics..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.title}>Today&apos;s Statistics</Text>
      <StatCard label="Total Counters" value={stats.totalCounters} />
      <StatCard label="Completed Goals Today" value={stats.completedGoalsToday} />
      <StatCard label="Total Counts Today" value={stats.totalCountToday} />
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
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
});
