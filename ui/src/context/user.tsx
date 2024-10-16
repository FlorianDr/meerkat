import { createContext, useState } from "react";
import { User } from "../types.ts";

export const UserContext = createContext<
  {
    user: User | undefined;
    setUser: (user: User | undefined) => void;
    isOnCooldown: boolean;
    setIsOnCooldown: (cooldown: boolean) => void;
  }
>({
  setUser: () => {},
  setIsOnCooldown: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [isOnCooldown, setIsOnCooldown] = useState<boolean>(false);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isOnCooldown,
        setIsOnCooldown,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
