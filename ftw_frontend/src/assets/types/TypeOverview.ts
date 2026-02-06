export type CategorySummary = {
  category_name: string;
  category_amount: number;
};

export type MonthOverview = {
  type_name: string;
  type_overview: CategorySummary[];
};

export type YearOverview = {
  year_overview: Map<string, any>[];
};
