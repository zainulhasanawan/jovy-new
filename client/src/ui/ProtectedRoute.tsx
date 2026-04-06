import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUser } from "../hooks/useUser";

export default function ProtectedRoute() {
  const { isLoading, isAuthenticated } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <section className="page-card">
        <h2>Loading...</h2>
        <p>Checking your session.</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
