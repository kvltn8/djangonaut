import { CURRENCY } from '../config';

const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY });
const fmt0 = new Intl.NumberFormat('en-US', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 });
export const moneyShort = (n) => fmt0.format(Number(n) || 0);
export const money = (n) => fmt.format(Number(n) || 0);

export const ORDER_STATUS = {
  P: { label: 'Pending', tone: 'bg-secondary-container text-on-secondary-fixed' },
  A: { label: 'Approved', tone: 'bg-primary-fixed text-on-primary-fixed' },
  C: { label: 'Completed', tone: 'bg-primary-container text-surface' },
  F: { label: 'Failed', tone: 'bg-error-container text-on-error-container' },
};
