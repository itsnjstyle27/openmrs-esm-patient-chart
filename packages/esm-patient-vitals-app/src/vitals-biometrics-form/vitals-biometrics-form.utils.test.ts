import { describe, it, expect } from 'vitest';
import { type ConceptMetadata } from '../common';
import { getMuacColorCode, isValueWithinReferenceRange } from './vitals-biometrics-form.utils';

describe('getMuacColorCode', () => {
  it.each([
    // under 5 years
    [4, 11.0, 'red', 'under-5: red below 11.5'],
    [4, 11.5, 'yellow', 'under-5: yellow at 11.5 boundary'],
    [4, 12.5, 'green', 'under-5: green at 12.5 boundary'],
    // 5 to <10 years
    [5, 13.0, 'red', '5-<10y: red below 13.5 (age-boundary case)'],
    [7, 13.5, 'yellow', '5-<10y: yellow at 13.5 boundary'],
    [7, 14.5, 'green', '5-<10y: green at 14.5 boundary'],
    // 10 to <15 years
    [10, 15.0, 'red', '10-<15y: red below 16.0 (age-boundary case)'],
    [12, 16.0, 'yellow', '10-<15y: yellow at 16.0 boundary'],
    [12, 18.5, 'green', '10-<15y: green at 18.5 boundary'],
    // 15 to <18 years
    [15, 18.0, 'red', '15-<18y: red below 18.5 (age-boundary case)'],
    [16, 18.5, 'yellow', '15-<18y: yellow at 18.5 boundary'],
    [16, 21.0, 'green', '15-<18y: green at 21.0 boundary'],
    // 18 years and above (adults)
    [18, 18.0, 'red', '18+: red below 19.0 (age-boundary case)'],
    [20, 19.0, 'yellow', '18+: yellow at 19.0 boundary'],
    [20, 22.0, 'green', '18+: green at 22.0 boundary'],
  ])('age=%i, muac=%fcm -> %s (%s)', (age, muac, expectedColor) => {
    let result = '';
    getMuacColorCode(age, muac, (color) => {
      result = color;
    });
    expect(result).toBe(expectedColor);
  });
});

describe('isValueWithinReferenceRange', () => {
  const metadata = (limits: Partial<ConceptMetadata>) =>
    [{ uuid: 'concept-uuid', ...limits }] as Array<ConceptMetadata>;

  it('checks a value against both absolute limits', () => {
    const concepts = metadata({ lowAbsolute: 10, hiAbsolute: 100 });

    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 9)).toBe(false);
    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 10)).toBe(true);
    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 100)).toBe(true);
    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 101)).toBe(false);
  });

  it('checks a value against the upper limit when it is the only one', () => {
    const concepts = metadata({ lowAbsolute: null, hiAbsolute: 100 });

    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 100)).toBe(true);
    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 101)).toBe(false);
  });

  it('checks a value against the lower limit when it is the only one', () => {
    const concepts = metadata({ lowAbsolute: 10, hiAbsolute: null });

    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 9)).toBe(false);
    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 10)).toBe(true);
  });

  it('accepts any value when the concept has no absolute limits', () => {
    const concepts = metadata({ lowAbsolute: null, hiAbsolute: null });

    expect(isValueWithinReferenceRange(concepts, 'concept-uuid', 1000)).toBe(true);
  });

  it('accepts an empty value or a concept without metadata', () => {
    expect(isValueWithinReferenceRange(metadata({ lowAbsolute: 10, hiAbsolute: 100 }), 'concept-uuid', '')).toBe(true);
    expect(isValueWithinReferenceRange(metadata({}), 'another-concept-uuid', 5)).toBe(true);
  });
});
