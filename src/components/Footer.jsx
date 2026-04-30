/**
 * @file Footer — Site-wide footer with navigation and official resource links.
 * @module components/Footer
 */

import { memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { OFFICIAL_LINKS } from '../config/appConfig';
import { NAV_ITEMS } from '../config/navigation';

const Footer = memo(function Footer() {
  /** Compute the copyright year once per render. */
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer className="bg-primary text-surface mt-auto pt-10 pb-6 border-t border-primary/20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-3" aria-label="VoteWise Home">
              <span className="text-2xl" role="img" aria-label="Ballot Box">🗳️</span>
              <span className="font-display text-xl font-bold text-accent">VoteWise</span>
            </Link>
            <p className="text-xs text-surface/60 max-w-xs leading-relaxed">
              Every vote starts with understanding. Your AI-powered civic guide for a better democracy.
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <p className="text-xs font-semibold text-surface/50 uppercase tracking-widest mb-3">Navigate</p>
            <ul className="space-y-2">
              {NAV_ITEMS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-surface/70 hover:text-accent transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* External resources */}
          <div>
            <p className="text-xs font-semibold text-surface/50 uppercase tracking-widest mb-3">Official Resources</p>
            <ul className="space-y-2">
              {[
                { label: 'ECI Voter Portal', href: OFFICIAL_LINKS.eciPortal },
                { label: 'Voter Search', href: OFFICIAL_LINKS.voterSearch },
                { label: 'Know Your Candidate', href: OFFICIAL_LINKS.candidateInfo },
              ].map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-surface/70 hover:text-accent transition-colors duration-200"
                  >
                    {r.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-surface/10 pt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 text-xs text-surface/50">
          <p>© {year} VoteWise. Built for civic empowerment.</p>
          <p className="max-w-sm text-right">
            <strong className="text-surface/70">Disclaimer:</strong> Educational guide only. For official data visit the{' '}
            <a href={OFFICIAL_LINKS.eciPortal} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Election Commission of India
            </a>.
          </p>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
