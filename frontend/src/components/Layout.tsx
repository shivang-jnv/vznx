import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050911] transition-colors duration-300">
      <header className="bg-white/90 dark:bg-[#0A0E1A]/90 backdrop-blur border-b border-gray-200 dark:border-[#1a1f2e] shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              VZNX
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Architecting Creative Flow</p>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-2 text-sm text-white font-medium bg-gray-100/60 dark:bg-[#111528] rounded-full px-3 py-1.5">
              {[
                { label: 'Projects', path: '/projects' },
                { label: 'Team', path: '/team' }
              ].map((item) => {
                const active =
                  item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-1.5 rounded-full transition-all cursor-pointer ${
                      active
                        ? 'bg-white dark:bg-[#1c2440] text-blue-600 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-4 border-l border-gray-200 dark:border-[#1a1f2e] pl-4">
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name ?? 'Analyst'}</p>
              </div>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
              >
                Logout
              </button>

              <button
                onClick={toggleDarkMode}
                className="relative w-16 h-8 bg-gray-300 dark:bg-[#1a1f2e] rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                aria-label="Toggle theme"
              >
                <div
                  className={`absolute top-1 left-1 w-6 h-6 rounded-full shadow-lg transform transition-all duration-300 flex items-center justify-center text-sm ${
                    darkMode ? 'translate-x-8 bg-blue-500 text-white' : 'translate-x-0 bg-yellow-400'
                  }`}
                >
                  {darkMode ? '🌙' : '☀️'}
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
