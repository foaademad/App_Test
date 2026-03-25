import React from "react";
import { StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";

export default function StatCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },
  label: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 4,
  },
  value: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
  },
});
