import { Account } from "@/assets/types/Account";
import { useAccount } from "@/components/context/AccountContext";
import { Button } from "@/components/ui/button";

import CreateAccountDialog from "@/components/upload_data_handler/create_account_dialog";
import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function AccountSubmenu() {
  const [accounts, setAccounts] = useState<Account[]>([]);

  const { defaultAccount, selectDefaultAccount } = useAccount();
  // There is no built-in Intl formatter for IBAN numbers.
  // You can format IBANs by grouping them for readability.
  function formatIBAN(iban: string): string {
    return iban.replace(/(.{4})/g, "$1 ").trim();
  }

  async function fetchAccounts() {
    const resp = await fetch("http://localhost:8000/accounts/");
    const data = await resp.json();

    setAccounts(data);
  }
  useEffect(() => {
    fetchAccounts();
  }, []); // Fetch options only once when accounts are loaded or counterparts change

  const deleteAccount = async (account_id: number) => {
    try {
      await fetch("http://localhost:8000/accounts/" + account_id, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account");
    } finally {
      fetchAccounts(); // Refresh the accounts after deletion}
    }
  };

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Account Settings</h2>
        <span className='flex gap-1'>
          <CreateAccountDialog onCreate={fetchAccounts}></CreateAccountDialog>
        </span>
      </div>
      {accounts.map((account) => (
        <div
          key={account.id}
          className='mb-4 p-2 border  rounded-lg'>
          <span className='flex gap-1 justify-between items-center'>
            <h3 className='text-xl font-semibold'>{account.name}</h3>
            <span className='flex gap-1'>
              <Button
                className='bg-red-500 text-white hover:bg-white hover:text-red-500 hover:border hover:border-red-500'
                onClick={() => deleteAccount(account.id)}>
                <FaTrash />
              </Button>
            </span>
          </span>

          <p>
            <b>Account number: </b>
            {formatIBAN(account.iban)}
          </p>
          <Button
            size='sm'
            className='text-lg'
            variant='outline'
            disabled={account.id === defaultAccount?.id}
            onClick={() => selectDefaultAccount(account.id.toString())}>
            Set default
          </Button>
        </div>
      ))}
    </div>
  );
}
