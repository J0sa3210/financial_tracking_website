import { useEffect, useState } from "react";
import { TransactionTableView } from "@/assets/types/Transaction";
import TransactionTable from "@/components/transaction_page/transaction_table";
import TransactionInfoTiles from "@/components/transaction_page/transaction_info_tiles";
import { useAccount } from "@/components/context/AccountContext";
import TransactionEditDialog from "@/components/transaction_page/transaction_edit_dialog";

interface totalsType {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  total_unaccounted: number;
}

const defaultTotals: totalsType = {
  total_income: 0,
  total_expenses: 0,
  total_savings: 0,
  total_unaccounted: 0,
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionTableView[]>([]);
  const [totals, setTotals] = useState<totalsType>(defaultTotals);
  const [editTransactionId, setEditTransactionId] = useState<number | null>(
    null,
  );
  const { activeAccount } = useAccount();

  async function get_transactions() {
    const resp = await fetch("http://localhost:8000/transaction", {
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount?.id.toString() ?? "",
      },
    });
    const data = await resp.json();
    setTransactions(data.map((t: any) => new TransactionTableView(t)));
  }

  async function get_totals() {
    if (!activeAccount) return; // Wait until activeAccount is set
    const resp = await fetch("http://localhost:8000/transaction/total", {
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount?.id.toString() ?? "",
      },
    });
    const data = await resp.json();
    setTotals(data);
  }

  useEffect(() => {
    if (!activeAccount) return; // Wait until activeAccount is set
    get_transactions();
  }, [activeAccount]);

  useEffect(() => {
    get_totals();
  }, [activeAccount]);

  async function resetTable() {
    get_transactions();
    get_totals();
    setEditTransactionId(null);
    return;
  }

  return (
    <div className="mx-auto px-20 py-4">
      <TransactionInfoTiles transactions={transactions} totals={totals} />

      <TransactionTable
        transactions={transactions}
        onEditTransaction={setEditTransactionId}
        onSaveEdit={resetTable}
      />

      <TransactionEditDialog
        transaction={
          transactions.filter((t: TransactionTableView) => {
            return t.id == editTransactionId;
          })[0]
        }
        onSaveEdit={resetTable}
      />
    </div>
  );
}
