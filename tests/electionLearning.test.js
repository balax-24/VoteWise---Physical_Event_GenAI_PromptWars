/**
 * @file Election learning helper tests.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  buildPersonalizedJourney,
  calculateReadiness,
  createCalendarContent,
  downloadTextFile,
  readinessTasks,
} from '../src/data/electionLearning';

describe('electionLearning helpers', () => {
  it('builds a personalized journey for first-time voters who need support', () => {
    const plan = buildPersonalizedJourney({
      voterType: 'first-time',
      registrationStatus: 'not-registered',
      idStatus: 'not-ready',
      supportNeed: 'pwd',
    });

    expect(plan.map((item) => item.title)).toEqual(expect.arrayContaining([
      'Confirm or complete registration',
      'Prepare an accepted photo ID',
      'Plan assistance early',
      'Practice the booth flow',
      'Learn the election timeline',
      'Create polling-day checklist',
    ]));
  });

  it('builds a shorter journey for registered returning voters', () => {
    const plan = buildPersonalizedJourney({
      voterType: 'returning',
      registrationStatus: 'registered',
      idStatus: 'ready',
      supportNeed: 'none',
    });

    expect(plan[0].title).toBe('Verify electoral roll details');
    expect(plan.map((item) => item.title)).not.toContain('Practice the booth flow');
  });

  it('calculates readiness percentage from completed task ids', () => {
    expect(calculateReadiness([])).toBe(0);
    expect(calculateReadiness(readinessTasks.map((task) => task.id))).toBe(100);
  });

  it('creates a calendar payload with plan details', () => {
    const plan = [{ title: 'Check roll', detail: 'Search official portal.' }];
    const content = createCalendarContent(plan, new Date('2026-05-01T00:00:00.000Z'));

    expect(content).toContain('BEGIN:VCALENDAR');
    expect(content).toContain('SUMMARY:Review VoteWise election readiness plan');
    expect(content).toContain('Check roll');
  });

  it('downloads generated text files through an object URL', () => {
    const appendChild = vi.spyOn(document.body, 'appendChild');
    const createObjectURL = vi.fn(() => 'blob:votewise');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();
    const originalUrl = globalThis.URL;
    const originalCreateElement = document.createElement.bind(document);

    globalThis.URL = { createObjectURL, revokeObjectURL };
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const element = originalCreateElement(tagName);
      if (tagName === 'a') element.click = click;
      return element;
    });

    downloadTextFile('plan.txt', 'hello');

    expect(createObjectURL).toHaveBeenCalled();
    expect(appendChild).toHaveBeenCalled();
    expect(click).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:votewise');

    globalThis.URL = originalUrl;
  });
});
