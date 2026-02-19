import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Menu, X, Home } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-nav" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3 group" aria-label="PharmaGuard home">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20 group-hover:shadow-lg group-hover:shadow-primary-500/30 transition-shadow">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                PharmaGuard
              </span>
              <span className="text-[10px] font-medium text-primary-600 -mt-0.5 tracking-wide uppercase">
                Genomic Drug Safety AI
              </span>
            </div>
          </Link>

          {/* Desktop right side */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Home className="w-4 h-4" />
              Home
            </Link>
            <span className="text-xs px-2.5 py-1 rounded-full bg-black/[0.04] dark:bg-white/[0.04] text-primary-600 dark:text-primary-400 border border-black/[0.06] dark:border-white/[0.06] font-medium">
              v1.0
            </span>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-black/[0.06] dark:border-white/[0.06] px-4 py-3 flex items-center justify-between glass-nav">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
        </div>
      )}
    </nav>
  );
}
