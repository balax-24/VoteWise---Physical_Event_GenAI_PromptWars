/**
 * @file Navbar — Persistent top navigation bar.
 *
 * Renders a sticky desktop nav and a compact mobile bottom strip.
 * Active route is highlighted via `aria-current="page"`.
 * Includes dark/light theme toggle and language switcher.
 *
 * @module components/Navbar
 */

import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../config/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../hooks/useTheme';

const Navbar = memo(function Navbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  return (
    <nav className="bg-primary text-surface shadow-md sticky top-0 z-50" role="navigation" aria-label="Main Navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" aria-label="VoteWise Home">
              <span className="text-2xl" role="img" aria-label="Ballot Box">🗳️</span>
              <span className="font-display text-xl font-bold tracking-wide text-accent">VoteWise</span>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActive
                        ? 'bg-accent text-primary'
                        : 'text-surface hover:bg-surface/10 hover:text-accent'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden flex justify-around bg-primary-dark py-2 border-t border-primary/20" role="navigation" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`text-xs px-2 py-1 rounded ${
                isActive ? 'text-accent font-bold' : 'text-surface/80 hover:text-accent'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

export default Navbar;
