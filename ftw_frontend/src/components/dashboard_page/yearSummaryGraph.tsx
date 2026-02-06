import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { useTime } from "../context/TimeContext";
import type { YearOverview } from "@/assets/types/TypeOverview";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  desktop: {
    label: "Income",
    color: "var(--income-primary)",
  },
  mobile: {
    label: "Expenses",
    color: "var(--expenses-primary)",
  },
  extra: {
    label: "Savings",
    color: "var(--savings-primary)",
  },
} satisfies ChartConfig;

type ChartData = YearOverview;

export default function ChartBarMultiple({
  chartData,
}: {
  chartData: ChartData;
}) {
  const { activeYear } = useTime();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year overview</CardTitle>
        <CardDescription>Complete overview of {activeYear}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* reduce height (h-40 ≈ 160px); adjust as needed */}
        <ChartContainer config={chartConfig} className="h-80 w-full">
          <BarChart
            accessibilityLayer
            data={chartData.year_overview}
            margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={8}
              axisLine={false}
              tickFormatter={(value) => String(value).slice(0, 3)}
            />
            {/* Y axis with currency formatting and light axis */}
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `€${Number(v).toLocaleString()}`}
            />
            {/* Legend at the top-right */}
            <Legend verticalAlign="top" align="right" height={24} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar dataKey="Income" fill="var(--income-primary)" radius={4} />
            <Bar dataKey="Expenses" fill="var(--expenses-primary)" radius={4} />
            <Bar dataKey="Savings" fill="var(--savings-primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
