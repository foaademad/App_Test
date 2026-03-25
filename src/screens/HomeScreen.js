import React, { useCallback } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import useCounters from "../hooks/useCounters";
import AppButton from "../components/AppButton";
import CounterCard from "../components/CounterCard";
import LoadingView from "../components/LoadingView";
import EmptyState from "../components/EmptyState";
import colors from "../constants/colors";

export default function HomeScreen({ navigation }) {
  const {
    counters,
    loading,
    error,
    syncing,
    refresh,
    incrementCounter,
    decrementCounter,
  } = useCounters();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const openCreate = useCallback(() => {
    navigation.navigate("AddEditCounter", { mode: "create" });
  }, [navigation]);

  const openDetails = useCallback((counterId) => {
    navigation.navigate("CounterDetails", { counterId });
  }, [navigation]);

  if (loading) {
    return <LoadingView message="Loading counters..." />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Daily Counter</Text>
      <AppButton title="Add Counter" onPress={openCreate} />
      {syncing ? <Text style={styles.syncText}>Syncing changes...</Text> : null}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {counters.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={counters}
          keyExtractor={(item) => item.localId}
          renderItem={({ item }) => (
            <CounterCard
              counter={item}
              onPress={openDetails}
              onIncrement={incrementCounter}
              onDecrement={decrementCounter}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 12,
  },
  syncText: {
    marginTop: 10,
    color: colors.warning,
    fontSize: 13,
  },
  errorText: {
    marginTop: 8,
    color: colors.danger,
    fontSize: 13,
  },
  list: {
    marginTop: 12,
    paddingBottom: 80,
  },
});
