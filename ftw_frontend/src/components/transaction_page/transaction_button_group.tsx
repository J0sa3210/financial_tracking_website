import { Button } from "../ui/button";
import { FaPlus } from "react-icons/fa";

export default function TransactionButtonGroup() {
  return (
    <div className='flex py-2 justify-end'>
      <Button className='bg-primary text-primary-foreground hover:bg-primary/90'>
        <FaPlus /> Add Transactions
      </Button>
    </div>
  );
}
