import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AppButton from "../components/AppButton";
import colors from "../constants/colors";
import { COUNTER_COLORS, COUNTER_ICONS } from "../constants/icons";
import useCounters from "../hooks/useCounters";
import { validateCounterForm } from "../utils/validators";

export default function AddEditCounterScreen({ navigation, route }) {
  const mode = route.params?.mode || "create";
  const counterId = route.params?.counterId || "";
  const { getCounter, createCounter, updateCounter } = useCounters();

  const [title, setTitle] = useState("");
  const [dailyGoal, setDailyGoal] = useState("10");
  const [icon, setIcon] = useState(COUNTER_ICONS[0]);
  const [color, setColor] = useState(COUNTER_COLORS[0]);
  const [initialValue, setInitialValue] = useState("0");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (mode !== "edit" || !counterId) {
      return;
    }

    getCounter(counterId)
      .then((counter) => {
        if (!counter) {
          return;
        }
        setTitle(counter.title);
        setDailyGoal(String(counter.dailyGoal));
        setIcon(counter.icon);
        setColor(counter.color);
        setInitialValue(String(counter.currentValue));
      })
      .catch(() => {
        Alert.alert("Error", "Failed to load counter.");
      });
  }, [counterId, getCounter, mode]);

  const titleText = useMemo(() => (mode === "edit" ? "Edit Counter" : "Add Counter"), [mode]);

  const onSave = async () => {
    const payload = {
      title: title.trim(),
      dailyGoal: Number(dailyGoal),
      icon,
      color,
      currentValue: Number(initialValue),
    };

    const validationError = validateCounterForm(payload);
    if (validationError) {
      Alert.alert("Validation", validationError);
      return;
    }

    setSaving(true);
    try {
      if (mode === "edit") {
        await updateCounter(counterId, payload);
      } else {
        await createCounter(payload);
      }
      navigation.goBack();
    } catch (saveError) {
      Alert.alert("Error", saveError.message || "Failed to save counter.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>{titleText}</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} maxLength={50} />

      <Text style={styles.label}>Daily Goal</Text>
      <TextInput
        style={styles.input}
        value={dailyGoal}
        onChangeText={setDailyGoal}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Initial Value</Text>
      <TextInput
        style={styles.input}
        value={initialValue}
        onChangeText={setInitialValue}
        keyboardType="number-pad"
      />

      <Text style={styles.label}>Icon</Text>
      <View style={styles.iconGrid}>
        {COUNTER_ICONS.map((iconName) => (
          <TouchableOpacity
            key={iconName}
            style={[
              styles.iconOption,
              iconName === icon && styles.iconSelected,
              { borderColor: iconName === icon ? color : colors.border },
            ]}
            onPress={() => setIcon(iconName)}
          >
            <Ionicons name={iconName} size={20} color={iconName === icon ? color : colors.text} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorGrid}>
        {COUNTER_COLORS.map((entry) => (
          <TouchableOpacity
            key={entry}
            style={[styles.colorOption, { backgroundColor: entry }, entry === color && styles.colorSelected]}
            onPress={() => setColor(entry)}
          />
        ))}
      </View>

      <AppButton title={saving ? "Saving..." : "Save"} onPress={onSave} disabled={saving} />
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
    paddingBottom: 30,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.card,
  },
  iconSelected: {
    borderWidth: 2,
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  colorOption: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  colorSelected: {
    borderColor: "#111827",
    borderWidth: 3,
  },
});
