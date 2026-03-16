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
import { CategoryType, CategoryTypeEdit } from "@/assets/types/CategoryType";

interface TransactionInfo {
  transactions: number[] | null;
  onSaveEdit: () => void;
}

export default function TransactionBulkEditDialog(
  transactionInfo: TransactionInfo,
) {
  const [showDialog, setShowDialog] = useState(false);
  const transactions: number[] | null = transactionInfo.transactions;
  const [categories, setCategories] = useState<Category[]>([]);
  const { activeAccount } = useAccount();

  const [chosenCategoryType, setChosenCategoryType] =
    useState<CategoryTypeEdit>(new CategoryTypeEdit(0, 0, "None"));
  const [categoryTypes, setCategoryTypes] = useState<CategoryTypeEdit[]>([]);

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

  async function fetchCategoryTypes() {
    const response = await fetch("https://localhost:8000/category_types/", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount ? activeAccount.id.toString() : "",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Failed to get categories");
    }

    setCategoryTypes(
      data.map(
        (ct: CategoryType) => new CategoryTypeEdit(ct.id, ct.owner_id, ct.name),
      ),
    );
  }

  useEffect(() => {
    if (!transactions) return; // only fetch categories when we have a transaction
    fetchCategories();
    fetchCategoryTypes();
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
            <span className="flex gap-2 items-center">
              <label className="font-medium">Type:</label>
              <Select
                onValueChange={(val: string) => {
                  const id = Number(val);
                  const ct = categoryTypes.find((c) => c.id === id);
                  setChosenCategoryType(
                    new CategoryTypeEdit(
                      id,
                      activeAccount?.id ?? 0,
                      ct?.name ?? "",
                    ),
                  );
                }}
              >
                <SelectTrigger className="mt-2 mb-2 w-[200px]">
                  <SelectValue placeholder="Choose Type" />
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id.toString()}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </span>
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
                  {(chosenCategoryType.name === ""
                    ? categories
                    : categories.filter(
                        (category) =>
                          category.category_type.name ===
                          chosenCategoryType.name,
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
