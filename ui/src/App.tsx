import { CollectCard } from "./pages/CollectCard.tsx";
import { QnA } from "./pages/QnA.tsx";
import { useRoutes } from "./hooks/use-routes.tsx";

const routeConfig = [
  {
    regex: /^\/events\/(?<uid>[^/]+)\/collect$/,
    component: CollectCard,
  },
  { regex: /^\/events\/(?<uid>[^/]+)\/qa$/, component: QnA },
];

function App() {
  const children = useRoutes(routeConfig);

  return (
    <>
      {children}
    </>
  );
}

export default App;
