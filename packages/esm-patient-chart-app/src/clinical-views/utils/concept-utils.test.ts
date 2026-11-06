import { describe, expect, it } from 'vitest';
import { type Encounter } from '../types';
import { withUnit } from './concept-utils';
import { getConceptFromMappings } from './helpers';

describe('withUnit', () => {
  it('adds the unit to a value', () => {
    expect(withUnit(70, 'kg')).toBe('70 kg');
    expect(withUnit('70', 'kg')).toBe('70 kg');
  });

  it('adds the unit to a value of 0', () => {
    expect(withUnit(0, 'kg')).toBe('0 kg');
  });

  it('leaves a value alone when there is no unit', () => {
    expect(withUnit(70, '')).toBe(70);
    expect(withUnit(70, null)).toBe(70);
    expect(withUnit(70, undefined)).toBe(70);
  });

  it('leaves an empty value alone', () => {
    expect(withUnit('--', 'kg')).toBe('--');
    expect(withUnit('', 'kg')).toBe('');
  });
});

describe('getConceptFromMappings', () => {
  const makeEncounter = (...obs: Array<{ uuid: string; value: unknown }>) =>
    ({
      obs: obs.map(({ uuid, value }) => ({
        obsDatetime: '2024-01-01T00:00:00.000+0000',
        concept: { uuid },
        value,
      })),
    }) as unknown as Encounter;

  it('returns the first concept with a value', () => {
    expect(getConceptFromMappings(makeEncounter({ uuid: 'second', value: 5 }), ['first', 'second'])).toBe('second');
  });

  it('counts 0 as a value', () => {
    expect(getConceptFromMappings(makeEncounter({ uuid: 'first', value: 0 }), ['first', 'second'])).toBe('first');
  });

  it('returns null when no concept has a value', () => {
    expect(getConceptFromMappings(makeEncounter({ uuid: 'first', value: null }), ['first', 'second'])).toBeNull();
  });
});
