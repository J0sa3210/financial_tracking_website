import { Transaction } from "@/assets/types/Transaction";

import TotalTrackingBalanceInfoTile from "../info_tiles/total_tracking_balance_info_tile";
import NTransactionsInfoTile from "../info_tiles/number_of_transactions_info_tile";
import DateLastTransactionInfoTile from "../info_tiles/date_last_transaction_info_tile";

interface totalsType {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  total_unaccounted: number;
}

interface TransactionProps {
  transactions: Transaction[];
  totals: totalsType;
}

export default function TransactionInfoTiles(transactionProps: TransactionProps) {
  const transactions: Transaction[] = transactionProps.transactions;
  const totals: totalsType = transactionProps.totals;

  return (
    <div className='rounded-lg py-2'>
      <div className='flex gap-4'>
        <TotalTrackingBalanceInfoTile {...totals} />
        <NTransactionsInfoTile transactions={transactions} />
        <DateLastTransactionInfoTile transactions={transactions} />
      </div>
    </div>
  );
}
