import { useEffect, useState } from "react";
import { Transaction } from "@/assets/types/Transaction";
import { useAccount } from "@/components/context/AccountContext";
import TotalTrackingBalanceInfoTile from "@/components/info_tiles/total_tracking_balance_info_tile";
import NTransactionsInfoTile from "@/components/info_tiles/number_of_transactions_info_tile";
import SelectedPeriodInfoTile from "@/components/info_tiles/selected_period_info_tile";
import { useTime } from "@/components/context/TimeContext";
import TypeSummaryTile from "@/components/dashboard_page/typeSummaryTile";
import YearSummaryGraph from "@/components/dashboard_page/yearSummaryGraph";

import type {
  MonthOverview,
  CategorySummary,
  YearOverview,
} from "@/assets/types/TypeOverview";
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
  const { activeAccount } = useAccount();
  const { activeYear, activeMonth } = useTime();
  const [type_overview_response, setMonthOverviewResponse] = useState<
    MonthOverview[]
  >([]);
  const [year_overview, setYearOverview] = useState<YearOverview>();

  async function get_transactions(
    year: number | null = null,
    month: number | null = null,
  ) {
    let resp;
    if (year && month) {
      resp = await fetch(
        `http://localhost:8000/transaction/?year=${year}&month=${month}`,
        {
          headers: {
            "Content-Type": "application/json",
            "active-account-id": activeAccount?.id.toString() ?? "",
          },
        },
      );
    } else {
      resp = await fetch("http://localhost:8000/transaction", {
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount?.id.toString() ?? "",
        },
      });
    }
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
            t.counterpart_iban,
          ),
      ),
    );
  }

  async function get_totals() {
    if (!activeAccount) return; // Wait until activeAccount is set
    const resp = await fetch(`http://localhost:8000/transaction/total`, {
      headers: {
        "Content-Type": "application/json",
        "active-account-id": activeAccount?.id.toString() ?? "",
      },
    });
    const data = await resp.json();
    setTotals(data);
  }

  async function get_type_month_overview(
    year: number | null = null,
    month: number | null = null,
  ) {
    if (!activeAccount) return; // Wait until activeAccount is set
    const resp = await fetch(
      `http://localhost:8000/type/overview/month/all/?year=${year}&month=${month}`,
      {
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount?.id.toString() ?? "",
        },
      },
    );
    const data = await resp.json();
    console.log("Data: ", data);
    setMonthOverviewResponse(data);
  }

  async function get_type_year_overview(year: number) {
    if (!activeAccount) return; // Wait until activeAccount is set
    const resp = await fetch(
      `http://localhost:8000/type/overview/year/?year=${year}`,
      {
        headers: {
          "Content-Type": "application/json",
          "active-account-id": activeAccount?.id.toString() ?? "",
        },
      },
    );
    const data = await resp.json();

    console.log("Yearoverview: ", data);
    setYearOverview(data);
  }

  useEffect(() => {
    if (activeAccount) {
      get_transactions(activeYear, activeMonth);
      get_totals();
      get_type_month_overview(activeYear, activeMonth);
      get_type_year_overview(activeYear);
    }
  }, [activeAccount, activeYear, activeMonth]);

  return (
    <div className="mx-auto px-6 py-4">
      <div className="flex gap-4">
        <SelectedPeriodInfoTile />
        <TotalTrackingBalanceInfoTile {...totals} />
        <NTransactionsInfoTile transactions={transactions} />
      </div>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4 my-4">
        {type_overview_response
          .slice(0, 4)
          .map(
            ({
              type_name,
              type_overview,
            }: {
              type_name: string;
              type_overview: CategorySummary[];
            }) => (
              <div key={type_name} className="h-full">
                <TypeSummaryTile
                  type_name={type_name}
                  type_overview={type_overview}
                />
              </div>
            ),
          )}
      </div>
      {year_overview && <YearSummaryGraph chartData={year_overview} />}
    </div>
  );
}
