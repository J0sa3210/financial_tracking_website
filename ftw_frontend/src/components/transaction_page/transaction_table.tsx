import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { Transaction } from "@/assets/types/Transaction";

interface TransactionListProps {
  transactions: Transaction[];
}

const currencyFormatter = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
});

const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export default function TransactionTable(transactionsProp: TransactionListProps) {
  const transactions: Transaction[] = transactionsProp.transactions;

  return (
    <div className='overflow-x-auto rounded-lg shadow border my-2'>
      <Table>
        <TableHeader>
          <TableRow className=''>
            <TableHead className='w-1/12 text-left px-4 py-2'>ID</TableHead>
            <TableHead className='w-1/12 text-left px-4 py-2'>Type</TableHead>
            <TableHead className='w-1/12 text-left px-4 py-2'>Category</TableHead>
            <TableHead className='w-5/12 text-left px-4 py-2'>Description</TableHead>
            <TableHead className='w-2/12 text-left px-4 py-2'>Amount</TableHead>
            <TableHead className='w-2/12 text-left px-4 py-2'>Counterpart</TableHead>
            <TableHead className='w-1/12 text-left px-4 py-2'>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction, idx) => (
            <TableRow
              key={transaction.id}
              className={`hover:bg-accent cursor-pointer ${
                idx % 2 === 0 ? "bg-background-table-1" : "bg-background-table-2"
              }`}
              tabIndex={0}>
              <TableCell className='px-4 py-2'>{transaction.id}</TableCell>
              <TableCell className='px-4 py-2'>{transaction.transaction_type}</TableCell>
              <TableCell className='px-4 py-2'>{transaction.transaction_category}</TableCell>
              <TableCell
                className='px-4 py-2 truncate max-w-xs'
                title={transaction.description}>
                {transaction.description}
              </TableCell>
              <TableCell
                className={`px-4 py-2 font-semibold ${
                  transaction.transaction_type == "Expenses" ? "text-red-600" : "text-green-600"
                }`}>
                {currencyFormatter.format(transaction.value)}
              </TableCell>
              <TableCell className='px-4 py-2'>{transaction.transaction_counterpart_name}</TableCell>

              <TableCell className='px-4 py-2'>{dateTimeFormatter.format(transaction.date_executed)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
