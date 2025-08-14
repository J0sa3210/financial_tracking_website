import { useState, useEffect } from "react";
import { Avatar } from "../ui/avatar";
import { useAccount } from "../context/AccountContext";
import { FaAsterisk } from "react-icons/fa";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@radix-ui/react-select";
import { Account } from "@/assets/types/Account";

export default function AccountSelector() {
  const { activeAccount, selectAccount } = useAccount();

  const [accounts, setAccounts] = useState<Account[]>([]);

  async function fetchAccounts() {
    const resp = await fetch("http://localhost:8000/accounts/");
    const data = await resp.json();

    setAccounts(data);
  }
  useEffect(() => {
    fetchAccounts();
  }, []); // Fetch options only once when accounts are loaded or counterparts change

  return (
    <div>
      <Select onValueChange={selectAccount}>
        <SelectTrigger className='flex gap-3 items-center'>
          <span className='font-semibold'>{activeAccount?.name}</span>
          <Avatar className='bg-secondary text-secondary-foreground rounded-full items-center justify-center'>
            <FaAsterisk />
          </Avatar>
        </SelectTrigger>
        <SelectContent className='bg-white text-2xl text-foreground'>
          {accounts.map((account) => (
            <SelectItem
              key={account.id}
              value={account.id.toString()}>
              {account.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
