import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: "blue" }}>
      <Tabs.Screen name="index" options={{ title: "Telemetry" }} />
      <Tabs.Screen name="subscription" options={{ title: "Subscription" }} />
      <Tabs.Screen name="broadcast" options={{ title: "Broadcast" }} />
    </Tabs>
  );
}
