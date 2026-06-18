import { createBrowserRouter } from "react-router";

import Layout from "../pages/Layout";
import LoginPage from "../pages/Login";
import ForgetPsd from "../pages/ForgetPsd";
import AuthGuard from "../components/AuthGuard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgetPsd />,
  },
]);
