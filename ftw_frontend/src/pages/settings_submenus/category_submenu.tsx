import { useEffect, useState } from "react";
import { Category } from "@/assets/types/Category";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import CreateCategoryDialog from "@/components/upload_data_handler/create_category_dialog";
import { FaTrash } from "react-icons/fa";
import { Counterpart } from "@/assets/types/Counterpart";
import { useAccount } from "@/components/context/AccountContext";
import type { SingleValue } from "react-select";

export default function CategorySubmenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counterparts, setCounterparts] = useState<{ [key: number]: { value: string; label: string }[] }>({});
  const [counterpartOptions, setCounterpartOptions] = useState<{ value: string; label: string }[]>([]);
  const [counterpartMap, setCounterpartMap] = useState<{ [name: string]: Counterpart }>({});
  const { activeAccount } = useAccount();

  // Define the options for the multiselect component
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

      // Build the mapping
      const map: { [name: string]: Counterpart } = {};
      data.forEach((cp: any) => {
        map[cp.name] = cp;
      });
      setCounterpartMap(map);
    }
    fetchCounterpartOptions();
  }, [categories]); // Fetch options only once when categories are loaded or counterparts change

  async function get_categories() {
    const resp = await fetch("http://localhost:8000/categories", {
      headers: {
        "active-account-id": activeAccount ? activeAccount.id.toString() : "",
      },
    });

    const data = await resp.json();
    const loadedCategories = data.map(
      (c: any) => new Category(c.id, c.name, c.description, c.category_type, c.counterparts)
    );
    setCategories(loadedCategories);

    // Initialize counterparts state
    const initialCounterparts = loadedCategories.reduce(
      (acc: { [key: number]: { value: string; label: string }[] }, category: Category) => {
        acc[category.id] = category.counterparts.map((counterpart: Counterpart) => ({
          value: counterpart.name,
          label: counterpart.name,
        }));
        return acc;
      },
      {}
    );
    setCounterparts(initialCounterparts);
  }

  useEffect(() => {
    get_categories();
  }, [activeAccount]);

  const handleCounterpartChange = (categoryId: number, selectedOptions: { value: string; label: string }[] | null) => {
    if (selectedOptions) {
      setCounterparts({
        ...counterparts,
        [categoryId]: selectedOptions,
      });
    }
  };

  const handleTypeChange = (categoryId: number, selectedType: SingleValue<{ value: string; label: string }>) => {
    if (selectedType) {
      setCategories((prevCategories) =>
        prevCategories.map((category) =>
          category.id === categoryId ? { ...category, category_type: selectedType.value } : category
        )
      );
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await fetch("http://localhost:8000/categories/" + categoryId, {
        method: "DELETE",
        headers: {
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
      });
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("An error occurred while deleting the category");
    } finally {
      get_categories(); // Refresh the categories after deletion}
    }
  };

  const handleSave = async (category: Category) => {
    if (counterparts[category.id]) {
      category.counterparts = counterparts[category.id].map((option) => counterpartMap[option.value]);
    }

    console.log("Category to update: ", category);

    try {
      await fetch("http://localhost:8000/categories/" + category.id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
        body: JSON.stringify(category),
      });
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("An error occurred while updating categories");
    } finally {
      get_categories(); // Refresh the categories after deletion}
    }
  };

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Category Settings</h2>
        <span className='flex gap-1'>
          <CreateCategoryDialog
            counterpartOptions={counterpartOptions}
            counterpartMap={counterpartMap}
            onCreate={get_categories}
          />
        </span>
      </div>
      {categories.map((category) => (
        <div
          key={category.id}
          className='mb-4 p-2 border  rounded-lg'>
          <span className='flex gap-1 justify-between items-center'>
            <h3 className='text-xl font-semibold'>{category.name}</h3>
            <span className='flex gap-1'>
              <Button
                className='w-15 text-lg hover:bg-background hover:text-primary hover:border hover:border-primary'
                onClick={() => handleSave(category)}>
                Save
              </Button>
              <Button
                className='bg-red-500 text-white hover:bg-white hover:text-red-500 hover:border hover:border-red-500'
                onClick={() => deleteCategory(category.id)}>
                <FaTrash />
              </Button>
            </span>
          </span>

          <p>{category.description}</p>
          <span className='flex gap-2 items-center'>
            <label className='font-medium'>Type:</label>
            <Select
              options={["None", "Income", "Expenses", "Savings"].map((type) => ({ value: type, label: type }))}
              value={{ value: category.category_type, label: category.category_type }}
              onChange={(selectedOption) => {
                handleTypeChange(category.id, selectedOption);
              }}
              className='mt-2 mb-2 w-50'
            />
          </span>

          <span className='flex gap-2 items-center'>
            <label className='font-medium'>Counterparts:</label>
            <Select
              isMulti
              options={counterpartOptions}
              value={counterparts[category.id] || []}
              onChange={(selectedOptions) =>
                handleCounterpartChange(
                  category.id,
                  selectedOptions.map((option) => ({ value: option.value, label: option.label }))
                )
              }
              className='mt-2 w-full'
            />
          </span>
        </div>
      ))}
    </div>
  );
}
