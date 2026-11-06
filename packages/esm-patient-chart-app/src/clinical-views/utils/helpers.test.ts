import { describe, expect, it } from 'vitest';
import { type ConfigConcepts, type Encounter } from '../types';
import { getObsFromEncounter } from './helpers';

const OTHER_CONCEPT_UUID = 'other-concept-uuid';
const PRIMARY_CONCEPT_UUID = 'primary-concept-uuid';
const SECONDARY_CONCEPT_UUID = 'secondary-concept-uuid';

const config = { otherConceptUuid: OTHER_CONCEPT_UUID } as ConfigConcepts;

const codedObs = (conceptUuid: string, valueUuid: string, display: string) => ({
  obsDatetime: '2024-01-01T00:00:00.000+0000',
  concept: { uuid: conceptUuid },
  value: { uuid: valueUuid, name: { display }, names: [{ display }] },
});

const makeEncounter = (...obs: Array<unknown>) => ({ obs }) as unknown as Encounter;

const getValue = (encounter: Encounter) =>
  getObsFromEncounter({
    encounter,
    obsConcept: PRIMARY_CONCEPT_UUID,
    secondaryConcept: SECONDARY_CONCEPT_UUID,
    config,
  });

describe('getObsFromEncounter with a secondary concept', () => {
  it('returns -- when the encounter has no observation for the concept', () => {
    expect(getValue(makeEncounter())).toBe('--');
  });

  it('returns the secondary value when the answer is the other concept', () => {
    const encounter = makeEncounter(codedObs(PRIMARY_CONCEPT_UUID, OTHER_CONCEPT_UUID, 'Other'), {
      obsDatetime: '2024-01-01T00:00:00.000+0000',
      concept: { uuid: SECONDARY_CONCEPT_UUID },
      value: 'Typed in by the clinician',
    });

    expect(getValue(encounter)).toBe('Typed in by the clinician');
  });

  it('returns -- when the answer is the other concept and there is no secondary value', () => {
    expect(getValue(makeEncounter(codedObs(PRIMARY_CONCEPT_UUID, OTHER_CONCEPT_UUID, 'Other')))).toBe('--');
  });

  it('returns the answer when it is not the other concept', () => {
    expect(getValue(makeEncounter(codedObs(PRIMARY_CONCEPT_UUID, 'yes-concept-uuid', 'Yes')))).toBe('Yes');
  });
});
