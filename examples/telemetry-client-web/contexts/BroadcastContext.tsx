import React, {
  createContext,
  useContext,
  useMemo,
  useRef,
  PropsWithChildren,
} from "react";
import { BroadcastClient } from "@iracing-data/grpc-web";
import { noop } from "lodash";

const asyncNoop = async () => noop();

export interface BroadcastContextType {
  reloadTextures: typeof BroadcastClient.prototype.reloadTextures;
  switchCameraPosition: typeof BroadcastClient.prototype.switchCameraPosition;
  switchCameraNumber: typeof BroadcastClient.prototype.switchCameraNumber;
  sendPitCommand: typeof BroadcastClient.prototype.sendPitCommand;
  setPlaySpeed: typeof BroadcastClient.prototype.setPlaySpeed;
  setPlayPosition: typeof BroadcastClient.prototype.setPlayPosition;
  searchReplay: typeof BroadcastClient.prototype.searchReplay;
  setReplayState: typeof BroadcastClient.prototype.setReplayState;
  chatCommand: typeof BroadcastClient.prototype.chatCommand;
  telemetryCommand: typeof BroadcastClient.prototype.telemetryCommand;
  ffbCommand: typeof BroadcastClient.prototype.ffbCommand;
  replaySearchSessionTime: typeof BroadcastClient.prototype.replaySearchSessionTime;
  videoCaptureCommand: typeof BroadcastClient.prototype.videoCaptureCommand;
}

const DEFAULT_CONTEXT: BroadcastContextType = {
  reloadTextures: asyncNoop,
  switchCameraPosition: asyncNoop,
  switchCameraNumber: asyncNoop,
  sendPitCommand: asyncNoop,
  setPlaySpeed: asyncNoop,
  setPlayPosition: asyncNoop,
  searchReplay: asyncNoop,
  setReplayState: asyncNoop,
  chatCommand: asyncNoop,
  telemetryCommand: asyncNoop,
  ffbCommand: asyncNoop,
  replaySearchSessionTime: asyncNoop,
  videoCaptureCommand: asyncNoop,
};

const BroadcastContext = createContext<BroadcastContextType>(DEFAULT_CONTEXT);

export const Consumer = BroadcastContext.Consumer;

export interface ProviderProps {
  host?: string;
}

export const Provider: React.FC<PropsWithChildren<ProviderProps>> = ({
  host = "http://localhost:8080",
  children = null,
}) => {
  const broadcastClient = useRef(new BroadcastClient(host));

  const broadcastContext: BroadcastContextType = useMemo(
    () => ({
      reloadTextures: broadcastClient.current.reloadTextures.bind(
        broadcastClient.current
      ),
      switchCameraPosition: broadcastClient.current.switchCameraPosition.bind(
        broadcastClient.current
      ),
      switchCameraNumber: broadcastClient.current.switchCameraNumber.bind(
        broadcastClient.current
      ),
      setCameraState: broadcastClient.current.setCameraState.bind(
        broadcastClient.current
      ),
      sendPitCommand: broadcastClient.current.sendPitCommand.bind(
        broadcastClient.current
      ),
      setPlaySpeed: broadcastClient.current.setPlaySpeed.bind(
        broadcastClient.current
      ),
      setPlayPosition: broadcastClient.current.setPlayPosition.bind(
        broadcastClient.current
      ),
      searchReplay: broadcastClient.current.searchReplay.bind(
        broadcastClient.current
      ),
      setReplayState: broadcastClient.current.setReplayState.bind(
        broadcastClient.current
      ),
      chatCommand: broadcastClient.current.chatCommand.bind(
        broadcastClient.current
      ),
      telemetryCommand: broadcastClient.current.telemetryCommand.bind(
        broadcastClient.current
      ),
      ffbCommand: broadcastClient.current.ffbCommand.bind(
        broadcastClient.current
      ),
      replaySearchSessionTime:
        broadcastClient.current.replaySearchSessionTime.bind(
          broadcastClient.current
        ),
      videoCaptureCommand: broadcastClient.current.videoCaptureCommand.bind(
        broadcastClient.current
      ),
    }),
    []
  );

  return (
    <BroadcastContext.Provider value={broadcastContext}>
      {children}
    </BroadcastContext.Provider>
  );
};

export const useBroadcastContext = () => {
  const context = useContext(BroadcastContext);
  if (context === undefined) {
    throw new Error(
      "useBroadcastContext must be used within a BroadcastProvider"
    );
  }
  return context;
};
