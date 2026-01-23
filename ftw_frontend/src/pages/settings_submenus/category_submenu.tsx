import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import CreateCategoryDialog from "@/components/upload_data_handler/create_category_dialog";
import { FaTrash } from "react-icons/fa";
import {
  Counterpart,
  CounterpartEdit,
  type CounterpartSelectOption,
} from "@/assets/types/Counterpart";
import { useAccount } from "@/components/context/AccountContext";
import type { SingleValue } from "react-select";
import { Category, CategoryEdit } from "@/assets/types/Category";
import { Input } from "@/components/ui/input";

export default function CategorySubmenu() {
  const { activeAccount } = useAccount();

  const [categories, setCategories] = useState<CategoryEdit[]>([]);
  const [counterpartOptions, setCounterpartOptions] = useState<
    CounterpartSelectOption[]
  >([]);

  // Fetch functions
  async function fetchCategories() {
    const response = await fetch("http://localhost:8000/category", {
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

    setCategories(
      data.map(
        (c: Category) =>
          new CategoryEdit(
            c.id,
            c.name,
            c.description,
            c.category_type,
            c.counterparts.map(
              (c: Counterpart) => new CounterpartEdit(c.id, c.name),
            ),
          ),
      ),
    );
  }

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

  // Button handlers
  async function handleSave(category: CategoryEdit) {
    const response = await fetch(
      "http://localhost:8000/category/" + category.id,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
        body: JSON.stringify(category),
      },
    );

    if (!response.ok) {
      throw new Error("Failed to update category " + category.id);
    }

    fetchCategories();
  }

  async function handleDelete(categoryId: number) {
    const response = await fetch(
      "http://localhost:8000/category/" + categoryId,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to delete category " + categoryId);
    }

    fetchCategories();
  }

  async function handleTypeChange(
    categoryId: Number,
    selectedType: SingleValue<{ label: string; value: string }>,
  ) {
    if (selectedType) {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId
            ? { ...category, category_type: selectedType.value }
            : category,
        ),
      );
    }
  }

  async function handleCounterpartChange(
    categoryId: number,
    options: CounterpartSelectOption[] | null,
  ) {
    setCategories((prevCategories: CategoryEdit[]) =>
      prevCategories.map((category: CategoryEdit) =>
        category.id === categoryId
          ? {
              ...category,
              counterparts: (options ?? []).map(
                (cp) => new CounterpartEdit(cp.value, cp.label),
              ),
            }
          : category,
      ),
    );
  }

  // Use effects
  useEffect(() => {
    fetchCategories();
    fetchCounterpartOptions();
  }, []);

  useEffect(() => {
    console.log("Categories updated:", categories);
  }, [categories]);

  useEffect(() => {
    console.log("Counterpart options updated:", counterpartOptions);
  }, [counterpartOptions]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Category Settings</h2>
        <span className="flex gap-1">
          <CreateCategoryDialog
            counterpartOptions={counterpartOptions}
            onCreate={fetchCategories}
          />
        </span>
      </div>
      {categories.map((category: CategoryEdit) => (
        <div key={category.id} className="mb-4 p-2 border  rounded-lg">
          <span className="flex gap-1 justify-between items-center">
            <Input
              className="text-xl font-semibold w-1/4 pl-1"
              defaultValue={category.name}
              type="text"
              onChange={(e) => {
                category.name = e.target.value;
              }}
            />
            <span className="flex gap-1">
              <Button
                className="w-15 text-lg hover:bg-background hover:text-primary hover:border hover:border-primary"
                onClick={() => handleSave(category)}
              >
                Save
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-white hover:text-red-500 hover:border hover:border-red-500"
                onClick={() => handleDelete(category.id)}
              >
                <FaTrash />
              </Button>
            </span>
          </span>

          <p>{category.description}</p>
          <span className="flex gap-2 items-center">
            <label className="font-medium">Type:</label>
            <Select
              options={["None", "Income", "Expenses", "Savings"].map(
                (type) => ({ value: type, label: type }),
              )}
              value={{
                value: category.category_type,
                label: category.category_type,
              }}
              onChange={(selectedOption) => {
                handleTypeChange(category.id, selectedOption);
              }}
              className="mt-2 mb-2 w-50"
            />
          </span>

          <span className="flex gap-2 items-center">
            <label className="font-medium">Counterparts:</label>
            <Select
              isMulti
              options={counterpartOptions}
              value={
                category.counterparts.map((cp: CounterpartEdit) => ({
                  value: cp.id,
                  label: cp.name,
                })) || []
              }
              onChange={(selectedOptions) =>
                handleCounterpartChange(
                  category.id,
                  selectedOptions as CounterpartSelectOption[] | null,
                )
              }
              className="mt-2 w-full"
            />
          </span>
        </div>
      ))}
    </div>
  );
}
