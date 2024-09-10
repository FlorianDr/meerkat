import { CollectCard } from "./pages/CollectCard.tsx";
import { QnA } from "./pages/QnA.tsx";
import { useRoutes } from "./hooks/use-routes.tsx";
import { Layout } from "./components/Layout/Layout.tsx";

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
    <Layout>
      {children}
    </Layout>
  );
}

export default App;
