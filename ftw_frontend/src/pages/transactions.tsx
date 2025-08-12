import { useEffect, useState } from "react";
import { Transaction } from "@/assets/types/Transaction";
import TransactionTable from "@/components/transaction_page/transaction_table";
import TransactionInfoTiles from "@/components/transaction_page/transaction_info_tiles";
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
              t.transaction_type,
              t.category_id,
              t.category_name,
              t.owner_account_number,
              t.counterpart_name,
              t.counterpart_account_number
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

  return (
    <div className='mx-auto max-w-7xl p-4'>
      <TransactionInfoTiles
        transactions={transactions}
        totals={totals}
      />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
