import { describe, expect, it } from 'vitest';

import { checkCreditCard } from '../src/ValidateCard';
import { CARD_BRANDS } from '../src/internal/CardBrands';
import {
  validateCardNumber,
  validateForBrand,
} from '../src/internal/CardNumber';

function withLuhnCheckDigit(prefix: string, length: number): string {
  const body = prefix.padEnd(length - 1, '0');
  for (let digit = 0; digit <= 9; digit += 1) {
    const candidate = `${body}${digit}`;
    if (checkLuhn(candidate)) return candidate;
  }
  throw new Error('Unable to generate test number');
}

function checkLuhn(value: string): boolean {
  let checksum = 0;
  let multiplier = 1;
  for (let index = value.length - 1; index >= 0; index -= 1) {
    let result = Number(value[index]) * multiplier;
    if (result > 9) result -= 9;
    checksum += result;
    multiplier = multiplier === 1 ? 2 : 1;
  }
  return checksum % 10 === 0;
}

describe('checkCreditCard characterization and correctness', () => {
  it.each([
    ['4111111111111111', 'Visa'],
    ['5555555555554444', 'MasterCard'],
    ['378282246310005', 'AmEx'],
    ['6011111111111117', 'Discover'],
    ['3530111333300000', 'JCB'],
    ['38520000023237', 'DinersClub'],
    [withLuhnCheckDigit('300', 14), 'CarteBlanche'],
    [withLuhnCheckDigit('2014', 15), 'enRoute'],
    [withLuhnCheckDigit('6334', 18), 'Solo'],
    [withLuhnCheckDigit('564182', 16), 'Switch'],
    [withLuhnCheckDigit('5018', 15), 'Maestro'],
    [withLuhnCheckDigit('6706', 17), 'LaserCard'],
  ])('accepts existing %s behavior as %s', (number, type) => {
    expect(checkCreditCard(number)).toEqual({
      message: null,
      success: true,
      type,
    });
  });

  it('removes spaces before validation', () => {
    expect(checkCreditCard('4111 1111 1111 1111')).toMatchObject({
      success: true,
      type: 'Visa',
    });
  });

  it.each([
    ['', 'No card number provided'],
    ['4111', 'Credit card number is in invalid format'],
    ['4111111111111112', 'Credit card number is in invalid format'],
    [withLuhnCheckDigit('9', 16), 'Credit card number is invalid'],
    [
      withLuhnCheckDigit('6706', 13),
      'Credit card number has an inappropriate number of digits',
    ],
  ])('returns the existing error for %j', (number, message) => {
    expect(checkCreditCard(number)).toEqual({
      message,
      success: false,
      type: null,
    });
  });

  it('classifies Visa Electron numbers as Visa due to card ordering', () => {
    expect(checkCreditCard(withLuhnCheckDigit('4026', 16))).toMatchObject({
      success: true,
      type: 'Visa',
    });
  });

  it('rejects Mastercard 2-series numbers in the legacy rules', () => {
    expect(checkCreditCard(withLuhnCheckDigit('2221', 16))).toMatchObject({
      success: false,
      message: 'Credit card number is invalid',
    });
  });

  it('rejects the hardcoded number from the initial repository commit', () => {
    const legacyBlockedNumber = ['5490', '9977', '7109', '2064'].join('');
    expect(checkCreditCard(legacyBlockedNumber)).toMatchObject({
      success: false,
      message:
        'Warning! This credit card number is associated with a scam attempt',
    });
  });

  it('rejects a 15-digit Visa prefix instead of borrowing the AmEx length', () => {
    expect(checkCreditCard(withLuhnCheckDigit('4', 15))).toMatchObject({
      success: false,
      type: null,
      message: 'Credit card number has an inappropriate number of digits',
    });
  });

  it('rejects a 19-digit Visa prefix instead of borrowing the Solo length', () => {
    expect(checkCreditCard(withLuhnCheckDigit('4', 19))).toMatchObject({
      success: false,
      type: null,
      message: 'Credit card number has an inappropriate number of digits',
    });
  });

  it('selects a real overlapping Switch candidate without borrowing Solo rules', () => {
    expect(checkCreditCard(withLuhnCheckDigit('4903', 18))).toMatchObject({
      success: true,
      type: 'Switch',
    });
  });

  it.each([
    ['50', 16, null],
    ['51', 16, 'MasterCard'],
    ['55', 16, 'MasterCard'],
    ['56', 16, null],
    ['34', 15, 'AmEx'],
    ['35', 16, 'JCB'],
    ['36', 16, 'DinersClub'],
    ['63', 16, null],
    ['64', 16, 'Discover'],
    ['65', 16, 'Discover'],
    ['66', 16, null],
  ] as const)('preserves prefix boundary %s', (prefix, length, type) => {
    expect(checkCreditCard(withLuhnCheckDigit(prefix, length))).toMatchObject({
      success: type !== null,
      type,
    });
  });

  it.each([
    ['', '4111111111111111'],
    ['4111111111111111', '4111111111111112'],
    ['4111111111111112', '4111111111111111'],
    ['5555555555554444', '378282246310005'],
    [withLuhnCheckDigit('4', 15), '5555555555554444'],
    ['378282246310005', withLuhnCheckDigit('4', 19)],
  ])('isolates repeated validation after %j', (first, second) => {
    const expected = checkCreditCard(second);
    for (let repeat = 0; repeat < 3; repeat += 1) {
      checkCreditCard(first);
      expect(checkCreditCard(second)).toEqual(expected);
    }
  });

  it.each([
    withLuhnCheckDigit('4', 15),
    withLuhnCheckDigit('4', 19),
    withLuhnCheckDigit('4903', 18),
    withLuhnCheckDigit('4026', 16),
    withLuhnCheckDigit('55', 16),
    withLuhnCheckDigit('6304', 16),
  ])('is independent of candidate evaluation order for %s', (number) => {
    const expected = validateCardNumber(number);
    expect(validateCardNumber(number, [...CARD_BRANDS].reverse())).toEqual(
      expected,
    );
    expect(
      validateCardNumber(number, [...CARD_BRANDS.slice(1), CARD_BRANDS[0]]),
    ).toEqual(expected);
  });

  it('requires the same brand to satisfy both prefix and length', () => {
    const amEx = {
      brand: 'AmEx' as const,
      lengths: [15],
      prefixes: ['34', '37'],
      precedence: 4,
    };
    expect(validateForBrand(withLuhnCheckDigit('4', 15), amEx)).toBe(false);
    expect(validateForBrand(withLuhnCheckDigit('37', 16), amEx)).toBe(false);
    expect(validateForBrand('378282246310005', amEx)).toBe(true);
  });

  it.each(['4111111111111111', '5555555555554444', '378282246310005'])(
    'preserves Luhn rejection for every incorrect check digit of %s',
    (validNumber) => {
      for (let digit = 0; digit <= 9; digit += 1) {
        if (String(digit) === validNumber.at(-1)) continue;
        expect(checkCreditCard(`${validNumber.slice(0, -1)}${digit}`)).toEqual({
          success: false,
          type: null,
          message: 'Credit card number is in invalid format',
        });
      }
    },
  );

  it('retains the global rejection of 12-digit Maestro numbers', () => {
    expect(checkCreditCard(withLuhnCheckDigit('5018', 12))).toMatchObject({
      success: false,
      message: 'Credit card number is in invalid format',
    });
  });
});
