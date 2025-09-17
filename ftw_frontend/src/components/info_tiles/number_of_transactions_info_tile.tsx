import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/assets/types/Transaction";
import { useState, useEffect } from "react";

interface Props {
  transactions: Transaction[];
}

function get_n_transactions_this_year(transactions: Transaction[]) {
  const currentYear = new Date().getFullYear();
  return transactions.filter((t) => t.date_executed.getFullYear() === currentYear).length;
}

function get_unprocessed_transactions(transactions: Transaction[]) {
  console.log("Transactions:", transactions);
  const unprocessed_transactions = transactions.filter((t) => t.category_id == null);
  console.log("Unprocessed Transactions:", unprocessed_transactions);
  return unprocessed_transactions;
}

export default function NTransactionsInfoTile({ transactions }: Props) {
  const [unprocessed_transactions, setUnprocessedTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    setUnprocessedTransactions(get_unprocessed_transactions(transactions));
  }, [transactions]);

  return (
    <Card className='flex-1 px-2 '>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>N° of Transactions</CardTitle>
      </CardHeader>
      <CardContent className='-mt-4 text-2xl'>
        <span className='flex gap-3'>
          <div className='font-bold pb-1'>{transactions.length}</div>
          <div className='flex font-normal text-base items-center align-center'>
            ({get_n_transactions_this_year(transactions)} this year)
          </div>
        </span>
        {unprocessed_transactions.length > 0 && (
          <div className='flex items-center text-red-500 font-semibold text-xl mt-2'>
            {unprocessed_transactions.length} transactions are unprocessed !!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
