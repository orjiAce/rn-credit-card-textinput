export type CardBrand =
  | 'Visa'
  | 'MasterCard'
  | 'DinersClub'
  | 'CarteBlanche'
  | 'AmEx'
  | 'Discover'
  | 'JCB'
  | 'enRoute'
  | 'Solo'
  | 'Switch'
  | 'Maestro'
  | 'VisaElectron'
  | 'LaserCard';

export interface CardBrandMetadata {
  readonly brand: CardBrand;
  readonly prefixes: readonly string[];
  readonly lengths: readonly number[];
  /** Retains the published overlap precedence even if metadata is reordered. */
  readonly precedence: number;
}

/**
 * Rules from published 1.1.6. They intentionally remain historical in Phase 3.
 */
export const CARD_BRANDS: readonly CardBrandMetadata[] = [
  {
    brand: 'Visa',
    prefixes: ['4'],
    lengths: [13, 16],
    precedence: 0,
  },
  {
    brand: 'MasterCard',
    prefixes: ['51', '52', '53', '54', '55'],
    lengths: [16],
    precedence: 1,
  },
  {
    brand: 'DinersClub',
    prefixes: ['36', '38', '54', '55'],
    lengths: [14, 16],
    precedence: 2,
  },
  {
    brand: 'CarteBlanche',
    prefixes: ['300', '301', '302', '303', '304', '305'],
    lengths: [14],
    precedence: 3,
  },
  {
    brand: 'AmEx',
    prefixes: ['34', '37'],
    lengths: [15],
    precedence: 4,
  },
  {
    brand: 'Discover',
    prefixes: ['6011', '622', '64', '65'],
    lengths: [16],
    precedence: 5,
  },
  {
    brand: 'JCB',
    prefixes: ['35'],
    lengths: [16],
    precedence: 6,
  },
  {
    brand: 'enRoute',
    prefixes: ['2014', '2149'],
    lengths: [15],
    precedence: 7,
  },
  {
    brand: 'Solo',
    prefixes: ['6334', '6767'],
    lengths: [16, 18, 19],
    precedence: 8,
  },
  {
    brand: 'Switch',
    prefixes: [
      '4903',
      '4905',
      '4911',
      '4936',
      '564182',
      '633110',
      '6333',
      '6759',
    ],
    lengths: [16, 18, 19],
    precedence: 9,
  },
  {
    brand: 'Maestro',
    prefixes: ['5018', '5020', '5038', '6304', '6759', '6761', '6762', '6763'],
    lengths: [12, 13, 14, 15, 16, 18, 19],
    precedence: 10,
  },
  {
    brand: 'VisaElectron',
    prefixes: ['4026', '417500', '4508', '4844', '4913', '4917'],
    lengths: [16],
    precedence: 11,
  },
  {
    brand: 'LaserCard',
    prefixes: ['6304', '6706', '6771', '6709'],
    lengths: [16, 17, 18, 19],
    precedence: 12,
  },
];
