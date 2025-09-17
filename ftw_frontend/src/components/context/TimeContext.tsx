import { createContext, useContext, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { ReactNode } from "react";

const TimeContext = createContext<{
  activeYear: number;
  activeMonth: number;
  setActiveYear: Dispatch<SetStateAction<number>>;
  setActiveMonth: Dispatch<SetStateAction<number>>;
}>({
  activeYear: 2020,
  activeMonth: 0,
  setActiveYear: async () => {},
  setActiveMonth: async () => {},
});

export function TimeProvider({ children }: { children: ReactNode }) {
  const [activeYear, setActiveYear] = useState<number>(new Date().getFullYear());
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth() + 1);

  return (
    <TimeContext.Provider value={{ activeYear, activeMonth, setActiveYear, setActiveMonth }}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  return useContext(TimeContext);
}
