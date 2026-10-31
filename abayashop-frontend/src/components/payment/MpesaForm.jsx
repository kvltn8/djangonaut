import { useState } from 'react';
import Icon from '../ui/Icon';
import { money } from '../../lib/format';
import { payWithMpesa } from '../../api/payments';
import { toLocalPhone, wholeShillings } from '../../lib/mpesa';

/**
 * Stand-alone "Pay with M-Pesa" form. The amount is a prop (it comes from the order total the shop API calculated),
 * so the customer can see it but never type or change it.
 */
export default function MpesaForm({ amount, defaultPhone = '', onSent }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [status, setStatus] = useState('idle'); // idle | sending | pushed | error
  const [error, setError] = useState('');
  const shillings = wholeShillings(amount);

  const pay = async (e) => {
    e.preventDefault();
    const local = toLocalPhone(phone);
    if (!local) { setStatus('error'); setError('Enter a valid Safaricom number, for example 0712345678.'); return; }
    setStatus('sending'); setError('');
    try {
      await payWithMpesa({ phone: local, amount: shillings });
      setStatus('pushed'); onSent?.(local);
    } catch (ex) { setStatus('error'); setError(ex.message); }
  };

  return (
    <form onSubmit={pay} className="bg-surface-container-low p-5 rounded-xl space-y-4" noValidate>
      <div className="flex items-center justify-between">
        <span className="field-label !mb-0">Amount to pay</span>
        <span className="text-title-lg text-primary" aria-live="polite">{money(shillings)}</span>
      </div>
      <div>
        <label className="field-label" htmlFor="mpesa-phone">M-Pesa number</label>
        <input id="mpesa-phone" inputMode="tel" autoComplete="tel-national" placeholder="07XXXXXXXX" value={phone}
          onChange={(e) => setPhone(e.target.value)} className="field" aria-invalid={status === 'error'} />
      </div>
      {status === 'pushed' && <p role="status" className="flex gap-2 text-on-surface-variant"><Icon name="smartphone" size={20} className="text-secondary" />Check your phone and enter your M-Pesa PIN to complete the payment.</p>}
      {status === 'error' && <p role="alert" className="bg-error-container text-on-error-container px-4 py-3 rounded">{error}</p>}
      <button type="submit" disabled={status === 'sending' || shillings < 1} className="btn-primary w-full rounded-lg">
        {status === 'sending' ? 'Sending request…' : status === 'pushed' ? 'Send the prompt again' : 'Pay with M-Pesa'}
      </button>
    </form>
  );
}
