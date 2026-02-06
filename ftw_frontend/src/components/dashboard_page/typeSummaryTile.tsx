import { Card, CardContent, CardTitle } from "../ui/card";
import { CategorySummaryGraph } from "./categorySummaryGraph";
import type { CategorySummary } from "@/assets/types/TypeOverview";

export default function TypeSummaryTile({
  type_name,
  type_overview,
}: {
  type_name: string;
  type_overview: CategorySummary[];
}) {
  const typeClassMap: Record<string, string> = {
    Income: `var(--income-primary)`,
    Expenses: `var(--expenses-primary)`,
    Savings: `var(--savings-primary)`,
  };

  const chartData = convertBreakdown();

  function convertBreakdown() {
    const colors = [
      `var(--chart-${type_name.toLowerCase()}-1)`,
      `var(--chart-${type_name.toLowerCase()}-2)`,
      `var(--chart-${type_name.toLowerCase()}-3)`,
      `var(--chart-${type_name.toLowerCase()}-4)`,
      `var(--chart-${type_name.toLowerCase()}-5)`,
      `var(--chart-${type_name.toLowerCase()}-6)`,
    ];

    if (type_overview.length == 0) {
      return [];
    }

    let chartData = type_overview
      .slice(0, 5)
      .map((category_summary: CategorySummary, index: number) => ({
        category_name: category_summary.category_name,
        amount: category_summary.category_amount,
        fill: colors[index % colors.length],
      }));

    if (type_overview.length > 5) {
      const othersAmount = type_overview
        .slice(5)
        .reduce(
          (prevValue, currValue) => prevValue + currValue.category_amount,
          0,
        );
      chartData.push({
        category_name: "Others",
        amount: othersAmount,
        fill: colors[5],
      });
    }

    return chartData;
  }

  return (
    <Card className="w-full min-h-[300px] max-h-[300px] m-0 bg-white shadow-none border border-black border-2 px-4 h-full flex flex-col box-border overflow-hidden">
      {/* CardContent fills remaining height; min-h-0 allows children with overflow to shrink correctly */}
      <CardContent className="flex gap-4 flex-1 min-h-0">
        {/* CHART AREA */}
        <div className="w-1/2">
          <CardTitle
            style={{ color: typeClassMap[type_name] ?? "inherit" }}
            className="text-2xl font-bold mb-2"
          >
            {type_name}
          </CardTitle>
          <CategorySummaryGraph chartData={chartData} />
        </div>
        {/* DETAIL AREA */}
        {/* make this column a flex column that can shrink; the list inside will scroll */}
        <div className="w-1/2 flex flex-col justify-between min-h-0">
          <p className="mb-2 text-lg font-bold">Category details:</p>
          <ul className="flex-1 overflow-auto min-h-0">
            {chartData
              .slice(0, 5)
              .map(
                ({
                  category_name,
                  amount,
                  fill,
                }: {
                  category_name: string;
                  amount: number;
                  fill: string;
                }) => (
                  <li
                    key={category_name}
                    className="flex gap-6 justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: fill }}
                        className="w-3 h-3 rounded-full inline-block mr-3"
                      />
                      <span className="font-semibold">{category_name}</span>
                    </div>
                    <span>€{amount.toFixed(2)}</span>
                  </li>
                ),
              )}
            {type_overview.length > 5 && (
              <li className="flex gap-4 justify-between mt-1 italic items-center ">
                <div className="flex items-center">
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: chartData[5].fill }}
                    className="w-3 h-3 rounded-full inline-block mr-3"
                  />
                  <span className="font-semibold">Others</span>
                </div>
                <span>
                  €
                  {type_overview
                    .slice(5)
                    .reduce((acc, curr) => acc + curr.category_amount, 0)
                    .toFixed(2)}
                </span>
              </li>
            )}
          </ul>
          <hr className="border-black border-1 w-full my-2" />
          <div className="flex gap-4 justify-between font-bold">
            <span>Total</span>
            <span>
              €
              {type_overview
                .reduce((acc, curr) => acc + curr.category_amount, 0)
                .toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
