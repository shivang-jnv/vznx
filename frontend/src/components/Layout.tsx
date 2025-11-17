import type { ReactNode } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Layout = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b bg-red">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">VZNX</h1>
            <nav className="flex gap-6 items-center">
              <Link
                to="/"
                className={`text-base font-medium transition-colors ${
                  isActive('/') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Projects
              </Link>
              <Link
                to="/team"
                className={`text-base font-medium transition-colors ${
                  isActive('/team') ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Team
              </Link>
              <div className="flex items-center gap-4 ml-6 pl-6 border-l border-gray-200">
                <span className="text-sm text-gray-700">
                  <span className="font-medium">{user?.name}</span>
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
