import { CollectCard } from "./pages/CollectCard.tsx";
import { QnA } from "./pages/QnA.tsx";
import { useEffect, useState } from "react";
import { parseUid } from "./route.ts";

const routes = (currentPath: string) => {
  const routeConfig = [
    {
      regex: /^\/events\/(?<uid>[^/]+)\/qa\/collect$/,
      component: CollectCard,
    },
    { regex: /^\/events\/(?<uid>[^/]+)\/qa$/, component: QnA },
  ];

  const matchedRoute = routeConfig.find((route) =>
    currentPath.match(route.regex)
  );

  if (matchedRoute) {
    const uid = parseUid(new URL(window.location.href), matchedRoute.regex);
    return uid ? <matchedRoute.component uid={uid} /> : <div>404</div>;
  }

  return <div>404</div>;
};

function App() {
  const [currentPath, setCurrentPath] = useState(globalThis.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(globalThis.location.pathname);
    };

    globalThis.addEventListener("popstate", onLocationChange);

    return () => globalThis.removeEventListener("popstate", onLocationChange);
  }, []);

  const children = routes(currentPath);

  return (
    <>
      {children}
    </>
  );
}

export default App;
