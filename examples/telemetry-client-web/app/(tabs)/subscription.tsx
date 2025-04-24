import { Text, View } from "react-native";
import { Flags } from "@/components/Flags";
import { useTelemetrySubscription } from "@/hooks/useTelemetrySubscription";

export default function Index() {
  const { PlayerCarIdx: playerCarIndex, SessionFlags: sessionFlags = -1 } =
    useTelemetrySubscription({
      fps: 10,
      keys: ["PlayerCarIdx", "SessionFlags"],
    });

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>{`The player is index: ${playerCarIndex}`}</Text>
      <Flags value={sessionFlags} />
    </View>
  );
}
