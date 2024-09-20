import { createContext, useState } from "react";
import { User } from "../types.ts";

export const UserContext = createContext<
  { user: User | undefined; setUser: (user: User | undefined) => void }
>({
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | undefined>(undefined);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
