import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { UserContext } from "../context/user.tsx";
import { User } from "../types.ts";
import { POD } from "@pcd/pod";
import { HTTPError } from "./http-error.ts";
import { posthog } from "posthog-js";
import { PODEntries } from "@pcd/pod";
import { useZAPI } from "../zapi/context.tsx";
import { constructLoginZapp } from "../zapi/zapps.ts";

export type UseLoginProps = {
  onError?: (error: Error) => void;
};

export function useLogin(props?: UseLoginProps) {
  const { setUser } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();
  const { config } = useZAPI();

  const login = async () => {
    let user: User | undefined;
    try {
      setLoading(true);
      const zapi = await connect(constructLoginZapp(config.zappName));
      const nonce = crypto.randomUUID();
      const podEntries = constructLoginPodEntries(nonce);
      const podData = await zapi.pod.sign(podEntries);

      const pod = POD.load(
        podData.entries,
        podData.signature,
        podData.signerPublicKey,
      );

      user = await loginRequest(pod);

      setUser(user);
      posthog.capture("user_logged_in");
    } catch (error) {
      props?.onError?.(error as Error);
      throw error;
    } finally {
      setLoading(false);
    }
    return { user };
  };

  return { login, isLoading };
}

function constructLoginPodEntries(nonce: string): PODEntries {
  return {
    time: {
      type: "date",
      value: new Date(),
    },
    nonce: {
      type: "string",
      value: nonce,
    },
  };
}

async function loginRequest(pod: POD) {
  const res = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pod: pod.toJSON() }),
  });

  if (!res.ok) {
    throw new HTTPError(res);
  }

  const { data: { user } } = await res.json();
  return user;
}
