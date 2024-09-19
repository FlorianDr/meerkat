const url = new URL(globalThis.location.href);

url.protocol = url.protocol.replace("http", "ws");
url.pathname = `/api/v1${url.pathname}/live`;

const socket = new WebSocket(url);

const refreshModels = ["question"];

socket.onmessage = (event) => {
  if (refreshModels.includes(event.type)) {
    console.info("Reloading page...");
    globalThis.location.reload();
  }
};
