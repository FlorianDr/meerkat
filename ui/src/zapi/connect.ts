import { useContext, useEffect, useState } from "react";
import { ZAPIContext } from "./context.tsx";
import { type ParcnetAPI, type Zapp } from "@parcnet-js/app-connector";

export const useZAPIConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { context, setContext } = useContext(ZAPIContext);

  useEffect(() => {
    const effect = async () => {
      const { init } = await import("@parcnet-js/app-connector");
      if (!context.ref.current || !context.config.zupassUrl) {
        return;
      }

      init(context.ref.current, context.config.zupassUrl);
    };
    effect();
  }, [context.ref.current, context.config.zupassUrl]);

  const connectFn: (zapp: Zapp) => Promise<ParcnetAPI> = async (zapp) => {
    if (context.zapi || !context.ref.current) {
      return context.zapi;
    }

    const { connect } = await import("@parcnet-js/app-connector");

    setIsConnecting(true);

    let zapi;
    try {
      zapi = await connect(
        zapp,
        context.ref.current,
        context.config.zupassUrl,
      );
    } catch (error) {
      throw error;
    } finally {
      setIsConnecting(false);
    }

    setContext({
      ...context,
      zapi,
    });

    return zapi;
  };

  return {
    connect: connectFn,
    isConnected: !!context.zapi,
    isConnecting,
  };
};
