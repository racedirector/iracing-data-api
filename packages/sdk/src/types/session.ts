import type {
  SessionData,
  SessionResultsPosition,
  SessionInfo as SdkSessionInfo,
  Driver as SdkDriver,
} from "@irsdk-node/types";

export type Session = SessionData & {
  QualifyResultsInfo?: { Results: SessionResultsPosition[] };
};

export type SessionInfo = SdkSessionInfo;
export type SessionResults = SessionResultsPosition;
export type Driver = SdkDriver;
