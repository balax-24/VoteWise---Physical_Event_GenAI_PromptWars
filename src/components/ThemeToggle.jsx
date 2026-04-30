/**
 * @file ThemeToggle — Animated sun/moon toggle for dark/light mode.
 *
 * @module components/ThemeToggle
 */

import { memo } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

/**
 * @param {Object} props
 * @param {boolean}  props.isDark      - Current theme state
 * @param {Function} props.onToggle    - Toggle callback
 */
const ThemeToggle = memo(function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="relative w-9 h-9 flex items-center justify-center rounded-full bg-surface/10 hover:bg-surface/20 border border-surface/20 transition-colors duration-200"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
    >
      <motion.span
        key={isDark ? 'moon' : 'sun'}
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 90 }}
        transition={{ duration: 0.2 }}
        className="text-lg"
        aria-hidden="true"
      >
        {isDark ? '🌙' : '☀️'}
      </motion.span>
    </button>
  );
});

ThemeToggle.propTypes = {
  isDark: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default ThemeToggle;
