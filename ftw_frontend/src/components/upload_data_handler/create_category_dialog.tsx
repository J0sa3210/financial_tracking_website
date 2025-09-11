import { act, useState } from "react";
import { Dialog, DialogHeader, DialogContent, DialogTrigger, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";
import { Card, CardAction, CardContent } from "@/components/ui/card";
import { Input } from "../ui/input";
import Select from "react-select";
import { Counterpart } from "@/assets/types/Counterpart";
import { useAccount } from "@/components/context/AccountContext";

type CounterpartOptions = { value: string; label: string }[];
type CounterpartMap = { [name: string]: Counterpart };

export default function CreateCategoryDialog({
  counterpartOptions,
  counterpartMap,
  onCreate,
}: {
  counterpartOptions: CounterpartOptions;
  counterpartMap: CounterpartMap;
  onCreate?: () => void;
}) {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [counterparts, setCounterparts] = useState<Counterpart[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [open, setOpen] = useState<boolean>(false);
  const { activeAccount } = useAccount();

  const handleCreateCategory = async () => {
    if (!categoryName) {
      setErrorMsg("Category name is required.");
      return;
    }

    try {
      console.log("Creating category with data:", {
        name: categoryName,
        description,
        counterparts,
      });
      const response = await fetch("http://localhost:8000/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount ? activeAccount.id.toString() : "",
        },
        body: JSON.stringify({
          name: categoryName,
          description,
          counterparts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      // Reset form fields
      setCategoryName("");
      setDescription("");
      setCounterparts([]);
      setErrorMsg(null);

      // Reload categories
      if (onCreate) onCreate();

      setOpen(false);
    } catch (error) {
      console.error(error);
      setErrorMsg("An error occurred while creating the category.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className='w-30 text-lg hover:bg-background hover:text-primary hover:border hover:border-primary'>
          <FaPlus className='mt-0.5 -mr-1' />
          <p>Category</p>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Category</DialogTitle>
        </DialogHeader>
        <Card className='bg-background shadow-none border border-none'>
          <CardContent>
            <Input
              type='text'
              placeholder='Category Name'
              defaultValue=''
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Input
              type='text'
              placeholder='Description'
              defaultValue=''
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Select
              isMulti
              options={counterpartOptions}
              onChange={(selectedOptions) =>
                setCounterparts(selectedOptions.map((option) => counterpartMap[option.value]))
              }
              className='mt-2'
            />

            <CardAction>
              <Button onClick={handleCreateCategory}>Create Category</Button>
            </CardAction>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
