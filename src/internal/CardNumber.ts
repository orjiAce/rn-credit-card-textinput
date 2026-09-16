import { CARD_BRANDS, CardBrand, CardBrandMetadata } from './CardBrands';

export type CardValidationStatus =
  | 'empty'
  | 'invalid-format'
  | 'invalid-checksum'
  | 'blocked'
  | 'unsupported-brand'
  | 'invalid-length'
  | 'valid';

export type CardValidationResult =
  | {
      readonly valid: true;
      readonly status: 'valid';
      readonly brand: CardBrand;
      readonly message: null;
    }
  | {
      readonly valid: false;
      readonly status: Exclude<CardValidationStatus, 'valid'>;
      readonly brand: null;
      readonly message: string;
    };

const MESSAGES = {
  empty: 'No card number provided',
  invalidFormat: 'Credit card number is in invalid format',
  unsupportedBrand: 'Credit card number is invalid',
  invalidLength: 'Credit card number has an inappropriate number of digits',
  blocked: 'Warning! This credit card number is associated with a scam attempt',
} as const;

// Published 1.1.6 contains this unexplained exception. Preserve it until its
// provenance and compatibility policy are resolved.
const LEGACY_BLOCKED_CARD_NUMBER = '5490997771092064';

export function normalizeCardNumber(value: string): string {
  return value.replace(/\s/g, '');
}

export function formatCardNumber(value: string): string {
  return value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ');
}

export function hasValidLuhnChecksum(value: string): boolean {
  let checksum = 0;
  let multiplier = 1;

  for (let index = value.length - 1; index >= 0; index -= 1) {
    let result = Number(value.charAt(index)) * multiplier;
    if (result > 9) result -= 9;
    checksum += result;
    multiplier = multiplier === 1 ? 2 : 1;
  }

  return checksum % 10 === 0;
}

export function detectCardBrands(
  normalizedNumber: string,
  metadata: readonly CardBrandMetadata[] = CARD_BRANDS,
): CardBrandMetadata[] {
  return metadata.filter(({ prefixes }) =>
    prefixes.some((prefix) => normalizedNumber.startsWith(prefix)),
  );
}

/** Prefix/length checks after the caller's global format and Luhn validation. */
export function validateForBrand(
  normalizedNumber: string,
  metadata: CardBrandMetadata,
): boolean {
  return (
    metadata.prefixes.some((prefix) => normalizedNumber.startsWith(prefix)) &&
    metadata.lengths.includes(normalizedNumber.length)
  );
}

export function validateCardNumber(
  value: string,
  metadata: readonly CardBrandMetadata[] = CARD_BRANDS,
): CardValidationResult {
  if (value.length === 0) return invalid('empty', MESSAGES.empty);

  const normalizedNumber = normalizeCardNumber(value);
  if (!/^[0-9]{13,19}$/.test(normalizedNumber)) {
    return invalid('invalid-format', MESSAGES.invalidFormat);
  }
  if (!hasValidLuhnChecksum(normalizedNumber)) {
    return invalid('invalid-checksum', MESSAGES.invalidFormat);
  }
  if (normalizedNumber === LEGACY_BLOCKED_CARD_NUMBER) {
    return invalid('blocked', MESSAGES.blocked);
  }

  const candidates = detectCardBrands(normalizedNumber, metadata);
  if (candidates.length === 0) {
    return invalid('unsupported-brand', MESSAGES.unsupportedBrand);
  }

  const brand = candidates.reduce<CardBrandMetadata | undefined>(
    (preferred, candidate) => {
      if (!validateForBrand(normalizedNumber, candidate)) return preferred;
      return !preferred || candidate.precedence < preferred.precedence
        ? candidate
        : preferred;
    },
    undefined,
  );
  if (!brand) return invalid('invalid-length', MESSAGES.invalidLength);

  return { valid: true, status: 'valid', brand: brand.brand, message: null };
}

function invalid(
  status: Exclude<CardValidationStatus, 'valid'>,
  message: string,
): CardValidationResult {
  return { valid: false, status, brand: null, message };
}
