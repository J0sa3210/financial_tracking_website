import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import CreateCategoryDialog from "@/components/upload_data_handler/create_category_dialog";
import { FaTrash } from "react-icons/fa";
import { Counterpart } from "@/assets/types/Counterpart";
import { useAccount } from "@/components/context/AccountContext";
import type { SingleValue } from "react-select";

export default function CategorySubmenu() {
  const [categories, setCategories] = useState<any[]>([]); // store plain objects
  const [counterparts, setCounterparts] = useState<{
    [key: number]: { value: string; label: string }[];
  }>({});
  const [counterpartOptions, setCounterpartOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [counterpartMap, setCounterpartMap] = useState<{
    [name: string]: Counterpart;
  }>({});
  const { activeAccount } = useAccount();

  // fetch counterpart options (independent of categories)
  useEffect(() => {
    async function fetchCounterpartOptions() {
      const resp = await fetch("http://localhost:8000/counterparts", {
        headers: {
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
      });
      const data = await resp.json();

      const options = data.map((cp: Counterpart) => ({
        value: cp.name,
        label: cp.name,
      }));
      setCounterpartOptions(options);

      const map: { [name: string]: Counterpart } = {};
      data.forEach((cp: any) => {
        map[cp.name] = cp;
      });
      setCounterpartMap(map);
    }

    // run when account changes
    if (activeAccount) fetchCounterpartOptions();
  }, [activeAccount]);

  // load categories from backend (store raw objects)
  async function get_categories() {
    const resp = await fetch("http://localhost:8000/category", {
      headers: {
        "active-account-id": activeAccount ? activeAccount.id.toString() : "",
      },
    });

    const data = await resp.json();

    // keep plain objects (do not wrap in custom class)
    setCategories(data);

    // Initialize counterparts state from server data so Select shows current selections
    const initialCounterparts = data.reduce(
      (
        acc: { [key: number]: { value: string; label: string }[] },
        category: any
      ) => {
        acc[category.id] = (category.counterparts || []).map(
          (counterpart: Counterpart) => ({
            value: counterpart.name,
            label: counterpart.name,
          })
        );
        return acc;
      },
      {}
    );
    setCounterparts(initialCounterparts);
  }

  useEffect(() => {
    if (activeAccount) get_categories();
  }, [activeAccount]);

  const handleCounterpartChange = (
    categoryId: number,
    selectedOptions: { value: string; label: string }[] | null
  ) => {
    setCounterparts((prev) => ({
      ...prev,
      [categoryId]: selectedOptions ? selectedOptions : [],
    }));
  };

  const handleTypeChange = (
    categoryId: number,
    selectedType: SingleValue<{ value: string; label: string }>
  ) => {
    if (selectedType) {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId
            ? { ...category, category_type: selectedType.value }
            : category
        )
      );
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await fetch("http://localhost:8000/category/" + categoryId, {
        method: "DELETE",
        headers: {
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("An error occurred while deleting the category");
    } finally {
      get_categories();
    }
  };

  // Build final counterpart objects for payload:
  // - take the selected options if present, otherwise fall back to original category.counterparts
  // - map names to existing counterpart objects via counterpartMap
  // - if a name is not found in the map, send a minimal object { name } so backend can create it
  const buildCounterpartsForCategory = (category: any) => {
    const selected = counterparts[category.id];
    const names = (
      selected ??
      (category.counterparts || []).map((cp: any) => ({
        value: cp.name,
        label: cp.name,
      }))
    ).map((opt: any) => opt.value);

    // unique names preserve existing counterparts that weren't removed
    const uniqueNames = Array.from(new Set(names));

    return uniqueNames.map((name) => counterpartMap[name] ?? { name });
  };

  const handleSave = async (category: any) => {
    // create a plain payload object
    const payload = {
      ...category,
      counterparts: buildCounterpartsForCategory(category),
    };

    console.log("Category payload to update: ", payload);

    try {
      await fetch("http://localhost:8000/category/" + category.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("An error occurred while updating categories");
    } finally {
      get_categories();
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Category Settings</h2>
        <span className="flex gap-1">
          <CreateCategoryDialog
            counterpartOptions={counterpartOptions}
            counterpartMap={counterpartMap}
            onCreate={get_categories}
          />
        </span>
      </div>
      {categories.map((category) => (
        <div key={category.id} className="mb-4 p-2 border  rounded-lg">
          <span className="flex gap-1 justify-between items-center">
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <span className="flex gap-1">
              <Button
                className="w-15 text-lg hover:bg-background hover:text-primary hover:border hover:border-primary"
                onClick={() => handleSave(category)}
              >
                Save
              </Button>
              <Button
                className="bg-red-500 text-white hover:bg-white hover:text-red-500 hover:border hover:border-red-500"
                onClick={() => deleteCategory(category.id)}
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
                (type) => ({ value: type, label: type })
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
              value={counterparts[category.id] || []}
              onChange={(selectedOptions) =>
                handleCounterpartChange(
                  category.id,
                  selectedOptions as { value: string; label: string }[] | null
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
