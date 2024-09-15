import { useEffect, useState } from "react";
import { parseUid } from "../utils/route.ts";

export type Route = {
  regex: RegExp;
  component: React.FC<{ uid: string }>;
};

export type Routes = Route[];

const NotFound = () => <div>404</div>;

const matchRoute = (currentPath: string, routes: Routes) => {
  const matchedRoute = routes.find((route) => currentPath.match(route.regex));

  if (matchedRoute) {
    const uid = parseUid(new URL(window.location.href), matchedRoute.regex);
    return uid ? <matchedRoute.component uid={uid} /> : <NotFound />;
  }

  return <NotFound />;
};

export function useRoutes(routes: Routes) {
  const [currentPath, setCurrentPath] = useState(globalThis.location.pathname);

  useEffect(() => {
    const onLocationChange = () => {
      setCurrentPath(globalThis.location.pathname);
    };

    globalThis.addEventListener("popstate", onLocationChange);

    return () => globalThis.removeEventListener("popstate", onLocationChange);
  }, []);

  return matchRoute(currentPath, routes);
}

export const useNavigate = (path: string) => {
  const navigate = () => {
    globalThis.history.pushState({}, "", path);
    globalThis.dispatchEvent(new globalThis.Event("popstate"));
  };

  return navigate;
};
