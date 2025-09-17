import { act, createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

const TimeContext = createContext<{
  activeYear: number;
  activeMonth: number;
  setNewActiveYear: (year: number) => void;
  setNewActiveMonth: (month: number) => void;
}>({
  activeYear: 2020,
  activeMonth: 0,
  setNewActiveYear: () => {},
  setNewActiveMonth: () => {},
});

export function TimeProvider({ children }: { children: ReactNode }) {
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1);

  function setNewActiveYear(year: number) {
    setActiveYear(year);
    console.log("Active period set to", activeMonth + "/" + activeYear);
  }

  function setNewActiveMonth(month: number) {
    setActiveMonth(month);
    console.log("Active period set to", activeMonth + "/" + activeYear);
  }

  return (
    <TimeContext.Provider value={{ activeYear, activeMonth, setNewActiveYear, setNewActiveMonth }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  return useContext(TimeContext);
}
