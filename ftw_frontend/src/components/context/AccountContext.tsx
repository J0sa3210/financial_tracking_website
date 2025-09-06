// AccountContext.jsx
import { Account } from "@/assets/types/Account";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const AccountContext = createContext<{
  activeAccount: Account | null;
  defaultAccount: Account | null;
  selectActiveAccount: (account_id: string) => Promise<void>;
  selectDefaultAccount: (account_id: string) => Promise<void>;
}>({
  activeAccount: null,
  defaultAccount: null,
  selectActiveAccount: async () => {},
  selectDefaultAccount: async () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [defaultAccount, setDefaultAccount] = useState<Account | null>(null);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  async function retrieveDefaultAccount() {
    const stored = localStorage.getItem("defaultAccount");
    if (stored) {
      try {
        const account = JSON.parse(stored);
        const resp = await fetch("http://localhost:8000/account/" + account.id);
        const data = await resp.json();

        if (data === null) {
          setDefaultAccount(null);
          setActiveAccount(null);
        }
        setDefaultAccount(data);
        setActiveAccount(data);
        console.log("Default and Active account set to", data);
      } catch (error: any) {
        console.log(error.detail);
        setDefaultAccount(null);
        setActiveAccount(null);
      }
    }
  }

  useEffect(() => {
    if (!activeAccount) {
      retrieveDefaultAccount();
    }
  }, []);

  async function selectDefaultAccount(account_id: string) {
    try {
      const resp = await fetch("http://localhost:8000/account/" + account_id);
      const data = await resp.json();
      setDefaultAccount(data);
      localStorage.setItem("defaultAccount", JSON.stringify(data));
    } catch (error: any) {
      console.error(error.detail);
      setDefaultAccount(null);
      localStorage.removeItem("defaultAccount");
    }
  }

  async function selectActiveAccount(account_id: string) {
    try {
      // Get the account
      const resp = await fetch("http://localhost:8000/account/" + account_id);
      const data = await resp.json();

      // Set it as new active account
      setActiveAccount(data);
      console.log("Active accoutn set to", data);
    } catch (error: any) {
      console.error(error.detail);
      setActiveAccount(defaultAccount);
    }
  }

  return (
    <AccountContext.Provider value={{ activeAccount, defaultAccount, selectActiveAccount, selectDefaultAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
