import { describe, it, expect } from 'vitest';
import { findPersonalIdentifiers, scanFacts, isHighRisk } from '../redaction';

describe('findPersonalIdentifiers', () => {
  it('flags a formatted SSN', () => {
    const f = findPersonalIdentifiers('His SSN is 531-22-9087 on the form.');
    expect(f).toHaveLength(1);
    expect(f[0].kind).toBe('ssn');
    expect(f[0].match).toBe('531-22-9087');
  });

  it('flags a bare nine-digit number as a possible SSN', () => {
    const f = findPersonalIdentifiers('She listed 531229087 in the paperwork.');
    expect(f.map((x) => x.kind)).toContain('ssn');
  });

  it('flags a date of birth only when the context says so', () => {
    expect(findPersonalIdentifiers('DOB 03/14/2015').map((f) => f.kind)).toContain('date_of_birth');
    expect(findPersonalIdentifiers('born on 2015-03-14').map((f) => f.kind)).toContain('date_of_birth');
    // A bare date in a narrative is the normal way to describe an event.
    expect(findPersonalIdentifiers('On 03/14/2015 he did not appear.')).toHaveLength(0);
  });

  it('flags card and account numbers', () => {
    expect(findPersonalIdentifiers('card 4111 1111 1111 1111').map((f) => f.kind)).toContain(
      'financial_account',
    );
    expect(findPersonalIdentifiers('account no. 883920117').map((f) => f.kind)).toContain(
      'financial_account',
    );
  });

  it('flags phone numbers and emails as judgement calls', () => {
    expect(findPersonalIdentifiers('call (206) 555-0143').map((f) => f.kind)).toContain('phone');
    expect(findPersonalIdentifiers('email a@b.com').map((f) => f.kind)).toContain('email');
    expect(isHighRisk('phone')).toBe(false);
    expect(isHighRisk('ssn')).toBe(true);
  });

  it('does not double-report overlapping matches', () => {
    const f = findPersonalIdentifiers('SSN 531-22-9087');
    expect(f).toHaveLength(1);
  });

  it('returns nothing for ordinary narrative text', () => {
    expect(
      findPersonalIdentifiers('The other parent missed three consecutive scheduled visits.'),
    ).toHaveLength(0);
  });

  it('handles empty input', () => {
    expect(findPersonalIdentifiers('')).toHaveLength(0);
  });

  it('reports findings in document order', () => {
    const f = findPersonalIdentifiers('email a@b.com and SSN 531-22-9087');
    expect(f[0].index).toBeLessThan(f[1].index);
  });
});

describe('scanFacts', () => {
  it('reports only the facts that contain identifiers', () => {
    const hits = scanFacts([
      { id: '1', desc: 'Nothing sensitive here.' },
      { id: '2', desc: 'SSN 531-22-9087' },
    ]);
    expect(hits).toHaveLength(1);
    expect(hits[0].factId).toBe('2');
  });
});
