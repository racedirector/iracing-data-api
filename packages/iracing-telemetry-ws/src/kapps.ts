import { TelemetryData } from "@iracing-data/telemetry-types";
import WebSocket from "ws";

interface ConnectionMessage {
  connected?: boolean;
  disconnected?: boolean;
  data?: TelemetryData;
}

interface CommandMessage {
  command: string;
  args: any[];
}

export class KappsTelemetrySocket {
  private ws: WebSocket | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private connected = false;
  private firstTimeConnect = true;
  public data: TelemetryData = {};

  constructor(
    private requestParams: string[] = [],
    private requestParamsOnce: string[] = [],
    private fps: number = 1,
    private server: string = "127.0.0.1:8182",
    private readIbt: boolean = false,
    private record: string | null = null,
    public onConnect?: () => void,
    public onDisconnect?: () => void,
    public onUpdate?: (keys: string[]) => void,
    public onWSConnect?: () => void,
    public onWSDisconnect?: () => void
  ) {
    if (this.record) {
      this.loadRecord();
    } else {
      this.connect();
    }
  }

  private connect() {
    this.ws = new WebSocket(`ws://${this.server}/ws`);
    this.ws.onopen = this.onopen.bind(this);
    this.ws.onmessage = this.onmessage.bind(this);
    this.ws.onclose = this.onclose.bind(this);
  }

  private onopen() {
    this.onWSConnect?.();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    Object.keys(this.data).forEach((k) => delete this.data[k]);

    this.ws?.send(
      JSON.stringify({
        fps: this.fps,
        readIbt: this.readIbt,
        requestParams: this.requestParams,
        requestParamsOnce: this.requestParamsOnce,
      })
    );
  }

  private onmessage(event: WebSocket.MessageEvent) {
    const rawData = event.data.toString().replace(/\bNaN\b/g, "null");
    const data: ConnectionMessage = JSON.parse(rawData);

    if (data.disconnected) {
      this.connected = false;
      this.onDisconnect?.();
    }

    if (data.connected) {
      Object.keys(this.data).forEach((k) => delete this.data[k]);
    }

    if (data.connected || (this.firstTimeConnect && !this.connected)) {
      this.firstTimeConnect = false;
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

  private onclose() {
    this.onWSDisconnect?.();
    if (this.ws) {
      this.ws.onopen = this.ws.onmessage = this.ws.onclose = null;
    }
    if (this.connected) {
      this.connected = false;
      this.onDisconnect?.();
    }
    this.reconnectTimeout = setTimeout(() => this.connect(), 2000);
  }

  public sendCommand(command: string, ...args: any[]) {
    const message: CommandMessage = { command, args };
    this.ws?.send(JSON.stringify(message));
  }

  private loadRecord() {
  //   const xhr = new XMLHttpRequest();
  //   xhr.onreadystatechange = () => {
  //     if (xhr.readyState === 4 && xhr.status === 200) {
  //       const data = JSON.parse(xhr.responseText);
  //       console.log(data); // You can adapt this as needed
  //     }
  //   };
  //   if (this.record) {
  //     xhr.open("GET", this.record, true);
  //     xhr.send();
  //   }
  // }
}
