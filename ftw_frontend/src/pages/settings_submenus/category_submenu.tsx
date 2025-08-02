import { useEffect, useState } from "react";
import { Category } from "@/assets/types/Category";
import { Button } from "@/components/ui/button";
import Select from "react-select";
import CreateCategoryDialog from "@/components/upload_data_handler/create_category_dialog";
import { FaTrash } from "react-icons/fa";

export default function CategorySubmenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [counterparts, setCounterparts] = useState<{ [key: number]: { value: string; label: string }[] }>({});
  const [counterpartOptions, setCounterpartOptions] = useState<{ value: string; label: string }[]>([]);

  // Define the options for the multiselect component
  useEffect(() => {
    async function fetchCounterpartOptions() {
      const resp = await fetch("http://localhost:8000/counterparts/names/");
      const data = await resp.json();

      const options = data.map((name: string) => ({
        value: name,
        label: name,
      }));
      setCounterpartOptions(options);
    }
    fetchCounterpartOptions();
  }, [categories]); // Fetch options only once when categories are loaded or counterparts change

  async function get_categories() {
    const resp = await fetch("http://localhost:8000/categories/");
    const data = await resp.json();
    const loadedCategories = data.map((c: any) => new Category(c.id, c.name, c.description, c.counterparts));
    setCategories(loadedCategories);

    // Initialize counterparts state
    const initialCounterparts = loadedCategories.reduce(
      (acc: { [key: number]: { value: string; label: string }[] }, category: Category) => {
        acc[category.id] = category.counterparts.map((counterpart: string) => ({
          value: counterpart,
          label: counterpart,
        }));
        return acc;
      },
      {}
    );
    setCounterparts(initialCounterparts);
  }

  useEffect(() => {
    get_categories();
  }, []);

  const handleCounterpartChange = (categoryId: number, selectedOptions: { value: string; label: string }[] | null) => {
    if (selectedOptions) {
      setCounterparts({
        ...counterparts,
        [categoryId]: selectedOptions,
      });
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await fetch("http://localhost:8000/categories/" + categoryId + "/", {
        method: "DELETE",
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
      category.counterparts = counterparts[category.id].map((option) => option.value);
    }

    try {
      await fetch("http://localhost:8000/categories/" + category.id + "/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
            className='mt-2'
          />
        </div>
      ))}
    </div>
  );
}
