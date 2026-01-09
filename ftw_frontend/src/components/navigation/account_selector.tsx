import { Avatar } from "../ui/avatar";
import { useAccount } from "../context/AccountContext";
import { FaAsterisk } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@radix-ui/react-select";
import { Account } from "@/assets/types/Account";

export default function AccountSelector({ accounts }: { accounts: Account[] }) {
  const { activeAccount, selectActiveAccount, defaultAccountId } = useAccount();

  if (!accounts.length) return null;

  return (
    <div className="">
      <Select
        onValueChange={selectActiveAccount}
        value={activeAccount?.id?.toString()}
      >
        <SelectTrigger className="flex gap-3 items-center px-3 py-2 rounded-lg border shadow-sm">
          <Avatar className="bg-secondary text-secondary-foreground rounded-full flex items-center justify-center w-8 h-8">
            <FaAsterisk />
          </Avatar>
          <span className="font-semibold text-lg truncate">
            {activeAccount?.name || "Select account"}
          </span>
        </SelectTrigger>
        <SelectContent className="bg-white text-base text-foreground rounded-lg shadow-lg mt-2">
          {accounts.map((account) => (
            <SelectItem
              key={account.id}
              value={account.id.toString()}
              className={`flex items-center px-3 py-2 cursor-pointer ${
                activeAccount && account.id === activeAccount.id
                  ? "font-bold text-primary"
                  : "text-primary"
              }`}
            >
              <span className="truncate">{account.name}</span>
              {account.id === defaultAccountId && (
                <span className="ml-2 text-md text-primary">*</span>
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
