import { useContext, useEffect, useState } from "react";
import { ZAPIContext } from "./context.tsx";

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

  const connectFn = async () => {
    if (context.zapi || !context.ref.current) {
      return context.zapi;
    }

    const { connect } = await import("@parcnet-js/app-connector");

    setIsConnecting(true);

    let zapi;
    try {
      zapi = await connect(
        context.config.zapp,
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
