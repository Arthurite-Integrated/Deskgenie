class DeskGenieSocket {
  public socket: WebSocket | null;

  constructor() {
    this.socket = null;
  }

  connect(url: string) {
    // Don't reconnect if already connected
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    console.log("🔌 Connecting to WebSocket...");
    this.socket = new WebSocket(url);
    this.setupListeners();
  }

  setupListeners() {
    if (!this.socket) return;

    this.socket.onopen = () => {
      console.log("✅ WebSocket Connected");
      // Request session immediately after connection
      this.requestSession();
    };

    this.socket.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        console.log("📨 Server data:", data);

        switch (data.type) {
          case "open":
            console.log("🎉", data.payload?.msg || data.msg);
            break;
          default:
            console.warn("❓ Unknown message type:", data.type);
            break;
        }
      } catch (error) {
        console.error("❌ Error parsing message:", error);
      }
    };

    this.socket.onclose = (event) => {
      console.log("👋 WebSocket disconnected:", event.code, event.reason);
      this.socket = null;
    };

    this.socket.onerror = (error) => {
      console.error("❌ WebSocket error:", error);
    };
  }

  // Remove the old listeners() method and replace with setupListeners()
  listeners() {
    // This method is now deprecated, use setupListeners() internally
    console.warn("⚠️ listeners() method is deprecated");
  }

  requestSession() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      console.log("🎫 Requesting session...");
      this.send({ action: "session" });
    } else {
      console.warn("⚠️ Cannot request session - WebSocket not ready");
    }
  }

  stringify(data: { action: string; sessionId?: string; payload?; msg?: string }) {
    return JSON.stringify(data);
  }

  parse(data: string) {
    return JSON.parse(data);
  }

  send(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(this.stringify(data));
    } else {
      console.warn("⚠️ Cannot send - WebSocket not ready");
    }
  }

  disconnect() {
    if (this.socket) {
      console.log("🔌 Disconnecting WebSocket...");
      this.socket.close();
    }
  }

  // Getter for connection status
  get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

export default new DeskGenieSocket();
