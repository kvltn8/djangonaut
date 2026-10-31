/**
 * Accepts 07XXXXXXXX, 01XXXXXXXX, 2547XXXXXXXX or +2547XXXXXXXX (spaces and dashes ignored)
 * and returns the 10-digit local form PayFlow expects (07XXXXXXXX), or null if it is not a valid Safaricom number.
 * If PayFlow ever needs the 2547... form instead, change it here, in one place.
 */
export function toLocalPhone(input = '') {
  let d = String(input).replace(/[\s\-().]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  if (/^254[17]\d{8}$/.test(d)) d = `0${d.slice(3)}`;
  return /^0[17]\d{8}$/.test(d) ? d : null;
}

/** M-Pesa only takes whole shillings. */
export const wholeShillings = (n) => Math.round(Number(n) || 0);
