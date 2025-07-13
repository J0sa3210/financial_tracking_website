import { Transaction } from "@/assets/types/Transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    async function get_transactions() {
      const resp = await fetch("http://localhost:8000/transaction/");
      const data = await resp.json();
      setTransactions(
        data.map(
          (t: any) =>
            new Transaction(
              t.id,
              t.value,
              t.description,
              t.date_executed,
              t.time_executed,
              t.transaction_type
            )
        )
      );
    }
    get_transactions();
  }, []);

  const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const currencyFormatter = new Intl.NumberFormat("nl-BE", {
    style: "currency",
    currency: "EUR",
  });

  return (
    <div className='mx-auto max-w-5xl p-4'>
      <h1 className='text-2xl font-bold mb-6 text-center underline'>
        Transactions
      </h1>
      <div className='overflow-x-auto rounded-lg shadow border'>
        <Table>
          <TableHeader>
            <TableRow className=''>
              <TableHead className='w-1/12 text-left px-4 py-2'>ID</TableHead>
              <TableHead className='w-2/12 text-left px-4 py-2'>
                Category
              </TableHead>
              <TableHead className='w-5/12 text-left px-4 py-2'>
                Description
              </TableHead>
              <TableHead className='w-2/12 text-left px-4 py-2'>
                Amount
              </TableHead>
              <TableHead className='w-2/12 text-left px-4 py-2'>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction, idx) => (
              <TableRow
                key={transaction.id}
                className={`hover:bg-accent cursor-pointer ${
                  idx % 2 === 0
                    ? "bg-background-table-1"
                    : "bg-background-table-2"
                }`}
                tabIndex={0}>
                <TableCell className='px-4 py-2'>{transaction.id}</TableCell>
                <TableCell className='px-4 py-2'>
                  {transaction.transaction_type}
                </TableCell>
                <TableCell
                  className='px-4 py-2 truncate max-w-xs'
                  title={transaction.description}>
                  {transaction.description}
                </TableCell>
                <TableCell
                  className={`px-4 py-2 font-semibold ${
                    transaction.value < 0 ? "text-red-600" : "text-green-600"
                  }`}>
                  {currencyFormatter.format(transaction.value)}
                </TableCell>
                <TableCell className='px-4 py-2'>
                  {dateTimeFormatter.format(transaction.dateTime_executed)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {transactions.length === 0 && (
        <div className='text-center text-gray-500 mt-6'>
          No transactions found.
        </div>
      )}
    </div>
  );
}
