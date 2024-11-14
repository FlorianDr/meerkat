import { EventCard } from "./pages/EventCard.tsx";
import { Login } from "./pages/Login.tsx";
import { QnA } from "./pages/QnA.tsx";
import { Remote } from "./pages/Remote.tsx";
import { Feedback } from "./pages/Feedback.tsx";
import { Speaker } from "./pages/Speaker.tsx";
import { Leaderboard } from "./pages/Leaderboard.tsx";
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
    path: "/e/:uid/feedback",
    element: <Feedback />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/speaker",
    element: <Speaker />,
  },
  {
    path: "/leaderboard",
    element: <Leaderboard />,
  },
]);

function App() {
  return <RouterProvider router={router} fallbackElement={<Loader />} />;
}

function Loader() {
  return <div>Loading...</div>;
}

export default App;
