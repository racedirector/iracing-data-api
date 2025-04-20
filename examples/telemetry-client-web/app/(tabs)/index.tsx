import { Text, View } from "react-native";
import { Flags } from "@/components/Flags";
import { PitServiceStatus } from "@/components/PitServiceStatus";
import { useGetTelemetry } from "@/hooks/useGetTelemetry";

export default function Index() {
  const {
    PlayerCarIdx: playerCarIndex,
    SessionFlags: sessionFlags,
    PitSvFlags: pitServiceFlags,
  } = useGetTelemetry({
    keys: [
      "PlayerCarIdx",
      "SessionFlags",
      "PitSvFlags",
      "CarIdxPaceFlags",
      "PlayerCarPitSvStatus",
    ],
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
      <PitServiceStatus value={pitServiceFlags} />
    </View>
  );
}
