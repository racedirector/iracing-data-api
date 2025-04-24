import { Button, StyleProp, StyleSheet, View, ViewStyle } from "react-native";

interface PlayButtonProps {
  isPlaying: boolean;
  onPress?: () => void;
}

const PlayButton: React.FC<PlayButtonProps> = ({ isPlaying, onPress }) => (
  <Button title={isPlaying ? "Pause" : "Play"} onPress={onPress} />
);

export interface ReplayControlsProps
  extends Pick<PlayButtonProps, "isPlaying"> {
  controlsContainerStyle?: StyleProp<ViewStyle>;
  onPressPlay?: () => void;
  onPressRewind?: () => void;
  onPressFastForward?: () => void;
  onPressPreviousFrame?: () => void;
  onPressNextFrame?: () => void;
}

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  isPlaying,
  controlsContainerStyle,
  onPressPlay,
  onPressRewind,
  onPressFastForward,
  onPressPreviousFrame,
  onPressNextFrame,
}) => {
  return (
    <View style={styles.container}>
      <View style={[styles.controlsContainer, controlsContainerStyle]}>
        <Button title="Rewind" onPress={onPressRewind} />

        <Button title="Previous Frame" onPress={onPressPreviousFrame} />

        <PlayButton isPlaying={isPlaying} onPress={onPressPlay} />

        <Button title="Next Frame" onPress={onPressNextFrame} />

        <Button title="Fast Forward" onPress={onPressFastForward} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  controlsContainer: {
    flexDirection: "row",
  },
});

export default ReplayControls;
