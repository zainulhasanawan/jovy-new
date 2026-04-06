import { NavLink, Outlet } from "react-router-dom";

import { useLogout } from "../hooks/useLogout";

const navigation = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/preview/examples/WelcomeCard", label: "Preview Example" },
];

export default function AppLayout() {
  const { logout, isLoading } = useLogout();

  return (
    <div className="app-shell">
      <header className="app-header">
        <strong>Jovy UI Workspace</strong>

        <nav className="app-nav" aria-label="Primary navigation">
          {navigation.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => logout()}
          className="button-link"
          disabled={isLoading}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
