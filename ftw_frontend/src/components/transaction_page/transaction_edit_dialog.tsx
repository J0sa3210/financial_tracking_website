import { Category } from "@/assets/types/Category";
import type { Transaction } from "@/assets/types/Transaction";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAccount } from "../context/AccountContext";
import { Input } from "../ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CreateCategoryDialog from "../upload_data_handler/create_category_dialog";
import {
  Counterpart,
  type CounterpartSelectOption,
} from "@/assets/types/Counterpart";
interface TransactionInfo {
  transaction: Transaction | null;
  onSaveEdit: () => {};
}

type transactionType = "Expenses" | "Income" | "Savings" | "None";

export default function TransactionEditDialog(
  transactionInfo: TransactionInfo,
) {
  const transaction: Transaction | null = transactionInfo.transaction;
  const [categories, setCategories] = useState<Category[]>([]);
  const transactionTypes: transactionType[] = ["Expenses", "Income", "Savings"];
  const { activeAccount } = useAccount();
  const [addCounterpart, setAddCounterpart] = useState<boolean>(false);
  const [chosenTransactionType, setChosenTransactionType] =
    useState<transactionType>("None");

  const [counterpartOptions, setCounterpartOptions] = useState<
    CounterpartSelectOption[]
  >([]);

  async function fetchCounterpartOptions() {
    const response = await fetch("http://localhost:8000/counterpart/empty", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount ? activeAccount.id.toString() : "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to get empty counterparts");
    }

    setCounterpartOptions(
      data.map((cp: Counterpart) => {
        return {
          value: cp.id,
          label: cp.name,
        };
      }),
    );
  }

  // fetch counterpart options (independent of categories)
  useEffect(() => {
    // run when account changes
    if (activeAccount) fetchCounterpartOptions();
  }, [activeAccount]);

  async function fetchCategories() {
    const resp = await fetch("http://localhost:8000/category", {
      headers: {
        "active-account-id": activeAccount ? activeAccount.id.toString() : "",
      },
    });
    const data = await resp.json();
    const loadedCategories = data.map(
      (c: any) =>
        new Category(
          c.id,
          c.name,
          c.description,
          c.category_type,
          c.counterparts,
        ),
    );
    setCategories(loadedCategories);
  }

  useEffect(() => {
    if (!transaction) return; // only fetch categories when we have a transaction
    fetchCategories();
  }, [transaction]);

  async function handleSave(transaction: Transaction, addCounterpart: boolean) {
    console.log("Editing transaction", transaction);

    try {
      await fetch("http://localhost:8000/transaction/" + transaction.id, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(transaction),
      });

      if (addCounterpart) {
        const category: Category | undefined = categories.find(
          (c) => c.id === transaction.category_id,
        );
        if (category) {
          await fetch(
            "http://localhost:8000/category/" +
              category.id +
              "/add_counterpart",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "active-account-id": activeAccount
                  ? activeAccount.id.toString()
                  : "",
              },
              body: JSON.stringify({
                counterpart_name: transaction.counterpart_name,
              }),
            },
          );
        }
      }
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
      }}
    >
      <DialogContent className="sm:max-w-2xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View or edit the selected transaction below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 grid-rows-2 justify-stretch gap-6 mb-4 w-full">
          {/* Type Selector */}
          <div>
            <p className="font-semibold text-md mb-2">Type:</p>

            <Select
              onValueChange={(type: transactionType) => {
                transaction.transaction_type = type;
                setChosenTransactionType(type);
              }}
            >
              <SelectTrigger className="w-[200px] border-primary/50">
                <SelectValue
                  placeholder={transaction.transaction_type ?? "Choose Type"}
                />
              </SelectTrigger>
              <SelectContent>
                {transactionTypes.map((type, type_idx) => (
                  <SelectItem key={type_idx} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Amount input */}
          <div>
            <p className="font-semibold text-md mb-2">Amount:</p>

            <Input
              type="number"
              defaultValue={transaction.value}
              className="w-[200px] border rounded-md p-1 border-primary/50"
              onChange={(e) => {
                transaction.value = Number(e.target.value);
              }}
            />
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-md">Category:</p>

            <span className="flex gap-2">
              <Select
                onValueChange={(category_id) => {
                  transaction.category_id = Number(category_id);
                }}
              >
                <SelectTrigger className="w-[200px] border-primary/50">
                  <SelectValue
                    placeholder={transaction.category_name ?? "Choose Category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter(
                      (c: Category) => c.category_type == chosenTransactionType,
                    )
                    .map((c: Category) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
              <CreateCategoryDialog
                counterpartOptions={counterpartOptions}
                onCreate={fetchCategories}
              />
            </span>
            <div className="flex items-center gap-2">
              <Checkbox
                id="add_counterpart"
                className="border-primary/50"
                checked={addCounterpart}
                onCheckedChange={(checked) =>
                  setAddCounterpart(Boolean(checked))
                }
              />
              <Label
                htmlFor="add_counterpart"
                className="font-normal flex gap-1"
              >
                <span>Add</span>
                <span className="italic">{transaction.counterpart_name}</span>
                <span>to category </span>
              </Label>
            </div>
          </div>
          {/* Date picker */}
          <div>
            <p className="font-semibold text-md mb-2">Date:</p>
            <Input
              type="date"
              defaultValue={
                transaction.date_executed.toISOString().split("T")[0]
              } // Extract date part from ISO string
              className="w-[200px] border rounded-md p-1 border-primary/50"
              onChange={(e) => {
                transaction.date_executed = new Date(e.target.value);
              }}
            />
          </div>
        </div>

        <p className="font-semibold text-md">Description:</p>
        <textarea
          defaultValue={transaction.description}
          className="w-full resize-none overflow-auto"
          rows={4}
        />

        <Button onClick={() => handleSave(transaction, addCounterpart)}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
