import {
  ReloadTexturesRequest,
  CameraSwitchPositionRequest,
  CameraSwitchNumberRequest,
  CameraSetStateRequest,
  PitCommandRequest,
  CameraState as CameraStatePb,
  PitCommandMode as PitCommandModePb,
  ChatCommandMode as ChatCommandModePb,
  ChatCommandRequest,
  ForceFeedbackCommandMode as ForceFeedbackCommandModePb,
  ForceFeedbackCommandRequest,
  ReplayPositionMode as ReplayPositionModePb,
  ReplaySearchMode as ReplaySearchModePb,
  ReplaySearchRequest,
  ReplaySearchSessionTimeRequest,
  ReplaySetPlayPositionRequest,
  ReplaySetPlaySpeedRequest,
  ReplaySetStateRequest,
  ReplayStateMode as ReplayStateModePb,
  TelemetryCommandMode as TelemetryCommandModePb,
  TelemetryCommandRequest,
  VideoCaptureMode as VideoCaptureModePb,
  VideoCaptureRequest,
} from "./constants/iracing-proto/broadcast_pb";
import { BroadcastClient as BroadcastServiceClient } from "./constants/iracing-proto/BroadcastServiceClientPb";

type CameraState = Exclude<CameraStatePb, CameraStatePb.CAMERA_STATE_UNKNOWN>;
type PitCommandMode = Exclude<
  PitCommandModePb,
  PitCommandModePb.PIT_COMMAND_MODE_UNKNOWN
>;

type ReplayPositionMode = Exclude<
  ReplayPositionModePb,
  ReplayPositionModePb.REPLAY_POSITION_MODE_UNKNOWN
>;

type ReplaySearchMode = Exclude<
  ReplaySearchModePb,
  ReplaySearchModePb.REPLAY_SEARCH_MODE_UNKNOWN
>;

type ReplayStateMode = Exclude<
  ReplayStateModePb,
  ReplayStateModePb.REPLAY_STATE_MODE_UNKNOWN
>;

type ChatCommandMode = Exclude<
  ChatCommandModePb,
  ChatCommandModePb.CHAT_COMMAND_MODE_UNKNOWN
>;

type TelemetryCommandMode = Exclude<
  TelemetryCommandModePb,
  TelemetryCommandModePb.TELEMETRY_COMMAND_MODE_UNKNOWN
>;

type ForceFeedbackCommandMode = Exclude<
  ForceFeedbackCommandModePb,
  ForceFeedbackCommandModePb.FORCE_FEEDBACK_COMMAND_MODE_UNKNOWN
>;

type VideoCaptureMode = Exclude<
  VideoCaptureModePb,
  VideoCaptureModePb.VIDEO_CAPTURE_MODE_UNKNOWN
>;

export class BroadcastClient {
  private _client: BroadcastServiceClient;
  get client() {
    return this._client;
  }

  constructor(url: string) {
    console.log("Creating new broadcast client");
    this._client = new BroadcastServiceClient(url);
  }

  async reloadTextures(carIndex?: number) {
    const request = new ReloadTexturesRequest();

    if (carIndex) {
      request.setCarIdx(carIndex);
    }

    console.log("Reloading textures", carIndex, this.client);

    await this.client.reloadTextures(request);
  }

  async switchCameraPosition(position: number, group: number, camera: number) {
    const request = new CameraSwitchPositionRequest()
      .setPosition(position)
      .setGroup(group)
      .setCamera(camera);

    await this.client.cameraSwitchPosition(request, null);
  }

  async switchCameraNumber(number: string, group: number, camera: number) {
    const request = new CameraSwitchNumberRequest()
      .setCarNumber(number)
      .setGroup(group)
      .setCamera(camera);

    await this.client.cameraSwitchNumber(request, null);
  }

  async setCameraState(state: CameraState) {
    const request = new CameraSetStateRequest().setState(state);
    await this.client.cameraSetState(request, null);
  }

  async sendPitCommand(mode: PitCommandMode, value?: number) {
    const request = new PitCommandRequest().setMode(mode);

    if (value) {
      request.setValue(value);
    }

    await this.client.pitCommand(request, null);
  }

  async setPlaySpeed(speed: number, isSlowMotion?: boolean) {
    const request = new ReplaySetPlaySpeedRequest().setSpeed(speed);

    if (isSlowMotion) {
      request.setIsSlowMotion(isSlowMotion);
    }

    await this.client.replaySetPlaySpeed(request, null);
  }

  async setPlayPosition(mode: ReplayPositionMode, frame: number) {
    const request = new ReplaySetPlayPositionRequest()
      .setMode(mode)
      .setFrame(frame);

    await this.client.replaySetPlayPosition(request, null);
  }

  async searchReplay(mode: ReplaySearchMode) {
    const request = new ReplaySearchRequest().setMode(mode);

    await this.client.replaySearch(request, null);
  }

  async setReplayState(mode: ReplayStateMode) {
    const request = new ReplaySetStateRequest().setState(mode);

    await this.client.replaySetState(request, null);
  }

  async chatCommand(mode: ChatCommandMode, macro?: number) {
    const request = new ChatCommandRequest().setMode(mode);

    if (macro) {
      request.setMacro(macro);
    }

    await this.client.chatCommand(request, null);
  }

  async telemetryCommand(mode: TelemetryCommandMode) {
    const request = new TelemetryCommandRequest().setMode(mode);
    await this.client.telemetryCommand(request, null);
  }

  async ffbCommand(mode: ForceFeedbackCommandMode, value?: number) {
    const request = new ForceFeedbackCommandRequest().setMode(mode);

    if (value) {
      request.setValue(value);
    }

    await this.client.forceFeedbackCommand(request, null);
  }

  async replaySearchSessionTime(sessionNumber: number, sessionTimeMs: number) {
    const request = new ReplaySearchSessionTimeRequest()
      .setSessionNumber(sessionNumber)
      .setSessionTimeMs(sessionTimeMs);

    await this.client.replaySearchSessionTime(request, null);
  }

  async videoCaptureCommand(mode: VideoCaptureMode) {
    const request = new VideoCaptureRequest().setMode(mode);
    await this.client.videoCapture(request, null);
  }
}

export default BroadcastClient;
