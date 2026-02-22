"use client";

import * as React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { ChevronUp, ChevronDown } from "lucide-react";
import { IoFilter } from "react-icons/io5";
import type {
  ColumnDef,
  VisibilityState,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Transaction } from "@/assets/types/Transaction";
import TransactionInput from "@/components/transaction_page/transaction_input_dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import type { RowSelectionState } from "@tanstack/react-table";
import { FaTrash } from "react-icons/fa";
import TransactionBulkEditDialog from "./transaction_bulk_edit";

interface TransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (id: number) => void; // new
  onSaveEdit: () => void;
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

// --------------------- //
// Table Column Defs
// --------------------- //
const getColumns = (): ColumnDef<Transaction>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        onClick={(e) => e.stopPropagation()} // prevent row click
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        onClick={(e) => e.stopPropagation()} // prevent row click
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "id",
    header: "ID",
    cell: ({ row }) => row.index + 1, // display index + 1
  },
  {
    accessorKey: "transaction_type",
    header: "Type",
    cell: (info) => info.getValue(),
    filterFn: "equals",
    enableColumnFilter: true,
  },
  {
    accessorKey: "category_name",
    header: "Category",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (info) => (
      <span
        title={info.getValue() as string}
        className="truncate max-w-xs block"
      >
        {info.getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: "value",
    header: "Amount",
    cell: ({ row }) => {
      const value = row.original.value;
      const formatted = currencyFormatter.format(value);
      const color = value < 0 ? "text-red-600" : "text-green-600";
      return <span className={`font-semibold ${color}`}>{formatted}</span>;
    },
  },
  {
    accessorKey: "counterpart_name",
    header: "Counterpart",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "date_executed",
    header: "Date",
    cell: ({ row }) =>
      dateTimeFormatter.format(new Date(row.original.date_executed)),
  },
];

// --------------------- //
// Component
// --------------------- //

export default function TransactionTable({
  transactions,
  onEditTransaction,
  onSaveEdit,
}: TransactionListProps) {
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [selectedTransactions, setSelectedTransactions] = React.useState<
    number[]
  >([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [pageSize, setPageSize] = React.useState(25);
  const [pageIndex, setPageIndex] = React.useState(0);

  const table = useReactTable({
    data: transactions,
    columns: getColumns(),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newPagination.pageIndex);
      setPageSize(newPagination.pageSize);
    },
  });

  async function deleteTransactions(ids: number[]) {
    await fetch("http://localhost:8000/transaction", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    });
  }

  async function deleteSelectedTransactions() {
    await deleteTransactions(selectedTransactions);
    setSelectedTransactions([]);
    setRowSelection({}); // clear selection
    onSaveEdit();
  }

  async function deleteAllTransactions() {
    const transaction_ids: number[] = [];
    transactions.map((t: Transaction) => {
      transaction_ids.push(t.id);
    });
    deleteTransactions(transaction_ids);
    onSaveEdit();
  }

  React.useEffect(() => {
    setSelectedTransactions(
      table.getSelectedRowModel().rows.map((row) => row.original.id),
    );
  }, [rowSelection]);

  return (
    <div>
      <span className="flex justify-between items-center my-2">
        <span className="flex items-center gap-2">
          <div>
            <Input
              className="border border-gray-300 rounded p-2"
              type="text"
              placeholder="Search transactions..."
              onChange={(e) => table.setGlobalFilter(e.target.value)}
            />
          </div>
          <div>
            <Drawer>
              <DrawerTrigger asChild>
                <Button className="bg-gray-200 text-primary-foreground hover:bg-gray-300/30">
                  <IoFilter color="black" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <div className="flex mx-auto h-50 items-center text-6xl font-bold">
                  WORK IN PROGRESS...
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </span>
        <span className="flex gap-1 items-center">
          {selectedTransactions.length > 0 ? (
            <Button
              type="button"
              variant="destructive"
              className="text-lg"
              onClick={deleteSelectedTransactions}
            >
              <FaTrash />
              Delete selected
            </Button>
          ) : (
            <Button
              type="button"
              variant="destructive"
              className="text-lg"
              onClick={deleteAllTransactions}
            >
              <FaTrash />
              Delete All
            </Button>
          )}
          {selectedTransactions.length > 1 && (
            <TransactionBulkEditDialog
              transactions={selectedTransactions}
              onSaveEdit={() => {
                onSaveEdit();
                setSelectedTransactions([]);
              }}
            />
          )}
          <TransactionInput />
        </span>
      </span>
      <div className="overflow-x-auto rounded-lg shadow border my-2">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <span className="flex items-center gap-2">
                      {header.isPlaceholder
                        ? null
                        : header.column.columnDef.header instanceof Function
                          ? header.column.columnDef.header(header.getContext())
                          : header.column.columnDef.header}
                      {header.column.getIsSorted() === "asc" && (
                        <ChevronUp className="w-4 h-4" />
                      )}
                      {header.column.getIsSorted() === "desc" && (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row, idx) => (
              <TableRow
                key={row.id}
                className={`hover:bg-accent cursor-pointer ${
                  idx % 2 === 0
                    ? "bg-background-table-1"
                    : "bg-background-table-2"
                }`}
                data-state={row.getIsSelected() && "selected"}
                onClick={() => onEditTransaction(row.original.id)} // now delegates up
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between p-4">
          <div className="p-2 text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center text-sm">
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <p className="text-muted-foreground">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </p>
              <button
                className="px-3 py-1 border rounded disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Transactions shown:
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                table.setPageSize(Number(e.target.value));
              }}
              className="ml-2 p-1 border rounded"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
