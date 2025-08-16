import { useState } from "react";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "../ui/input";
import Select from "react-select";

export default function CreateAccountDialog({ onCreate }: { onCreate?: () => void }) {
  const [accountName, setAccountName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // Add this line

  const handleCreateAccount = async () => {
    if (!accountName) {
      setErrorMsg("Account name is required.");
      return;
    }

    try {
      console.log("Creating account with data:", {
        name: accountName,
        iban: bankAccount,
      });
      const response = await fetch("http://localhost:8000/accounts/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: accountName,
          iban: bankAccount,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create account");
      }

      // Reset form fields
      setAccountName("");
      setBankAccount("");
      setErrorMsg(null);

      // Reload categories
      if (onCreate) onCreate();

      setOpen(false); // Close the dialog
    } catch (error) {
      console.error(error);
      setErrorMsg("An error occurred while creating the account.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-30 text-lg hover:bg-background hover:text-primary hover:border hover:border-primary'>
          <FaPlus className='mt-0.5 -mr-1' />
          <p>Account</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Account</DialogTitle>
        </DialogHeader>
        <Card className='bg-background shadow-none border border-none'>
          <CardContent>
            <Input
              type='text'
              placeholder='Account Name'
              defaultValue=''
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
            />
            <Input
              type='text'
              placeholder='Bank account'
              defaultValue='BE'
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
            />
            <CardAction>
              <Button onClick={handleCreateAccount}>Create Account</Button>
            </CardAction>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
