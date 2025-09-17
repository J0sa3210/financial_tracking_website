import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import { RouterProvider } from "react-router-dom";
import router from "./router";
import { AccountProvider } from "./components/context/AccountContext";
import { TimeProvider } from "./components/context/TimeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AccountProvider>
      <TimeProvider>
        <RouterProvider router={router} />
      </TimeProvider>
    </AccountProvider>
  </React.StrictMode>
);
