import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";

export default function EmptyState({
  title = "No counters yet",
  description = "Create your first counter to start tracking today.",
}) {
  return (
    <View style={styles.container}>
      <Ionicons name="apps-outline" size={40} color={colors.mutedText} />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 24,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text,
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    color: colors.mutedText,
  },
});
