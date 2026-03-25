import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import colors from "../constants/colors";

export default function AppButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}) {
  const isPrimary = variant === "primary";
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, isPrimary ? styles.primaryText : styles.secondaryText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  text: {
    fontWeight: "600",
    fontSize: 15,
  },
  primaryText: {
    color: "#FFFFFF",
  },
  secondaryText: {
    color: colors.text,
  },
  disabled: {
    opacity: 0.6,
  },
});
