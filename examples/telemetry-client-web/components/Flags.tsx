import React, { useMemo } from "react";
import { Text, View } from "react-native";
import {
  isCheckered,
  isWhite,
  isGreen,
  isYellow,
  isRed,
  isBlack,
  isBlue,
  isDebris,
  isCrossed,
  isYellowWaving,
  isOneToGreen,
  isGreenHeld,
  isTenToGo,
  isFiveToGo,
  isRandomWaving,
  isCaution,
  isCautionWaving,
  isDisqualify,
  isServicible,
  isFurled,
  isRepair,
  isStartHidden,
  isStartReady,
  isStartSet,
  isStartGo,
} from "@iracing-data/telemetry-types";

const flagsDescription = (value: number) => {
  return [
    isCheckered(value) && "Checkered",
    isWhite(value) && "White",
    isGreen(value) && "Green",
    isYellow(value) && "Yellow",
    isRed(value) && "Red",
    isBlack(value) && "Black",
    isBlue(value) && "Blue",
    isDebris(value) && "Debris",
    isCrossed(value) && "Crossed",
    isYellowWaving(value) && "Yellow Waving",
    isOneToGreen(value) && "One to Green",
    isGreenHeld(value) && "Green Held",
    isTenToGo(value) && "Ten to Go",
    isFiveToGo(value) && "Five to Go",
    isRandomWaving(value) && "Random Waving",
    isCaution(value) && "Caution",
    isCautionWaving(value) && "Caution Waving",
    isDisqualify(value) && "Disqualify",
    isServicible(value) && "Servicible",
    isFurled(value) && "Furled",
    isRepair(value) && "Repair",
    isStartHidden(value) && "Start Hidden",
    isStartReady(value) && "Start Ready",
    isStartSet(value) && "Start Set",
    isStartGo(value) && "Start Go",
  ]
    .filter(Boolean)
    .join(", ");
};

export const Flags = ({ value }: { value?: number }) => {
  const content = useMemo(() => {
    return value && flagsDescription(value);
  }, [value]);

  if (value === undefined) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>{`Session flags: ${value} (0x${value.toString(16)})`}</Text>
      <Text>{content}</Text>
    </View>
  );
};
