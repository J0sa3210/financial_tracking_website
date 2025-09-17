// AccountContext.jsx
import { Account } from "@/assets/types/Account";
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const AccountContext = createContext<{
  activeAccount: Account | null;
  defaultAccountId: number | null;
  selectActiveAccount: (account_id: string) => Promise<void>;
  setDefaultAccount: (account_id: string) => Promise<void>;
}>({
  activeAccount: null,
  defaultAccountId: null,
  selectActiveAccount: async () => {},
  setDefaultAccount: async () => {},
});

export function AccountProvider({ children }: { children: ReactNode }) {
  const [defaultAccountId, setDefaultAccountId] = useState<number | null>(null);
  const [activeAccount, setActiveAccount] = useState<Account | null>(null);

  useEffect(() => {
    // Check for an active account in local storage
    try {
      const storedActiveAccountId = localStorage.getItem("activeAccountId");
      if (storedActiveAccountId) {
        // Fetch account by ID and set as active
        loadAccount(storedActiveAccountId);
      } else {
        // If no active account, retrieve the default account
        retrieveDefaultAccount();
      }
    } catch (error) {
      console.error("Error retrieving active account from local storage:", error);
      // If the account does not exist anymore, remove it and use default account
      retrieveDefaultAccount();
    }
  }, []);

  async function loadAccount(account_id: string) {
    const resp = await fetch("http://localhost:8000/account/" + account_id);
    const data = await resp.json();
    setActiveAccount(data);
    localStorage.setItem("activeAccountId", data.id.toString());
    console.log("Active account set to", data);
  }

  async function retrieveDefaultAccount() {
    const storedDefaultAccountId = localStorage.getItem("defaultAccountId");
    if (storedDefaultAccountId) {
      try {
        loadAccount(storedDefaultAccountId);
        setDefaultAccountId(parseInt(storedDefaultAccountId));
      } catch (error) {
        console.error("Could not retrieve default account.");
        getAllAccounts().then((accounts) => {
          if (accounts.length > 0) {
            setActiveAccount(accounts[0]);
            setDefaultAccountId(accounts[0].id);
            localStorage.setItem("defaultAccountId", accounts[0].id.toString());
            localStorage.setItem("activeAccountId", accounts[0].id.toString());
          }
        });
      }
    }
  }

  async function setDefaultAccount(account_id: string) {
    try {
      const resp = await fetch("http://localhost:8000/account/" + account_id);
      const data = await resp.json();
      setDefaultAccountId(data.id);
      localStorage.setItem("defaultAccountId", JSON.stringify(data));
    } catch (error: any) {
      console.error(error.detail);
    }
  }

  async function selectActiveAccount(account_id: string) {
    loadAccount(account_id);
  }

  async function getAllAccounts(): Promise<Account[]> {
    try {
      const resp = await fetch("http://localhost:8000/account/");
      const data = await resp.json();
      return data;
    } catch (error: any) {
      console.error(error.detail);
      return Promise.resolve([]);
    }
  }

  return (
    <AccountContext.Provider value={{ activeAccount, defaultAccountId, selectActiveAccount, setDefaultAccount }}>
      {children}
    </AccountContext.Provider>
  );
}

export function useAccount() {
  return useContext(AccountContext);
}
