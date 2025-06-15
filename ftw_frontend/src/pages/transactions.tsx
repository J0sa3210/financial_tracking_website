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
    <div>
      <h1 className='text-xl font-bold underline'>Transactions</h1>
      <Table>
        <TableHeader>
          <TableRow className='text-left'>
            <TableHead>ID</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow className='text-left'>
              <TableCell>{transaction.id}</TableCell>
              <TableCell>{transaction.transaction_type}</TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>
                {currencyFormatter.format(transaction.value)}
              </TableCell>
              <TableCell>
                {dateTimeFormatter.format(transaction.dateTime_executed)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
