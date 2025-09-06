import { Category } from "@/assets/types/Category";
import type { Transaction } from "@/assets/types/Transaction";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAccount } from "../context/AccountContext";

interface TransactionInfo {
  transaction: Transaction | null;
  onSaveEdit: () => {};
}

type transactionType = "Expenses" | "Income" | "Savings";

export default function TransactionEditDialog(transactionInfo: TransactionInfo) {
  const transaction: Transaction | null = transactionInfo.transaction;
  const [categories, setCategories] = useState<Category[]>([]);
  const transactionTypes: transactionType[] = ["Expenses", "Income", "Savings"];
  const { activeAccount } = useAccount();

  useEffect(() => {
    if (!transaction) return; // only fetch categories when we have a transaction
    async function get_categories() {
      const resp = await fetch("http://localhost:8000/categories", {
        headers: {
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
      });
      const data = await resp.json();
      const loadedCategories = data.map((c: any) => new Category(c.id, c.name, c.description, c.counterparts));
      setCategories(loadedCategories);
    }
    get_categories();
  }, [transaction]);

  async function handleSave(transaction: Transaction) {
    console.log("Editing transaction", transaction);

    try {
      await fetch("http://localhost:8000/transaction/" + transaction.id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });
    } catch (error) {
      console.error("Error updating the transactions:", error);
      alert("An error occurred while updating transactions");
    } finally {
      transactionInfo.onSaveEdit();
    }
  }

  if (!transaction) return null;

  return (
    <Dialog
      open={transaction !== null}
      onOpenChange={(open) => {
        if (!open) {
          // close dialog by resetting transaction in parent
          transactionInfo.onSaveEdit();
        }
      }}>
      <DialogContent className='sm:max-w-2xl w-[90vw]'>
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>View or edit the selected transaction below.</DialogDescription>
        </DialogHeader>

        <p className='font-semibold text-md'>Type:</p>

        <Select
          onValueChange={(type: transactionType) => {
            transaction.transaction_type = type;
          }}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder={transaction.transaction_type ?? "Choose Type"} />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type, type_idx) => (
              <SelectItem
                key={type_idx}
                value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <p className='font-semibold text-md'>Category:</p>

        <Select
          onValueChange={(category_id) => {
            transaction.category_id = Number(category_id);
          }}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue placeholder={transaction.category_name ?? "Choose Category"} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c: Category) => (
              <SelectItem
                key={c.id}
                value={c.id.toString()}>
                {c.name}
              </SelectItem>
            ))}
            <SelectItem value='None'>None</SelectItem>
          </SelectContent>
        </Select>

        <p className='font-semibold text-md'>Description:</p>
        <textarea
          defaultValue={transaction.description}
          className='w-full resize-none overflow-auto'
          rows={4}
        />

        <Button onClick={() => handleSave(transaction)}>Save</Button>
      </DialogContent>
    </Dialog>
  );
}
