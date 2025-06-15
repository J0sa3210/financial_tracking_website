import NavBar from "./components/navigation/navigation_bar";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className='min-h-screen flex flex-col bg-background text-foreground'>
      <div className='w-full'>
        <NavBar />
      </div>
      <div className='flex-1 container mx-auto px-4 py-6'>
        <Outlet />
      </div>
      <footer className='w-full py-4 text-center text-sm text-muted-foreground'>
        &copy; {new Date().getFullYear()} Financial Tracker
      </footer>
    </div>
  );
}
