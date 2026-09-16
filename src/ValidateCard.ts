import { validateCardNumber } from './internal/CardNumber';

/**
 * Legacy deep-import adapter retained for compatibility with published 1.1.6.
 */
export const checkCreditCard: (cardnumber: string | number | any) => {
  message: any;
  success: boolean;
  type: string;
} = (cardnumber) => {
  const result = validateCardNumber(cardnumber);
  return {
    message: result.message,
    success: result.valid,
    // The published declaration says `string`, although invalid runtime results
    // have always returned null. Preserve that deep-import declaration shape.
    type: result.brand as string,
  };
};
