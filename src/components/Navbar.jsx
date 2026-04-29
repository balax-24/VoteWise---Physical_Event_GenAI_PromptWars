import { Link, useLocation } from 'react-router-dom';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'How to Vote', path: '/how-to-vote' },
    { name: 'Timeline', path: '/timeline' },
    { name: 'Find Booth', path: '/find-booth' },
    { name: 'Chat', path: '/chat' },
  ];

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
              {navItems.map((item) => {
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

          {/* Language Switcher */}
          <div className="flex items-center">
            <LanguageSwitcher />
          </div>
        </div>
      </div>

      {/* Mobile Menu (Simplified for brevity, but accessible) */}
      <div className="md:hidden flex justify-around bg-primary-dark py-2 border-t border-primary/20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`text-xs px-2 py-1 rounded ${
                isActive ? 'text-accent font-bold' : 'text-surface/80 hover:text-accent'
              }`}
            >
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navbar;
