import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.scss";
import "./assets/styles/global.scss";

import { RouterProvider } from "react-router/dom";
import { ToastProvider } from '@/context/ToastContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { router } from './router'

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
);
