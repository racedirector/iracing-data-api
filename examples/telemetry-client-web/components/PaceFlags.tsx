import React, { useMemo } from "react";
import { Text, View } from "react-native";
import {
  isEndOfLine,
  isFreePass,
  isWavedAround,
} from "@iracing-data/telemetry-types";

const paceFlagsDescription = (value: number) => {
  return [
    isEndOfLine(value) && "End of Line",
    isFreePass(value) && "Free Pass",
    isWavedAround(value) && "Waved Around",
  ]
    .filter(Boolean)
    .join(", ");
};

export const PaceFlags = ({ value }: { value?: number }) => {
  const content = useMemo(() => {
    return value !== undefined ? paceFlagsDescription(value) : undefined;
  }, [value]);

  if (value === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>{`Pace Flags: ${value} (0x${value.toString(16)})`}</Text>
      <Text>{content}</Text>
    </View>
  );
};

export default PaceFlags;
