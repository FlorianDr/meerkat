import { useContext, useState } from "react";
import { useZAPIConnect } from "../zapi/connect.ts";
import { UserContext } from "../context/user.tsx";
import { User } from "../types.ts";

export function useLogin() {
  const { setUser } = useContext(UserContext);
  const [isLoading, setLoading] = useState(false);
  const { connect } = useZAPIConnect();

  const login = async () => {
    try {
      setLoading(true);
      const zapi = await connect();
      const publicKey = await zapi.identity.getPublicKey();
      const user = await loginRequest(publicKey);
      setUser(user);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { login, isLoading };
}

async function loginRequest(publicKey: string) {
  const response = await fetch("/api/v1/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ publicKey }),
  });
  if (!response.ok) {
    throw new Error("Failed to login");
  }
  const { data: { user } } = await response.json();
  return user as User;
}
