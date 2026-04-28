import '@testing-library/jest-dom';

// Polyfill IntersectionObserver for framer-motion useInView
class IntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe(element) {
    if (this.callback) {
      this.callback([{ isIntersecting: true, target: element }]);
    }
  }
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(global, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

// Polyfill scrollIntoView for jsdom
Element.prototype.scrollIntoView = function() {};
