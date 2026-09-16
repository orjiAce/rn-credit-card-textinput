import { describe, expect, it } from 'vitest';

import { CARD_BRANDS } from '../src/internal/CardBrands';
import {
  detectCardBrands,
  formatCardNumber,
  hasValidLuhnChecksum,
  normalizeCardNumber,
  validateCardNumber,
  validateForBrand,
} from '../src/internal/CardNumber';

describe('card-number domain', () => {
  it.each([
    ['', ''],
    ['4111 1111', '41111111'],
    [' 4111\t1111\n', '41111111'],
    ['4111-1111', '4111-1111'],
    ['411', '411'],
    ['4111_abcd', '4111_abcd'],
  ])(
    'normalizes %j as %j without changing legacy punctuation',
    (input, expected) => {
      expect(normalizeCardNumber(input)).toBe(expected);
    },
  );

  it.each([
    ['', ''],
    ['4242', '4242 '],
    ['4242424242424242', '4242 4242 4242 4242 '],
    ['4242 4242-4242', '4242 4242 4242 '],
    ['4242_abcd', '4242 _abc d'],
  ])('preserves domain formatting for %j', (input, expected) => {
    expect(formatCardNumber(input)).toBe(expected);
  });

  it('contains the exact published brand order and rules', () => {
    expect(
      CARD_BRANDS.map(({ brand, prefixes, lengths, precedence }) => ({
        brand,
        prefixes: prefixes.join(','),
        lengths: lengths.join(','),
        precedence,
      })),
    ).toEqual([
      { brand: 'Visa', prefixes: '4', lengths: '13,16', precedence: 0 },
      {
        brand: 'MasterCard',
        prefixes: '51,52,53,54,55',
        lengths: '16',
        precedence: 1,
      },
      {
        brand: 'DinersClub',
        prefixes: '36,38,54,55',
        lengths: '14,16',
        precedence: 2,
      },
      {
        brand: 'CarteBlanche',
        prefixes: '300,301,302,303,304,305',
        lengths: '14',
        precedence: 3,
      },
      { brand: 'AmEx', prefixes: '34,37', lengths: '15', precedence: 4 },
      {
        brand: 'Discover',
        prefixes: '6011,622,64,65',
        lengths: '16',
        precedence: 5,
      },
      { brand: 'JCB', prefixes: '35', lengths: '16', precedence: 6 },
      { brand: 'enRoute', prefixes: '2014,2149', lengths: '15', precedence: 7 },
      {
        brand: 'Solo',
        prefixes: '6334,6767',
        lengths: '16,18,19',
        precedence: 8,
      },
      {
        brand: 'Switch',
        prefixes: '4903,4905,4911,4936,564182,633110,6333,6759',
        lengths: '16,18,19',
        precedence: 9,
      },
      {
        brand: 'Maestro',
        prefixes: '5018,5020,5038,6304,6759,6761,6762,6763',
        lengths: '12,13,14,15,16,18,19',
        precedence: 10,
      },
      {
        brand: 'VisaElectron',
        prefixes: '4026,417500,4508,4844,4913,4917',
        lengths: '16',
        precedence: 11,
      },
      {
        brand: 'LaserCard',
        prefixes: '6304,6706,6771,6709',
        lengths: '16,17,18,19',
        precedence: 12,
      },
    ]);
  });

  it('detects every configured prefix for its brand', () => {
    for (const metadata of CARD_BRANDS) {
      for (const prefix of metadata.prefixes) {
        expect(detectCardBrands(prefix).map(({ brand }) => brand)).toContain(
          metadata.brand,
        );
      }
    }
  });

  it.each([
    ['55', ['MasterCard', 'DinersClub']],
    ['4026', ['Visa', 'VisaElectron']],
    ['6304', ['Maestro', 'LaserCard']],
    ['6759', ['Switch', 'Maestro']],
  ])(
    'reports overlapping prefix %s without choosing a winner',
    (number, brands) => {
      expect(detectCardBrands(number).map(({ brand }) => brand)).toEqual(
        brands,
      );
    },
  );

  it.each(['', '2', '3', '6', '60', '601', '9'])(
    'does not invent a candidate for incomplete or unknown prefix %j',
    (number) => {
      expect(detectCardBrands(number)).toEqual([]);
    },
  );

  it('recognizes Visa from its one-digit prefix while input is partial', () => {
    expect(detectCardBrands('4').map(({ brand }) => brand)).toEqual(['Visa']);
  });

  it('validates every configured brand length independently', () => {
    for (const metadata of CARD_BRANDS) {
      for (const length of metadata.lengths) {
        expect(
          validateForBrand(metadata.prefixes[0].padEnd(length, '0'), metadata),
        ).toBe(true);
      }
      const invalidLength = metadata.lengths.includes(17) ? 15 : 17;
      expect(
        validateForBrand(
          metadata.prefixes[0].padEnd(invalidLength, '0'),
          metadata,
        ),
      ).toBe(false);
    }
  });

  it.each([
    ['', 'empty'],
    ['   ', 'invalid-format'],
    ['4111', 'invalid-format'],
    ['4111-1111-1111-1111', 'invalid-format'],
    ['4111111111111112', 'invalid-checksum'],
    [withLuhnCheckDigit('9', 16), 'unsupported-brand'],
    [withLuhnCheckDigit('4', 15), 'invalid-length'],
    ['5490997771092064', 'blocked'],
    ['4111111111111111', 'valid'],
  ] as const)('returns status %s for %j', (number, status) => {
    expect(validateCardNumber(number).status).toBe(status);
  });

  it('preserves brand precedence across reversed and rotated metadata', () => {
    for (const number of [
      withLuhnCheckDigit('55', 16),
      withLuhnCheckDigit('4026', 16),
      withLuhnCheckDigit('6304', 16),
      withLuhnCheckDigit('6759', 16),
    ]) {
      const expected = validateCardNumber(number);
      expect(validateCardNumber(number, [...CARD_BRANDS].reverse())).toEqual(
        expected,
      );
      for (let offset = 1; offset < CARD_BRANDS.length; offset += 1) {
        const rotated = [
          ...CARD_BRANDS.slice(offset),
          ...CARD_BRANDS.slice(0, offset),
        ];
        expect(validateCardNumber(number, rotated)).toEqual(expected);
      }
    }
  });

  it('keeps Luhn checking pure and repeatable', () => {
    const values = ['4111111111111111', '4111111111111112', '5555555555554444'];
    expect(values.map(hasValidLuhnChecksum)).toEqual([true, false, true]);
    expect(values.map(hasValidLuhnChecksum)).toEqual([true, false, true]);
  });
});

function withLuhnCheckDigit(prefix: string, length: number): string {
  const body = prefix.padEnd(length - 1, '0');
  for (let digit = 0; digit <= 9; digit += 1) {
    const candidate = `${body}${digit}`;
    if (hasValidLuhnChecksum(candidate)) return candidate;
  }
  throw new Error('Unable to generate test number');
}
