import { Transaction } from "@/assets/types/Transaction";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useEffect, useState } from "react";

interface totalsType {
  total_income: number;
  total_expenses: number;
  total_savings: number;
}

const defaultTotals: totalsType = {
  total_income: 0,
  total_expenses: 0,
  total_savings: 0,
};

function get_n_transactions_this_year(transactions: Transaction[]) {
  const currentYear = new Date().getFullYear();
  return transactions.filter(
    (t) => t.dateTime_executed.getFullYear() === currentYear
  ).length;
}

function get_latest_transaction(transactions: Transaction[]) {
  if (transactions.length === 0) {
    return null;
  }

  var latest = transactions[0];

  for (const transaction of transactions) {
    if (transaction.dateTime_executed > latest.dateTime_executed) {
      latest = transaction;
    }
  }
  return latest;
}

function get_days_between(dt1: Date, dt2: Date): number {
  return Math.floor(
    (Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) -
      Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) /
      (1000 * 60 * 60 * 24)
  );
}

const current_date = new Date();

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<totalsType>(defaultTotals);

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

  useEffect(() => {
    async function get_totals() {
      const resp = await fetch("http://localhost:8000/transaction/total/");
      const data = await resp.json();
      setTotals(data);
    }
    get_totals();
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

  const latest_transaction: Transaction | null =
    get_latest_transaction(transactions);

  const time_passed: number = latest_transaction?.dateTime_executed
    ? get_days_between(latest_transaction!.dateTime_executed, current_date)
    : 0;

  return (
    <div className='mx-auto max-w-5xl p-4'>
      {/* <h1 className='text-2xl font-bold mb-6 text-center underline'>
        Transactions
      </h1> */}
      <div className='rounded-lg py-2'>
        <div className='flex gap-4'>
          <Card className='flex-auto px-2'>
            <CardHeader>
              <CardTitle>
                <div className='flex justify-between text-2xl font-bold'>
                  <span>Total:</span>
                  <span>
                    {currencyFormatter.format(
                      totals?.total_income -
                        totals?.total_expenses +
                        totals?.total_savings
                    )}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className='-mt-6 text-sm'>
              <div className='flex justify-between text-green-700 '>
                <span>Income:</span>
                <span>{currencyFormatter.format(totals.total_income)}</span>
              </div>
              <div className='flex justify-between text-red-700 '>
                <span>Expenses:</span>
                <span>{currencyFormatter.format(totals.total_expenses)}</span>
              </div>
              <div className='flex justify-between text-blue-700 '>
                <span>Savings:</span>
                <span>{currencyFormatter.format(totals.total_savings)}</span>
              </div>
            </CardContent>
          </Card>
          <Card className='flex-auto px-2 '>
            <CardHeader>
              <CardTitle className='text-2xl font-bold'>
                N° of Transactions
              </CardTitle>
            </CardHeader>
            <CardContent className='-mt-1 text-xl'>
              <div className='flex gap-20'>
                <span className='font-bold'>{transactions.length}</span>
                <span className='font-normal'>
                  ({get_n_transactions_this_year(transactions)} this year)
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className='flex-auto px-2 '>
            <CardHeader>
              <CardTitle className='text-2xl font-bold'>
                Date Last Transaction
              </CardTitle>
            </CardHeader>
            <CardContent className='-mt-1 text-xl font-semibold'>
              {latest_transaction ? (
                <div className='flex gap-3'>
                  <span className='font-bold'>
                    {
                      dateTimeFormatter
                        .format(latest_transaction.dateTime_executed)
                        .split(",")[0]
                    }
                  </span>
                  <span className='font-normal text-md'>
                    ({time_passed} days ago)
                  </span>
                </div>
              ) : (
                "No transactions yet"
              )}
            </CardContent>
          </Card>
        </div>
      </div>
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
