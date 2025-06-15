import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TransactionsPage() {
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
          <TableRow className='text-left'>
            <TableCell>1</TableCell>
            <TableCell>Test</TableCell>
            <TableCell>Something longer. Lorem ipsum ...</TableCell>
            <TableCell>€150</TableCell>
            <TableCell>25/01/2004 12:00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
