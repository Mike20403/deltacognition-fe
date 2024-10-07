export class WebsocketClient {
  private url: string;
  private websocket: WebSocket | null;
  constructor(url: string) {
    this.url = url;
    this.websocket = null;
  }
  get websocketInstance() {
    return this.websocket;
  }
  onOpen = (callback: () => void) => {
    this.websocket?.addEventListener('open', callback);
  };
  connect = () => {
    this.websocket = new WebSocket(this.url);
    console.log('Connecting to websocket server...');
  };
  onConnect = (callback: () => void) => {
    this.websocket?.addEventListener('open', callback);
  };
  onMessage = (callback: (data: any) => void) => {
    this.websocket?.addEventListener('message', (event) => {
      callback(JSON.parse(event.data));
    });
  };
  onClose = (callback: (event: CloseEvent) => void) => {
    this.websocket?.addEventListener('close', callback);
  };
  close = () => {
    this.websocket?.close();
  };
  send = (data: any) => {
    this.websocket?.send(JSON.stringify(data));
  };
}
