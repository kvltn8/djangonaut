import { PAYFLOW_URL } from '../config';

/** Turns whatever PayFlow replied with into one readable sentence. */
function messageFrom(data) {
  const fallback = 'The M-Pesa request could not be started. Please try again.';
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  const first = data.detail ?? data.message ?? data.error ?? Object.values(data).find((v) => typeof v === 'string' || Array.isArray(v));
  return first ? [].concat(first).join(' ') : fallback;
}

/**
 * Sends the M-Pesa prompt (STK push) to the customer's phone through PayFlow.
 * This is a different server from the shop API, so it is a plain fetch: the shop's login token is never sent to it.
 * Resolves when the prompt was sent (the customer still has to enter their PIN); rejects with a readable message.
 */
export async function payWithMpesa({ phone, amount }) {
  if (!Number.isInteger(amount) || amount < 1) throw new Error('There is nothing to pay for this order.');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 45_000); // PayFlow can be slow to wake up
  let res;
  try {
    res = await fetch(PAYFLOW_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone, amount: String(amount) }),
      signal: ctrl.signal,
    });
  } catch (e) {
    throw new Error(e.name === 'AbortError'
      ? 'The payment service took too long to respond. Please try again.'
      : 'Could not reach the payment service. Check your connection and try again.');
  } finally { clearTimeout(timer); }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(messageFrom(data));
  return data;
}
