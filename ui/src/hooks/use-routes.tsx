import { useEffect, useState } from "react";
import { parseUid } from "../utils/route.ts";

const routes = (currentPath: string, routeConfig: RouteConfig[]) => {
  const matchedRoute = routeConfig.find((route) =>
    currentPath.match(route.regex)
  );

  if (matchedRoute) {
    const uid = parseUid(new URL(window.location.href), matchedRoute.regex);
    return uid ? <matchedRoute.component uid={uid} /> : <div>404</div>;
  }

  return <div>404</div>;
};

interface RouteConfig {
  regex: RegExp;
  component: React.FC<{ uid: string }>;
}

export function useRoutes(routeConfig: RouteConfig[]) {
  const [currentPath, setCurrentPath] = useState(globalThis.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(globalThis.location.pathname);
    };

    globalThis.addEventListener("popstate", onLocationChange);

    return () => globalThis.removeEventListener("popstate", onLocationChange);
  }, []);

  return routes(currentPath, routeConfig);
}
