import { describe, expect, it } from 'vitest';

import { formatCardDateString, numberWithSpace } from '../src/NumberWithSpaces';

describe('numberWithSpace characterization', () => {
  it.each([
    ['', ''],
    ['4242', '4242 '],
    ['4242424242424242', '4242 4242 4242 4242 '],
    ['4242 4242-4242', '4242 4242 4242 '],
  ])('formats %j as %j', (input, expected) => {
    expect(numberWithSpace(input)).toBe(expected);
  });

  it('preserves letters and underscores (documented legacy behavior)', () => {
    expect(numberWithSpace('4242_abcd')).toBe('4242 _abc d');
  });
});

describe('formatCardDateString characterization', () => {
  it.each([
    ['', ''],
    ['1', '1'],
    ['2', '02/'],
    ['12', '12/'],
    ['13', '01/3'],
    ['99', '99'],
    ['123', '1/23'],
    ['1299', '12/99'],
    ['0225', '02/25'],
    ['02/25', '02/25'],
    ['2/25', '2/25'],
    ['/', ''],
    ['1/2', '1/2'],
    ['12/345', '12/345'],
    ['12a25', '1225'],
  ])('formats %j as %j', (input, expected) => {
    expect(formatCardDateString(input)).toBe(expected);
  });
});
