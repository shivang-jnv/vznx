import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050911] transition-colors duration-300">
      <header className="bg-white/90 dark:bg-[#0A0E1A]/90 backdrop-blur border-b border-gray-200 dark:border-[#1a1f2e] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <Link to="/" className="no-underline">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                VZNX
              </h1>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Architecting Creative Flow
            </p>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100/60 dark:bg-[#111528] rounded-full px-3 py-1.5">
              {[
                { label: "Projects", path: "/projects" },
                { label: "Team", path: "/team" },
              ].map((item) => {
                const active =
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.path);

                const activeClasses = darkMode
                  ? "bg-[#1c2440] text-blue-300 shadow-sm"
                  : "bg-white text-blue-600 shadow-sm";

                const inactiveClasses = darkMode
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900";

                const linkClass = `px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                  active ? activeClasses : inactiveClasses
                }`;

                return (
                  <Link key={item.path} to={item.path} className={linkClass}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 border-l border-gray-200 dark:border-[#1a1f2e] pl-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Signed in as
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name ?? "Analyst"}
                </p>
              </div>
              <button
                onClick={logout}
                aria-label="Logout"
                title="Logout"
                className="p-2 rounded-md text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4.5A1.5 1.5 0 014.5 3h6A1.5 1.5 0 0112 4.5v3a.75.75 0 01-1.5 0v-3c0-.276-.224-.5-.5-.5h-6a.5.5 0 00-.5.5v11c0 .276.224.5.5.5h6c.276 0 .5-.224.5-.5v-3a.75.75 0 011.5 0v3A1.5 1.5 0 0110.5 18h-6A1.5 1.5 0 013 16.5v-12z"
                    clipRule="evenodd"
                  />
                  <path d="M15.28 9.22a.75.75 0 010 1.06L13.81 12.75a.75.75 0 11-1.06-1.06l.97-.97H9.5a.75.75 0 010-1.5h4.22l-.97-.97a.75.75 0 111.06-1.06l1.47 1.47z" />
                </svg>
              </button>

              <button
                onClick={toggleDarkMode}
                className="relative w-16 h-8 bg-gray-300 dark:bg-[#1a1f2e] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label="Toggle theme"
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center text-sm ${
                    darkMode
                      ? "translate-x-8 bg-blue-500 text-white"
                      : "translate-x-0 bg-yellow-400"
                  }`}
                >
                  {darkMode ? "🌙" : "☀️"}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
