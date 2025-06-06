import React from "react";
import ReactDOM from "react-dom/client";

import { ChakraProvider } from "@chakra-ui/react";
import basicSystem from "./themes/basic_theme";
import { ThemeProvider } from "next-themes";
import { RouterProvider } from "react-router-dom";
import router from "./router";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ChakraProvider value={basicSystem}>
      <ThemeProvider attribute='class' disableTransitionOnChange>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
