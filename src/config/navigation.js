/**
 * @file Shared navigation configuration.
 * Single source of truth for route definitions used by Navbar and Footer.
 * @module config/navigation
 */

/**
 * @typedef {Object} NavItem
 * @property {string} name  - Display label for the link
 * @property {string} path  - React Router path
 */

/** @type {NavItem[]} */
export const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'How to Vote', path: '/how-to-vote' },
  { name: 'Timeline', path: '/timeline' },
  { name: 'Find Booth', path: '/find-booth' },
  { name: 'Lab', path: '/learning-lab' },
  { name: 'Chat', path: '/chat' },
];
