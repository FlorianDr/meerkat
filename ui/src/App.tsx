import { EventCard } from "./pages/EventCard.tsx";
import { QnA } from "./pages/QnA.tsx";
import { Remote } from "./pages/Remote.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/events/:uid/remote",
    element: <Remote />,
  },
  {
    path: "/events/:uid/qa",
    element: <QnA />,
  },
  {
    path: "/events/:uid/event-card",
    element: <EventCard />,
  },
]);

function App() {
  return <RouterProvider router={router} fallbackElement={<Loader />} />;
}

function Loader() {
  return <div>Loading...</div>;
}

export default App;
