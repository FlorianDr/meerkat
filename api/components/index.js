const url = new URL(globalThis.location.href);

url.protocol = url.protocol.replace("http", "ws");
url.pathname = `/api/v1${url.pathname}/live`;

const socket = new WebSocket(url);

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

socket.onmessage = (event) => {
  const parsedData = JSON.parse(event.data);
  if (parsedData.type === refreshModels.question) {
    console.info("Reloading page...");
    globalThis.location.reload();
  } else if (parsedData.type === refreshModels.reaction) {
    const reactionElement = createReactionElement(HEART_ICON);
    const parent = document.querySelector(".heart-icon-container");
    parent.appendChild(reactionElement);
  }
};
