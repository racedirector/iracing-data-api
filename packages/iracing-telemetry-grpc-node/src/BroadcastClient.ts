import * as grpc from "@grpc/grpc-js";
import { iracing } from "./constants/iracing-proto/broadcast";

export class BroadcastClient {
  private _client: iracing.broadcast.BroadcastClient;
  get client() {
    return this._client;
  }

  constructor(url: string) {
    this._client = new iracing.broadcast.BroadcastClient(
      url,
      grpc.credentials.createInsecure()
    );
  }

  async reloadTextures(carIndex?: number) {
    const request = new iracing.broadcast.ReloadTexturesRequest({
      car_idx: carIndex,
    });

    await this.client.ReloadTextures(request);
  }

  async switchCameraPosition(position: number, group: number, camera: number) {
    const request = new iracing.broadcast.CameraSwitchPositionRequest({
      position,
      group,
      camera,
    });

    await this.client.CameraSwitchPosition(request);
  }

  async switchCameraNumber(number: string, group: number, camera: number) {
    const request = new iracing.broadcast.CameraSwitchNumberRequest({
      car_number: number,
      group,
      camera,
    });

    await this.client.CameraSwitchNumber(request);
  }

  async setCameraState(
    state: Exclude<
      iracing.broadcast.CameraState,
      iracing.broadcast.CameraState.CAMERA_STATE_UNKNOWN
    >
  ) {
    const request = new iracing.broadcast.CameraSetStateRequest({
      state,
    });
    await this.client.CameraSetState(request);
  }

  async sendPitCommand(
    mode: Exclude<
      iracing.broadcast.PitCommandMode,
      iracing.broadcast.PitCommandMode.PIT_COMMAND_MODE_UNKNOWN
    >,
    value?: number
  ) {
    const request = new iracing.broadcast.PitCommandRequest({
      mode,
      value,
    });

    await this.client.PitCommand(request);
  }

  async setPlaySpeed(speed: number, isSlowMotion?: boolean) {
    const request = new iracing.broadcast.ReplaySetPlaySpeedRequest({
      speed,
      is_slow_motion: isSlowMotion,
    });

    await this.client.ReplaySetPlaySpeed(request);
  }

  async setPlayPosition(
    mode: Exclude<
      iracing.broadcast.ReplayPositionMode,
      iracing.broadcast.ReplayPositionMode.REPLAY_POSITION_MODE_UNKNOWN
    >,
    frame: number
  ) {
    const request = new iracing.broadcast.ReplaySetPlayPositionRequest({
      mode,
      frame,
    });

    await this.client.ReplaySetPlayPosition(request);
  }

  async searchReplay(
    mode: Exclude<
      iracing.broadcast.ReplaySearchMode,
      iracing.broadcast.ReplaySearchMode.REPLAY_SEARCH_MODE_UNKNOWN
    >
  ) {
    const request = new iracing.broadcast.ReplaySearchRequest({
      mode,
    });

    await this.client.ReplaySearch(request);
  }

  async setReplayState(
    mode: Exclude<
      iracing.broadcast.ReplayStateMode,
      iracing.broadcast.ReplayStateMode.REPLAY_STATE_MODE_UNKNOWN
    >
  ) {
    const request = new iracing.broadcast.ReplaySetStateRequest({
      state: mode,
    });

    await this.client.ReplaySetState(request);
  }

  async chatCommand(
    mode: Exclude<
      iracing.broadcast.ChatCommandMode,
      iracing.broadcast.ChatCommandMode.CHAT_COMMAND_MODE_UNKNOWN
    >,
    macro?: number
  ) {
    const request = new iracing.broadcast.ChatCommandRequest({
      mode,
      macro,
    });

    await this.client.ChatCommand(request);
  }

  async telemetryCommand(
    mode: Exclude<
      iracing.broadcast.TelemetryCommandMode,
      iracing.broadcast.TelemetryCommandMode.TELEMETRY_COMMAND_MODE_UNKNOWN
    >
  ) {
    const request = new iracing.broadcast.TelemetryCommandRequest({ mode });
    await this.client.TelemetryCommand(request);
  }

  async ffbCommand(
    mode: Exclude<
      iracing.broadcast.ForceFeedbackCommandMode,
      iracing.broadcast.ForceFeedbackCommandMode.FORCE_FEEDBACK_COMMAND_MODE_UNKNOWN
    >,
    value?: number
  ) {
    const request = new iracing.broadcast.ForceFeedbackCommandRequest({
      mode,
      value,
    });

    await this.client.ForceFeedbackCommand(request);
  }

  async replaySearchSessionTime(sessionNumber: number, sessionTimeMs: number) {
    const request = new iracing.broadcast.ReplaySearchSessionTimeRequest({
      session_number: sessionNumber,
      session_time_ms: sessionTimeMs,
    });

    await this.client.ReplaySearchSessionTime(request);
  }

  async videoCaptureCommand(
    mode: Exclude<
      iracing.broadcast.VideoCaptureMode,
      iracing.broadcast.VideoCaptureMode.VIDEO_CAPTURE_MODE_UNKNOWN
    >
  ) {
    const request = new iracing.broadcast.VideoCaptureRequest({ mode });
    await this.client.VideoCapture(request);
  }
}

export default BroadcastClient;
