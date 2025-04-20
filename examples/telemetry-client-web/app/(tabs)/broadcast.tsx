import { Button, Text, View } from "react-native";
import {
  useBroadcastContext,
  Consumer as BroadcastConsumer,
  Provider as BroadcastProvider,
} from "@/contexts/BroadcastContext";

export default function Index() {
  const { reloadTextures } = useBroadcastContext();

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
          </View>
        )}
      </BroadcastConsumer>
    </BroadcastProvider>
  );
}
