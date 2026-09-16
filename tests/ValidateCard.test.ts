import { describe, expect, it } from 'vitest';

import { checkCreditCard } from '../src/ValidateCard';

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

describe('checkCreditCard characterization', () => {
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

  it('documents cross-card state leakage for an AmEx-length Visa prefix', () => {
    // Known bug: a Visa prefix remains true while a later 15-digit length matches.
    expect(checkCreditCard(withLuhnCheckDigit('4', 15))).toMatchObject({
      success: true,
      type: 'AmEx',
    });
  });

  it('documents cross-card state leakage for a 19-digit Visa prefix', () => {
    // Known bug: a Visa prefix remains true while Solo supplies the 19-digit length.
    expect(checkCreditCard(withLuhnCheckDigit('4', 19))).toMatchObject({
      success: true,
      type: 'Solo',
    });
  });
});
