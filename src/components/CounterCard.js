import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import colors from "../constants/colors";
import { toProgress } from "../utils/formatters";

export default function CounterCard({ counter, onPress, onIncrement, onDecrement }) {
  const progress = Math.round(toProgress(counter.currentValue, counter.dailyGoal) * 100);

  return (
    <Pressable style={styles.card} onPress={() => onPress(counter.localId)}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <View style={[styles.iconCircle, { backgroundColor: counter.color }]}>
            <Ionicons name={counter.icon} size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.title}>{counter.title}</Text>
            <Text style={styles.subtitle}>Goal: {counter.dailyGoal}</Text>
          </View>
        </View>
        <Text style={styles.value}>{counter.currentValue}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{progress}%</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionBtn, styles.minus]} onPress={() => onDecrement(counter.localId)}>
          <Ionicons name="remove" size={18} color={colors.danger} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.plus]} onPress={() => onIncrement(counter.localId)}>
          <Ionicons name="add" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  titleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
  },
  value: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
  },
  progressRow: {
    marginTop: 10,
  },
  progressText: {
    color: colors.mutedText,
    fontSize: 12,
    marginBottom: 6,
  },
  progressTrack: {
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
  actions: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  minus: {
    borderColor: "#FECACA",
    backgroundColor: "#FEF2F2",
  },
  plus: {
    borderColor: "#BFDBFE",
    backgroundColor: "#EFF6FF",
  },
});
