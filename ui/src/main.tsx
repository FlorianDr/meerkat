import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { ZAPIProvider } from "./zapi/context.tsx";
import { Zapp } from "@parcnet-js/app-connector";
import { UserProvider } from "./context/user.tsx";

const config = await fetch("/config").then((res) => res.json());

const theme = extendTheme(
  withDefaultColorScheme({ colorScheme: "purple" }),
  {
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    styles: {
      global: {
        body: {
          bg: "#0C021D",
          color: "#AFA5C0",
          // colors: {
          //   purple: "rgba(136, 116, 170, 1)",
          // },
        },
      },
    },
  },
);

const zapp: Zapp = {
  name: config.zappName,
};

const zupassUrl = config.zupassUrl;

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ZAPIProvider zapp={zapp} zupassUrl={zupassUrl}>
        <UserProvider>
          <App />
        </UserProvider>
      </ZAPIProvider>
    </ChakraProvider>
  </React.StrictMode>,
);
