import { Transaction } from "@/assets/types/Transaction";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface totalsType {
  total_income: number;
  total_expenses: number;
  total_savings: number;
}

interface TransactionProps {
  transactions: Transaction[];
  totals: totalsType;
}

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

export default function TransactionInfoTiles(
  transactionProps: TransactionProps
) {
  const transactions: Transaction[] = transactionProps.transactions;
  const totals: totalsType = transactionProps.totals;

  const current_date = new Date();

  const latest_transaction: Transaction | null =
    get_latest_transaction(transactions);

  const time_passed: number = latest_transaction?.dateTime_executed
    ? get_days_between(latest_transaction!.dateTime_executed, current_date)
    : 0;

  return (
    <div className='rounded-lg py-2 pb-6'>
      <div className='flex gap-4'>
        <Card className='flex-1 px-2'>
          <CardHeader>
            <CardTitle>
              <div className='text-2xl font-bold'>Total Tracking Balance</div>
            </CardTitle>
          </CardHeader>
          <CardContent className='-mt-4 text-xl'>
            <div className='flex gap-10'>
              <span className='font-bold'>
                {currencyFormatter.format(
                  totals?.total_income - totals?.total_expenses
                )}
              </span>
              <span className='flex font-normal text-base items-center'>
                (
                {currencyFormatter.format(
                  totals?.total_income -
                    totals?.total_expenses +
                    totals?.total_savings
                )}{" "}
                with savings)
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className='flex-1 px-2 '>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              N° of Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className='-mt-4 text-xl'>
            <div className='flex gap-28'>
              <span className='font-bold'>{transactions.length}</span>
              <span className='flex font-normal text-base items-center'>
                ({get_n_transactions_this_year(transactions)} this year)
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className='flex-1 px-2 '>
          <CardHeader>
            <CardTitle className='text-2xl font-bold'>
              Date Last Transaction
            </CardTitle>
          </CardHeader>
          <CardContent className='-mt-4 text-xl font-semibold'>
            {latest_transaction ? (
              <div className='flex gap-9'>
                <span className='font-bold'>
                  {
                    dateTimeFormatter
                      .format(latest_transaction.dateTime_executed)
                      .split(",")[0]
                  }
                </span>
                <span className='flex font-normal text-base items-center'>
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
  );
}
