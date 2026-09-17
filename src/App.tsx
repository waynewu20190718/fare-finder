import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

import { RequireAuth } from "@/components/RequireAuth";
import { NotFound } from "@/components/NotFound";
import { RouteError } from "@/components/RouteError";
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import ResetPassword from "@/pages/ResetPassword";
import { PasswordRecoveryWatcher } from "@/components/PasswordRecoveryWatcher";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    element: (
      <>
        <PasswordRecoveryWatcher />
        <Outlet />
      </>
    ),
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        element: <RequireAuth />,
        children: [{ path: "/dashboard", element: <Dashboard /> }],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
