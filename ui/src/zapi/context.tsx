import { createContext, useContext, useRef, useState } from "react";
import { type ParcnetAPI, type Zapp } from "@parcnet-js/app-connector";

export type ZAPIProviderProps = {
  children: React.ReactNode;
  zappName: string;
  zupassUrl?: string | undefined;
};

export type ZAPIContext = {
  ref: React.MutableRefObject<HTMLElement | null>;
  config: {
    zappName: string;
    zupassUrl?: string | undefined;
  };
  zapp: Zapp | null;
  zapi: ParcnetAPI | null;
};

export const ZAPIContext = createContext<ZAPIContext>(null);

export function ZAPIProvider({
  children,
  zappName,
  zupassUrl,
}: ZAPIProviderProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [context, setContext] = useState<ZAPIContext>({
    ref,
    config: {
      zappName,
      zupassUrl,
    },
    zapp: null,
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

export function useZAPI(): ZAPIContext {
  const { context } = useContext(ZAPIContext);
  return context;
}
