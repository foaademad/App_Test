import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import colors from "../constants/colors";

export default function LoadingView({ message = "Loading..." }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  text: {
    color: colors.mutedText,
    fontSize: 14,
  },
});
