import React from "react";
import { createBrowserRouter } from "react-router-dom";
import TransactionsPage from "./pages/transactions";
import Layout from "./layout";
import Home from "./home";
import SettingsPage from "./pages/settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: React.createElement(Layout),
    children: [
      {
        path: "/",
        element: React.createElement(Home),
      },
      {
        path: "/transactions",
        element: React.createElement(TransactionsPage),
      },
      {
        path: "/settings",
        element: React.createElement(SettingsPage),
      },
    ],
  },
]);
export default router;
