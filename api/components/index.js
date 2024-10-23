const refreshModels = {
  question: "question",
  reaction: "reaction",
};

const HEART_ICON = `
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="#FF69B4"
    />
  </svg>
`;

function createReactionElement(icon) {
  const reactionElement = document.createElement("div");
  reactionElement.className = "reaction";
  reactionElement.style.right = `${Math.random() * 0.5 - 0.25}rem`;
  reactionElement.innerHTML = icon;

  return reactionElement;
}

class SturdyWebsocket {
  socket;
  heartbeatInterval;
  reconnectOnClose = true;
  onMessageCallbacks = [];
  onErrorCallbacks = [];
  awaitingPong = false;
  static PING_INTERVAL = 10_000;

  constructor(url) {
    this.url = url;
  }

  connect() {
    this.socket = new WebSocket(this.url);
    this.socket.addEventListener("open", this._onOpen.bind(this));
    this.socket.addEventListener("close", this._onClose.bind(this));
    this.socket.addEventListener("error", this._onError.bind(this));
    this.socket.addEventListener("message", this._onMessage.bind(this));
    this.reconnectOnClose = true;
  }

  close() {
    this.socket?.close();
    this.reconnectOnClose = false;
    this._onClose();
  }

  onMessage(handler) {
    this.onMessageCallbacks.push(handler);
  }

  onError(handler) {
    this.onErrorCallbacks.push(handler);
  }

  _onOpen() {
    this.heartbeatInterval = setInterval(() => {
      if (this.awaitingPong) {
        this.close();
        this.connect();
        return;
      }
      this.socket?.send("ping");
      this.awaitingPong = true;
    }, SturdyWebsocket.PING_INTERVAL);
  }

  _onError(e) {
    this.onErrorCallbacks.forEach((cb) => cb(e));
  }

  _onMessage(event) {
    if (event.data === "pong") {
      this.awaitingPong = false;
      return;
    }

    if (event.data === "ping") {
      this.socket?.send("pong");
      return;
    }

    this.onMessageCallbacks.forEach((cb) => cb(event.data));
  }

  _onClose() {
    clearInterval(this.heartbeatInterval);

    if (this.reconnectOnClose) {
      this.connect();
    }
  }
}

const url = new URL(globalThis.location.href);
const eventId = url.pathname.split("/").pop();

url.protocol = url.protocol.replace("http", "ws");
url.pathname = `/api/v1/events/${eventId}/live`;

const socket = new SturdyWebsocket(url);

socket.connect();

socket.onMessage((data) => {
  const parsedData = JSON.parse(data);
  if (parsedData.type === refreshModels.question) {
    console.info("Reloading page...");
    globalThis.location.reload();
  } else if (parsedData.type === refreshModels.reaction) {
    const reactionElement = createReactionElement(HEART_ICON);
    const parent = document.querySelector(".heart-icon-container");
    parent.appendChild(reactionElement);
  }
});

// Extra safety measure
setTimeout(() => {
  socket.close();
  globalThis.location.reload();
}, 60_000);
