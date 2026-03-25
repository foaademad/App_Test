import React from "react";
import AppNavigator from "./src/navigation/AppNavigator";
import { CountersProvider } from "./src/hooks/useCounters";

export default function App() {
  return (
    <CountersProvider>
      <AppNavigator />
    </CountersProvider>
  );
}
