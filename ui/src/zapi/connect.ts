import { useContext } from "react";
import { connect } from "@parcnet-js/app-connector";
import { ZAPIContext } from "./context.tsx";

export const useZAPIConnect = () => {
  const { context, setContext } = useContext(ZAPIContext);

  const connectFn = async () => {
    if (context.zapi || !context.ref.current) {
      return context.zapi;
    }

    const zapi = await connect(
      context.config.zapp,
      context.ref.current,
      context.config.zupassUrl,
    );

    setContext({
      ...context,
      zapi,
    });

    return zapi;
  };

  return {
    connect: connectFn,
    isConnected: context.zapi !== null,
  };
};
