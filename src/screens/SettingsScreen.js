import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Constants from "expo-constants";
import colors from "../constants/colors";
import useCounters from "../hooks/useCounters";

export default function SettingsScreen() {
  const appVersion = Constants.expoConfig?.version || "1.0.0";
  const { deviceId } = useCounters();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Version</Text>
        <Text style={styles.cardText}>Version: {appVersion}</Text>
        <Text style={styles.cardText}>Device ID: {deviceId}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>About</Text>
        <Text style={styles.cardText}>
          Daily Counter is a minimal utility app for tracking daily activities like water, workouts, reading, and task completion.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Privacy</Text>
        <Text style={styles.cardText}>
          This app does not request camera, location, contacts, microphone, or background tracking permissions.
        </Text>
        <Text style={styles.cardText}>
          No login is required. Counter data is synced with the server when available, and a local copy is kept on your device for reliability.
        </Text>
        <Text style={styles.cardText}>
          Device ID is used only for syncing your counters between app launches on this device.
        </Text>
      </View>
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
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 10,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  cardText: {
    fontSize: 13,
    color: colors.mutedText,
    marginBottom: 6,
    lineHeight: 18,
  },
});
