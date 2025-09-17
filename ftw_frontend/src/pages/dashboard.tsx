import { act, use, useEffect, useState } from "react";
import { Transaction } from "@/assets/types/Transaction";
import { useAccount } from "@/components/context/AccountContext";
import TotalTrackingBalanceInfoTile from "@/components/info_tiles/total_tracking_balance_info_tile";
import NTransactionsInfoTile from "@/components/info_tiles/number_of_transactions_info_tile";
import DateLastTransactionInfoTile from "@/components/info_tiles/date_last_transaction_info_tile";
import SelectedPeriodInfoTile from "@/components/info_tiles/selected_period_info_tile";

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

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totals, setTotals] = useState<totalsType>(defaultTotals);
  const [editTransactionId, setEditTransactionId] = useState<number | null>(null);
  const { activeAccount } = useAccount();

  async function get_transactions() {
    console.log("Fetching transactions for account:", activeAccount);
    const resp = await fetch("http://localhost:8000/transaction", {
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount?.id.toString() ?? "",
      },
    });
    const data = await resp.json();
    setTransactions(
      data.map(
        (t: any) =>
          new Transaction(
            t.id,
            t.value,
            t.description,
            t.date_executed,
            t.transaction_type,
            t.category_id,
            t.category_name,
            t.owner_iban,
            t.counterpart_name,
            t.counterpart_iban
          )
      )
    );
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
    if (activeAccount) {
      get_transactions();
      get_totals();
    }
  }, [activeAccount]);

  return (
    <div className='mx-auto px-6 py-4'>
      <div className='flex gap-4'>
        <SelectedPeriodInfoTile />
        <TotalTrackingBalanceInfoTile {...totals} />
        <NTransactionsInfoTile transactions={transactions} />
      </div>
    </div>
  );
}
