import { EventCard } from "./pages/EventCard.tsx";
import { Login } from "./pages/Login.tsx";
import { QnA } from "./pages/QnA.tsx";
import { Remote } from "./pages/Remote.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/e/:uid/remote",
    element: <Remote />,
  },
  {
    path: "/e/:uid/qa",
    element: <QnA />,
  },
  {
    path: "/e/:uid/card",
    element: <EventCard />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

function App() {
  return <RouterProvider router={router} fallbackElement={<Loader />} />;
}

function Loader() {
  return <div>Loading...</div>;
}

export default App;
