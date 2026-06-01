import { createBrowserRouter } from "react-router";

import Layout from '../pages/Layout'



export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />
    },
]);