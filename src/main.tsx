import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import "./assets/styles/global.scss";

import { RouterProvider } from "react-router/dom";
import { router } from './router'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <RouterProvider router={router}>
      </RouterProvider>
  </StrictMode>,
);
