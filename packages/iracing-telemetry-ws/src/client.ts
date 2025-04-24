import { TelemetryData, TelemetryKey } from "@iracing-data/telemetry-types";
import WebSocket from "ws";

export class IRacingTelemetrySocket {
  private socket: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connected = false;
  private firstConnect = true;
  public data: TelemetryData = {};

  constructor(
    private readonly url: string,
    readonly fps: number,
    readonly keys: TelemetryKey[],
    private readonly retryMs: number = 2000,
    public onWSConnect?: () => void,
    public onWSDisconnect?: () => void,
    public onConnect?: () => void,
    public onDisconnect?: () => void,
    public onUpdate?: (keys: string[]) => void
  ) {
    this.connect();
  }

  private connect() {
    this.socket = new WebSocket(`ws://${this.url}/ws/telemetry`);
    this.socket.onmessage = this.onmessage.bind(this);
    this.socket.onopen = this.onopen.bind(this);
    this.socket.onclose = this.onclose.bind(this);
  }

  private onopen() {
    this.onWSConnect?.();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    Object.keys(this.data).forEach((k) => delete this.data[k]);

    this.socket?.send(
      JSON.stringify({
        fps: this.fps,
        keys: this.keys,
      })
    );
  }

  private onclose() {
    this.onWSDisconnect?.();
    if (this.socket) {
      this.socket.onopen = this.socket.onmessage = this.socket.onclose = null;
    }
    if (this.connected) {
      this.connected = false;
      this.onDisconnect?.();
    }
    this.reconnectTimeout = setTimeout(() => this.connect(), this.retryMs);
  }

  private onmessage(event: WebSocket.MessageEvent) {
    const rawData = event.data.toString().replace(/\bNaN\b/g, "null");
    const data = JSON.parse(rawData);

    if (data.disconnected) {
      this.connected = false;
      this.onDisconnect?.();
    }

    if (data.connected) {
      Object.keys(this.data).forEach((k) => delete this.data[k]);
    }

    if (data.connected || (this.firstConnect && !this.connected)) {
      this.firstConnect = false;
      this.connected = true;
      this.onConnect?.();
    }

    if (data.data) {
      const keys = Object.keys(data.data);
      Object.entries(data.data).forEach(([k, v]) => {
        this.data[k] = v;
      });
      this.onUpdate?.(keys);
    }
  }
}

export default IRacingTelemetrySocket;
