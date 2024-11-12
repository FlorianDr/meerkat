import { useContext, useEffect, useState } from "react";
import { connect, init } from "@parcnet-js/app-connector";
import { ZAPIContext } from "./context.tsx";

export const useZAPIConnect = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const { context, setContext } = useContext(ZAPIContext);

  useEffect(() => {
    if (!context.ref.current || !context.config.zupassUrl) {
      return;
    }

    init(context.ref.current, context.config.zupassUrl);
  }, [context.ref.current, context.config.zupassUrl]);

  const connectFn = async () => {
    if (context.zapi || !context.ref.current) {
      return context.zapi;
    }

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
    isConnected: context.zapi !== null,
    isConnecting,
  };
};
