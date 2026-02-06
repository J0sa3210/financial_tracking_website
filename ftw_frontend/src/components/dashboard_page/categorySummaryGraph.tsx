"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ChartData = { category_name: string; amount: number; fill: string }[];

const CHART_PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

export function buildChartConfig(chartData: ChartData) {
  const config: ChartConfig = {
    amount: { label: "Amount" },
  };

  chartData.forEach((d, i) => {
    // create a stable key from the category name (similar to the previous hardcoded keys)
    const key = d.category_name
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    // avoid overwriting the reserved "amount" key
    const finalKey = key === "amount" || key === "" ? `cat_${i}` : key;

    config[finalKey] = {
      label: d.category_name,
      color: CHART_PALETTE[i % CHART_PALETTE.length],
    };
  });

  return config;
}

export function CategorySummaryGraph({ chartData }: { chartData: ChartData }) {
  const totalVisitors = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.amount, 0);
  }, [chartData]);

  const chartConfig = buildChartConfig(chartData);

  return (
    <ChartContainer config={chartConfig} className="aspect-square h-full -mt-4">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="amount"
          nameKey="category"
          innerRadius="65%"
          outerRadius="90%"
          strokeWidth={0}
          isAnimationActive={false}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      €{totalVisitors.toLocaleString()}
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
