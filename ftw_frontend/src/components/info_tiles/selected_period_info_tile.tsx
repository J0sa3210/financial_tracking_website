import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function SelectedPeriodInfoTile() {
  const MONTHS = [
    { name: "Total Year", value: 0 },
    { name: "January", value: 1 },
    { name: "February", value: 2 },
    { name: "March", value: 3 },
    { name: "April", value: 4 },
    { name: "May", value: 5 },
    { name: "June", value: 6 },
    { name: "July", value: 7 },
    { name: "August", value: 8 },
    { name: "September", value: 9 },
    { name: "October", value: 10 },
    { name: "November", value: 11 },
    { name: "December", value: 12 },
  ];

  const START_YEAR = 2020;
  const CURRENT_YEAR = new Date().getFullYear();
  const YEARS = Array.from({ length: CURRENT_YEAR - START_YEAR + 1 }, (_, i) => (START_YEAR + i).toString());

  const [selectedMonth, setSelectedMonth] = useState(MONTHS[0].value);
  const [selectedYear, setSelectedYear] = useState(YEARS[YEARS.length - 1]);
  return (
    <Card className='flex-1 px-2 '>
      <CardHeader>
        <CardTitle className='text-2xl font-bold'>Selected Year & Period</CardTitle>
      </CardHeader>
      <CardContent className='-mt-4 text-2xl font-semibold'>
        <div className='flex gap-3'>
          <div className='flex flex-col items-center text-xl'>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className='rounded-full px-4 py-2 font-semibold border-2 border-gray-600'>
              {MONTHS.map((month) => (
                <option
                  key={month.value}
                  value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>
          <div className='flex flex-col items-center text-xl'>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className='rounded-full px-4 py-2 font-semibold border-2 border-gray-600 w-full'>
              {YEARS.map((year) => (
                <option
                  key={year}
                  value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
