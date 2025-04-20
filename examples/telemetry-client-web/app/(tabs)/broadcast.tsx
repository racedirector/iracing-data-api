import { Button, Text, View } from "react-native";
import ReplayControls from "@/components/ReplayControls";
import {
  Consumer as BroadcastConsumer,
  Provider as BroadcastProvider,
} from "@/contexts/BroadcastContext";

export default function Index() {
  return (
    <BroadcastProvider>
      <BroadcastConsumer>
        {({ reloadTextures }) => (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text>{`Broadcast Screen`}</Text>
            <Button
              title="Reload All Textures"
              onPress={() => reloadTextures()}
            />
            <ReplayControls isPlaying />
          </View>
        )}
      </BroadcastConsumer>
    </BroadcastProvider>
  );
}
