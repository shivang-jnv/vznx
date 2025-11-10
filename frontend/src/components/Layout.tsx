import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b bg-red">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-4xl font-bold text-gray-900">VZNX</h1>
            <nav className="flex gap-6">
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
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;

