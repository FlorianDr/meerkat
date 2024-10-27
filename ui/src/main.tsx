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
import { posthog } from "posthog-js";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "./context/supabase.tsx";

const config = await fetch("/api/v1/config").then((res) => res.json());

if (config.posthogToken) {
  posthog.init(config.posthogToken, {
    api_host: "https://eu.i.posthog.com",
    person_profiles: "identified_only",
  });
}

const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
);

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
  permissions: {
    REQUEST_PROOF: { collections: ["Devcon SEA"] },
    READ_PUBLIC_IDENTIFIERS: {},
  },
};

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SupabaseProvider client={supabase}>
      <ChakraProvider theme={theme}>
        <ZAPIProvider zapp={zapp} zupassUrl={config.zupassUrl}>
          <UserProvider>
            <App />
          </UserProvider>
        </ZAPIProvider>
      </ChakraProvider>
    </SupabaseProvider>
  </React.StrictMode>,
);
