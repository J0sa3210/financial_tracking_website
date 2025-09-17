import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("nl-BE", {
  style: "currency",
  currency: "EUR",
});

interface Props {
  total_income: number;
  total_expenses: number;
  total_savings: number;
  total_unaccounted: number;
}

export default function TotalTrackingBalanceInfoTile(props: Props) {
  const { total_income, total_expenses, total_savings, total_unaccounted } = props;
  return (
    <Card className='flex-1 px-2'>
      <CardHeader>
        <CardTitle>
          <div className='text-2xl font-bold'>Total Tracking Balance</div>
        </CardTitle>
      </CardHeader>
      <CardContent className='-mt-4 text-2xl'>
        <div className={`font-bold pb-1 ${total_unaccounted !== 0 ? "text-red-500" : "text-front"}`}>
          {currencyFormatter.format(total_income + total_expenses + total_savings)}
        </div>
        <div className={`text-base`}>({currencyFormatter.format(total_income + total_expenses)} with savings)</div>
      </CardContent>
    </Card>
  );
}
