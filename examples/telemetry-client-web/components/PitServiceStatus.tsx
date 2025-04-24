import React, { useMemo } from "react";
import { Text, View } from "react-native";
import {
  isNone,
  isInProgress,
  isComplete,
  isTooFarLeft,
  isTooFarRight,
  isTooFarForward,
  isTooFarBackward,
  isBadAngle,
  isTooMuchDamage,
} from "@iracing-data/telemetry-types";

const pitServiceStatusDescription = (value: number) => {
  console.log(value, isNone(value));
  return [
    value === 0 && "None",
    isInProgress(value) && "In Progress",
    isComplete(value) && "Complete",
    isTooFarLeft(value) && "Too Far Left",
    isTooFarRight(value) && "Too Far Right",
    isTooFarForward(value) && "Too Far Forward",
    isTooFarBackward(value) && "Too Far Backward",
    isBadAngle(value) && "Bad Angle",
    isTooMuchDamage(value) && "Too Much Damage",
  ]
    .filter(Boolean)
    .join(", ");
};

export const PitServiceStatus = ({ value = 0 }: { value?: number }) => {
  const content = useMemo(() => {
    return pitServiceStatusDescription(value);
  }, [value]);

  if (value === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>{`Pit Service Status: ${value} (0x${value.toString(16)})`}</Text>
      <Text>{content}</Text>
    </View>
  );
};

export default PitServiceStatus;
