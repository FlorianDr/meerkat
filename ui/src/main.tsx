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
import { uuidv7 } from "uuidv7";

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

// Check if cookie exists
function getCookie(name: string) {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName.trim() === name) {
      return cookieValue;
    }
  }
  return null;
}

const cookieName = "deviceId";
// Set cookie if it doesn't exist
if (!getCookie(cookieName)) {
  document.cookie = `deviceId=${uuidv7()}; expires=${
    new Date(Date.now() + 86400000).toUTCString()
  }; path=/`;
}

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
