import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/assets/types/Transaction";

const dateTimeFormatter = new Intl.DateTimeFormat("nl-BE", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function get_latest_transaction(transactions: Transaction[]) {
  if (transactions.length === 0) return null;
  let latest = transactions[0];
  for (const transaction of transactions) {
    if (transaction.date_executed > latest.date_executed) {
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

interface Props {
  transactions: Transaction[];
}

export default function DateLastTransactionInfoTile({ transactions }: Props) {
  const current_date = new Date();
  const latest_transaction: Transaction | null = get_latest_transaction(transactions);
  const time_passed: number = latest_transaction?.date_executed
    ? get_days_between(latest_transaction.date_executed, current_date)
    : 0;

  return (
    <Card className='flex-1 px-2 '>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Date Last Transaction</CardTitle>
      </CardHeader>
      <CardContent className='-mt-4 text-2xl font-semibold'>
        {latest_transaction ? (
          <div>
            <div className='font-bold pb-1'>
              {dateTimeFormatter.format(latest_transaction.date_executed).split(",")[0]}
            </div>
            <div className='flex font-normal text-base items-center'>({time_passed} days ago)</div>
          </div>
        ) : (
          "No transactions yet"
        )}
      </CardContent>
    </Card>
  );
}
