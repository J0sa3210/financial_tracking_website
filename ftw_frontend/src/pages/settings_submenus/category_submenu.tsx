import { useEffect, useState } from "react";
import { Category } from "@/assets/types/Category";
import { Button } from "@/components/ui/button";
import Select from "react-select";

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
  }, []); // Fetch options only once when categories are loaded or counterparts change

  useEffect(() => {
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

  const handleSave = async () => {
    const updatedCategories = categories.map((category) => ({
      ...category,
      counterparts: counterparts[category.id] ? counterparts[category.id].map((option) => option.value) : [],
    }));

    try {
      const resp = await fetch("http://localhost:8000/categories/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedCategories),
      });

      if (resp.ok) {
        alert("Categories updated successfully");
      } else {
        alert("Failed to update categories");
      }
    } catch (error) {
      console.error("Error updating categories:", error);
      alert("An error occurred while updating categories");
    }
  };

  return (
    <div className='p-4'>
      <div className='flex justify-between items-center mb-4'>
        <h2 className='text-2xl font-bold'>Category Settings</h2>
        <Button onClick={handleSave}>Save</Button>
      </div>
      {categories.map((category) => (
        <div
          key={category.id}
          className='mb-4 p-2 border rounded-lg'>
          <h3 className='text-xl font-semibold'>{category.name}</h3>
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
