import { Category } from "@/assets/types/Category";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import CreateCategoryDialog from "../upload_data_handler/create_category_dialog";
import { useAccount } from "../context/AccountContext";

interface TransactionInfo {
  transactions: number[] | null;
  onSaveEdit: () => void;
}

type transactionType = "Expenses" | "Income" | "Savings" | "None";

export default function TransactionBulkEditDialog(
  transactionInfo: TransactionInfo,
) {
  const [showDialog, setShowDialog] = useState(false);
  const transactions: number[] | null = transactionInfo.transactions;
  const [categories, setCategories] = useState<Category[]>([]);
  const transactionTypes: transactionType[] = ["Expenses", "Income", "Savings"];
  const { activeAccount } = useAccount();

  const [chosenTransactionType, setChosenTransactionType] =
    useState<transactionType>("None");
  const [chosenCategory, setChosenCategory] = useState<number>(0);

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
    if (!transactions) return; // only fetch categories when we have a transaction
    fetchCategories();
  }, [transactions]);

  async function handleSave(
    transactions: number[] | null,
    category_id: number,
  ) {
    if (!transactions) return;
    const resp = await fetch(
      `http://localhost:8000/category/${category_id}/add_transactions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
        body: JSON.stringify(transactions),
      },
    );

    if (!resp.ok) {
      throw new Error(`Failed to save transaction: ${resp.statusText}`);
    }
    setShowDialog(false);
    transactionInfo.onSaveEdit();
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button className="bg-orange-500 text-primary-foreground text-lg hover:bg-orange/90">
          Bulk Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl w-[90vw]">
        <DialogHeader>
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogDescription>
            View or edit the selected transaction below.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 grid-rows-1 justify-stretch gap-6 mb-4 w-full">
          {/* Type Selector */}
          <div>
            <p className="font-semibold text-md mb-2">Type:</p>

            <Select
              onValueChange={(type: transactionType) => {
                setChosenTransactionType(type);
              }}
            >
              <SelectTrigger className="w-[200px] border-primary/50">
                <SelectValue placeholder={"Choose Type"} />
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

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <p className="font-semibold text-md">Category:</p>

            <span className="flex gap-2">
              <Select
                onValueChange={(category_id) => {
                  setChosenCategory(Number(category_id));
                }}
              >
                <SelectTrigger className="w-[200px] border-primary/50">
                  <SelectValue placeholder={"Choose Category"} />
                </SelectTrigger>
                <SelectContent>
                  {(chosenTransactionType === "None"
                    ? categories
                    : categories.filter(
                        (category) =>
                          category.category_type === chosenTransactionType,
                      )
                  ).map((c: Category) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </span>
          </div>
          <CreateCategoryDialog onCreate={fetchCategories} />
        </div>

        <Button onClick={() => handleSave(transactions, chosenCategory)}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
