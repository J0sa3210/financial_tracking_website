import { Card, CardContent, CardTitle } from "../ui/card";
import { CategorySummaryGraph } from "./categorySummaryGraph";
interface TypeSummaryTileProps {
  typeName: string;
  typeBreakdown: { category_name: string; category_amount: number }[];
}

export default function TypeSummaryTile({
  typeName,
  typeBreakdown,
}: TypeSummaryTileProps) {
  const typeClassMap: Record<string, string> = {
    Income: `var(--income-primary)`,
    Expenses: `var(--expenses-primary)`,
    Savings: `var(--savings-primary)`,
  };

  const chartData = convertBreakdown();

  function convertBreakdown() {
    const colors = [
      `var(--chart-${typeName.toLowerCase()}-1)`,
      `var(--chart-${typeName.toLowerCase()}-2)`,
      `var(--chart-${typeName.toLowerCase()}-3)`,
      `var(--chart-${typeName.toLowerCase()}-4)`,
      `var(--chart-${typeName.toLowerCase()}-5)`,
      `var(--chart-${typeName.toLowerCase()}-6)`,
    ];

    let chartData = typeBreakdown
      .slice(0, 5)
      .map(({ category_name, category_amount }, index) => ({
        category: category_name,
        amount: category_amount,
        fill: colors[index % colors.length],
      }));

    if (typeBreakdown.length > 5) {
      const othersAmount = typeBreakdown
        .slice(5)
        .reduce(
          (prevValue, currValue) => prevValue + currValue.category_amount,
          0,
        );
      chartData.push({
        category: "Others",
        amount: othersAmount,
        fill: colors[5],
      });
    }

    return chartData;
  }

  return (
    <Card className="w-full min-h-[300px] max-h-[300px] my-4 bg-white shadow-none border border-black border-2 px-4 h-full flex flex-col box-border overflow-hidden">
      <CardContent className="flex justify-between gap-4 flex-1 overflow-auto">
        {/* CHART AREA */}
        <div className="w-1/2">
          <CardTitle
            style={{ color: typeClassMap[typeName] ?? "inherit" }}
            className="text-2xl font-bold mb-2"
          >
            {typeName}
          </CardTitle>
          <CategorySummaryGraph chartData={chartData} />
        </div>
        {/* DETAIL AREA */}
        <div className="flex flex-col justify-between">
          <p className="mb-2 text-lg font-bold">Category details:</p>
          <ul className="flex-grow">
            {chartData
              .slice(0, 5)
              .map(
                ({
                  category,
                  amount,
                  fill,
                }: {
                  category: string;
                  amount: number;
                  fill: string;
                }) => (
                  <li
                    key={category}
                    className="flex gap-6 justify-between items-center"
                  >
                    <div className="flex items-center">
                      <span
                        aria-hidden="true"
                        style={{ backgroundColor: fill }}
                        className="w-3 h-3 rounded-full inline-block mr-3"
                      />
                      <span className="font-semibold">{category}</span>
                    </div>
                    <span>€{amount}</span>
                  </li>
                ),
              )}
            {typeBreakdown.length > 5 && (
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
                  {typeBreakdown
                    .slice(5)
                    .reduce((acc, curr) => acc + curr.category_amount, 0)}
                </span>
              </li>
            )}
          </ul>
          <hr className="border-black border-1 w-full my-2" />
          <div className="flex gap-4 justify-between font-bold">
            <span>Total</span>
            <span>
              €
              {typeBreakdown.reduce(
                (acc, curr) => acc + curr.category_amount,
                0,
              )}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
