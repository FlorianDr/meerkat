import { QnA } from "./pages/QnA.tsx";
import { parseUid } from "./utils/route.ts";

function App() {
  const uid = parseUid(
    new URL(window.location.href),
    /^\/events\/(?<uid>[^/]+)\/qa$/,
  );

  if (!uid) {
    return <NotFound />;
  }

  return <QnA uid={uid} />;
}

const NotFound = () => <div>404 Not Found</div>;

export default App;
