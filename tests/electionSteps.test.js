import { describe, it, expect } from 'vitest';
import { timelinePhases, votingSteps } from '../src/data/electionSteps';

describe('electionSteps data', () => {
  it('should have 7 timeline phases', () => {
    expect(timelinePhases).toHaveLength(7);
  });

  it('each phase should have required fields', () => {
    timelinePhases.forEach((phase) => {
      expect(phase).toHaveProperty('phase');
      expect(phase).toHaveProperty('icon');
      expect(phase).toHaveProperty('description');
      expect(phase).toHaveProperty('color');
      
      expect(typeof phase.phase).toBe('string');
      expect(typeof phase.icon).toBe('string');
      expect(typeof phase.description).toBe('string');
      expect(typeof phase.color).toBe('string');
    });
  });

  it('should have 8 voting steps', () => {
    expect(votingSteps).toHaveLength(8);
  });

  it('each step should have required fields', () => {
    votingSteps.forEach((step) => {
      expect(step).toHaveProperty('id');
      expect(step).toHaveProperty('title');
      expect(step).toHaveProperty('description');
      expect(step).toHaveProperty('icon');
      
      expect(typeof step.id).toBe('number');
      expect(typeof step.title).toBe('string');
      expect(typeof step.description).toBe('string');
      expect(typeof step.icon).toBe('string');
    });
  });
});
