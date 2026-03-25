import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../screens/HomeScreen";
import AddEditCounterScreen from "../screens/AddEditCounterScreen";
import CounterDetailsScreen from "../screens/CounterDetailsScreen";
import StatsScreen from "../screens/StatsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import colors from "../constants/colors";

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} options={{ title: "Daily Counter" }} />
      <HomeStack.Screen
        name="AddEditCounter"
        component={AddEditCounterScreen}
        options={({ route }) => ({
          title: route.params?.mode === "edit" ? "Edit Counter" : "Add Counter",
        })}
      />
      <HomeStack.Screen
        name="CounterDetails"
        component={CounterDetailsScreen}
        options={{ title: "Counter Details" }}
      />
    </HomeStack.Navigator>
  );
}

function renderTabIcon(iconName, focused) {
  return (
    <Ionicons
      name={iconName}
      size={20}
      color={focused ? colors.primary : colors.mutedText}
    />
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => renderTabIcon("home-outline", focused),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabIcon("stats-chart-outline", focused),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => renderTabIcon("settings-outline", focused),
        }}
      />
    </Tab.Navigator>
  );
}
