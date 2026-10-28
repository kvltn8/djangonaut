import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../components/ui/Icon';
import { DESIGN_IMAGES } from '../config';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const EMPTY = { username: '', email: '', first_name: '', last_name: '', password: '' };

/** Djoser returns {field: [msgs]} on 400 — surface them next to their inputs. */
const fieldErrors = (e) => (e?.data && typeof e.data === 'object' && !Array.isArray(e.data) ? e.data : {});

function Field({ form, set, fe, k, label, type = 'text', auto, ...rest }) {
  return (
    <div>
      <label className="field-label" htmlFor={k}>{label}</label>
      <input id={k} type={type} required value={form[k]} onChange={set(k)} autoComplete={auto} className="field" aria-invalid={!!fe[k]} {...rest} />
      {fe[k] && <p className="text-error text-label-md normal-case tracking-normal mt-1">{[].concat(fe[k]).join(' ')}</p>}
    </div>
  );
}

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, register, isAuthed } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  const dest = loc.state?.from ?? '/account';

  if (isAuthed) return <Navigate to={dest} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const fe = fieldErrors(err);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    try {
      if (isLogin) await login({ username: form.username, password: form.password });
      else await register(form);
      toast.success(isLogin ? 'Welcome back.' : "Welcome to Kaltun's.");
      nav(dest, { replace: true });
    } catch (ex) { setErr(ex); }
    finally { setBusy(false); }
  };

  const perks = [
    ['local_mall', 'Check out in seconds with saved delivery details'],
    ['inventory_2', 'Follow every order from atelier to doorstep'],
    ['redeem', 'Complimentary gift packaging on every order'],
  ];

  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-7rem)]">
      {/* Visual side */}
      <aside className="relative overflow-hidden bg-primary-container text-surface min-h-[260px] lg:min-h-0">
        <img src={DESIGN_IMAGES.hero} alt="" className="absolute inset-0 w-full h-full object-cover object-[35%_50%] drift" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-container/90 via-primary-container/30 to-transparent" />
        <div className="relative h-full flex flex-col justify-end p-8 lg:p-14 fade-up">
          <p className="label !text-secondary-fixed">Kaltun's Abaya Shop</p>
          <h2 className="font-serif italic text-display-mobile lg:text-display mt-3 max-w-md">{isLogin ? 'Welcome back to quiet luxury' : 'Begin your atelier story'}</h2>
          <ul className="mt-6 space-y-3 max-lg:hidden">
            {perks.map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3 text-surface/90"><Icon name={icon} size={20} className="text-secondary-fixed" />{text}</li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Form side */}
      <div className="flex items-center justify-center px-5 py-12 lg:py-16 bg-gradient-to-b from-background to-surface-container-low">
        <form onSubmit={submit} className="w-full max-w-md space-y-5 fade-up [animation-delay:120ms]">
          <div>
            <p className="label">{isLogin ? 'Sign in' : 'Create your account'}</p>
            <h1 className="font-serif italic text-headline-lg-mobile lg:text-headline-lg mt-2">{isLogin ? 'Good to see you again' : "Join Kaltun's"}</h1>
            <p className="text-on-surface-variant mt-2">{isLogin ? 'Pick up your bag and orders where you left off.' : 'Save your details, track orders and check out faster.'}</p>
          </div>
          {!isLogin && <div className="grid grid-cols-2 gap-4"><Field form={form} set={set} fe={fe} k="first_name" label="First name" auto="given-name" /><Field form={form} set={set} fe={fe} k="last_name" label="Last name" auto="family-name" /></div>}
          <Field form={form} set={set} fe={fe} k="username" label="Username" auto="username" />
          {!isLogin && <Field form={form} set={set} fe={fe} k="email" label="Email" type="email" auto="email" />}
          <Field form={form} set={set} fe={fe} k="password" label="Password" type="password" auto={isLogin ? 'current-password' : 'new-password'} minLength={isLogin ? undefined : 8} />
          {err && !Object.keys(fe).some((k) => k in form) && <p role="alert" className="bg-error-container text-on-error-container px-4 py-3">{err.message}</p>}
          <button disabled={busy} className="btn-primary w-full group">{busy ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}<Icon name="arrow_right_alt" size={20} className="transition-transform group-hover:translate-x-1" /></button>
          <p className="text-center text-on-surface-variant">
            {isLogin ? <>New here? <Link state={loc.state} to="/register" className="text-primary underline underline-offset-4">Create an account</Link></>
              : <>Already a member? <Link state={loc.state} to="/login" className="text-primary underline underline-offset-4">Sign in</Link></>}
          </p>
        </form>
      </div>
    </div>
  );
}
