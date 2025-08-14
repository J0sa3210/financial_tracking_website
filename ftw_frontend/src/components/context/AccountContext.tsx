// AccountContext.jsx
import { Account } from "@/assets/types/Account";
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const AccountContext = createContext<{
  activeAccount: Account | null;
  selectAccount: (account_id: string) => Promise<void>;
}>({
  activeAccount: null,
  selectAccount: async () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  async function selectAccount(account_id: string) {
    try {
      // Get the account
      const resp = await fetch("http://localhost:8000/accounts/" + account_id + "/");
      const data = await resp.json();

      // Set it as new active account
      setActiveAccount(data);
    } catch (error: any) {
      console.error(error.detail);
      setActiveAccount(null);
    }
  }

  return <AccountContext.Provider value={{ activeAccount, selectAccount }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}
