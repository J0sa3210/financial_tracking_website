import { Link, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import NavBarButton from "./navigation_bar_link";
import { Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { Account } from "@/assets/types/Account";
import AccountSelector from "./account_selector";

export default function NavBar() {
  const titles = ["Dashboard", "Transactions", "Settings"];
  const links = ["/dashboard", "/transactions", "/settings"];
  const current_path = useLocation().pathname;
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains("dark")
  );
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    async function fetchAccounts() {
      const resp = await fetch("http://localhost:8000/account");
      const data = await resp.json();
      setAccounts(data);
      console.log("Fetched accounts:", data);
    }
    fetchAccounts();
  }, []);

  function toggleDarkMode() {
    document.documentElement.classList.toggle("dark");
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }

  return (
    <nav className="bg-primary min-h-[70px] w-full text-primary-foreground">
      <div className="ml-5 flex items-center h-[70px]">
        <div className="flex-1 max-w-[600px] text-3xl font-cursive font-black">
          <Link to="/">Financial Tracker</Link>
        </div>
        <div className="flex-[3] flex items-center gap-8">
          {titles.map((title, index) => (
            <NavBarButton
              key={index}
              title={title}
              link={links[index]}
              isSelected={links[index] === current_path}
            />
          ))}
        </div>
        <div className="flex-1 flex items-center justify-end pr-5 gap-5">
          <AccountSelector accounts={accounts} />
          <Button
            className="text-foreground rounded-full"
            variant="outline"
            size="icon"
            onClick={() => toggleDarkMode()}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 m-2" />
            ) : (
              <Moon className="w-5 h-5 m-2" />
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
}
