import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import {
  ChakraProvider,
  extendTheme,
  withDefaultColorScheme,
} from "@chakra-ui/react";
import { ZAPIProvider } from "./zapi/context.tsx";
import { UserProvider } from "./context/user.tsx";
import { posthog } from "posthog-js";
import { createClient } from "@supabase/supabase-js";
import { SupabaseProvider } from "./context/supabase.tsx";
import * as Sentry from "@sentry/react";
import { initializeFaro } from "@grafana/faro-react";
import "./fingerprint.ts";

type Config = {
  zupassUrl: string;
  zappName: string;
  environment: string;
  posthogToken: string | undefined;
  supabaseUrl: string | undefined;
  supabaseAnonKey: string | undefined;
  sentryDSN: string | undefined;
  grafanaUrl: string | undefined;
};

const config: Config = await fetch("/api/v1/config").then((res) => res.json());

if (config.sentryDSN) {
  Sentry.init({
    dsn: config.sentryDSN,
    environment: config.environment,
  });
}

if (config.grafanaUrl) {
  initializeFaro({
    url: config.grafanaUrl,
    app: {
      name: "ui",
      environment: config.environment,
    },
  });
}

if (config.posthogToken) {
  posthog.init(config.posthogToken, {
    api_host: "https://eu.i.posthog.com",
    person_profiles: "identified_only",
  });
}

const supabase = createClient(
  config.supabaseUrl!,
  config.supabaseAnonKey!,
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
        },
      },
    },
  },
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <SupabaseProvider client={supabase}>
      <ChakraProvider theme={theme}>
        <ZAPIProvider
          zappName={config.zappName}
          zupassUrl={config.zupassUrl}
        >
          <UserProvider>
            <App />
          </UserProvider>
        </ZAPIProvider>
      </ChakraProvider>
    </SupabaseProvider>
  </React.StrictMode>,
);
