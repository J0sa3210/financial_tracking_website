import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AccountProvider } from "./components/context/AccountContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountProvider>
      <RouterProvider router={router} />
    </AccountProvider>
  </React.StrictMode>
);
