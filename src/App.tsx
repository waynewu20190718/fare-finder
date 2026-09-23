import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";

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
      { path: "/sign-in", element: <AuthPage key="signin" mode="signin" /> },
      { path: "/sign-up", element: <AuthPage key="signup" mode="signup" /> },
      { path: "/reset-password", element: <ResetPassword /> },
      {
        element: <RequireAuth />,
        children: [{ path: "/app", element: <Dashboard /> }],
      },
      // Legacy paths kept as redirects so old links and bookmarks still work.
      { path: "/auth", element: <Navigate to="/sign-in" replace /> },
      { path: "/dashboard", element: <Navigate to="/app" replace /> },
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
