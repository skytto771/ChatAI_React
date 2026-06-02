import { createBrowserRouter } from "react-router";

import Layout from '../pages/Layout'
import LoginPage from '../pages/Login'

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />
    },
    {
        path: '/login',
        element: <LoginPage />
    }
]);