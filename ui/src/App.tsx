import { CollectCard } from "./pages/CollectCard.tsx";
import { QnA } from "./pages/QnA.tsx";
import { type Routes, useRoutes } from "./hooks/use-routes.tsx";

const routeConfig: Routes = [
  {
    regex: /^\/events\/(?<uid>[^/]+)\/collect$/,
    component: CollectCard,
  },
  { regex: /^\/events\/(?<uid>[^/]+)\/qa$/, component: QnA },
];

function App() {
  return useRoutes(routeConfig);
}

export default App;
