import { createContext, useContext, useRef, useState } from "react";
import { type ParcnetAPI, type Zapp } from "@parcnet-js/app-connector";

export type ZAPIProviderProps = {
  children: React.ReactNode;
  zapp: Zapp;
  zupassUrl?: string | undefined;
};

export type ZAPIContext = {
  ref: React.MutableRefObject<HTMLElement | null>;
  config: {
    zapp: Zapp;
    zupassUrl?: string | undefined;
  };
  zapi: ParcnetAPI | null;
};

export const ZAPIContext = createContext<ZAPIContext>(null);

export function ZAPIProvider({ children, zapp, zupassUrl }: ZAPIProviderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [context, setContext] = useState<ZAPIContext>({
    ref,
    config: {
      zapp,
      zupassUrl,
    },
    zapi: null,
  });

  return (
    <>
      <div ref={ref} />
      <ZAPIContext.Provider value={{ context, setContext }}>
        {children}
      </ZAPIContext.Provider>
    </>
  );
}

export function useZAPI() {
  const { context } = useContext(ZAPIContext);
  return context;
}
