// AccountContext.jsx
import { Account } from "@/assets/types/Account";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const AccountContext = createContext<{
  activeAccount: Account | null;
  defaultAccount: Account | null;
  selectAccount: (account_id: string) => Promise<void>;
  selectDefaultAccount: (account_id: string) => Promise<void>;
}>({
  activeAccount: null,
  defaultAccount: null,
  selectAccount: async () => {},
  selectDefaultAccount: async () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [defaultAccount, setDefaultAccount] = useState<Account | null>(null);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("defaultAccount");
    if (stored) {
      const account = JSON.parse(stored);
      setDefaultAccount(account);
      setActiveAccount(account);
    }
  }, []);

  async function selectDefaultAccount(account_id: string) {
    try {
      const resp = await fetch("http://localhost:8000/accounts/" + account_id + "/");
      const data = await resp.json();
      setDefaultAccount(data);
      localStorage.setItem("defaultAccount", JSON.stringify(data));
    } catch (error: any) {
      console.error(error.detail);
      setDefaultAccount(null);
      localStorage.removeItem("defaultAccount");
    }
  }

  async function selectAccount(account_id: string) {
    try {
      // Get the account
      const resp = await fetch("http://localhost:8000/accounts/" + account_id + "/");
      const data = await resp.json();

      // Set it as new active account
      setActiveAccount(data);
    } catch (error: any) {
      console.error(error.detail);
      setActiveAccount(defaultAccount);
    }
  }

  return (
    <AccountContext.Provider value={{ activeAccount, defaultAccount, selectAccount, selectDefaultAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
