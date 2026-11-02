import { useCallback, useEffect, useRef, useState } from 'react';
import Icon from '../ui/Icon';
import { sendChat } from '../../api/chat';

const BOT_IMG = '/images/chat-bot.png';
const STORE_KEY = 'abaya.chat';
const MAX_LEN = 500;
const WELCOME = { role: 'bot', text: "Hello! I'm the Kaltun's assistant. Ask me about our abayas, delivery, returns or care." };
const SUGGESTIONS = ['Delivery & shipping', 'Returns policy', 'How do I care for my abaya?'];

const load = () => { try { const m = JSON.parse(sessionStorage.getItem(STORE_KEY)); return Array.isArray(m) && m.length ? m : [WELCOME]; } catch { return [WELCOME]; } };
const save = (m) => { try { sessionStorage.setItem(STORE_KEY, JSON.stringify(m.slice(-40))); } catch { /* storage unavailable */ } };

/** Friendly text for any failure; the server's own message is used when it sent one. */
function friendly(e) {
  if (e?.status === 429) return 'You are sending messages quickly. Please wait a moment and try again.';
  if (e?.data?.Error) return e.data.Error;
  if (e?.status === 0) return e.message;
  // Anything else: show what the server really said, plus the status code, so the cause is visible.
  const why = e?.message && !/^Request failed/.test(e.message) ? e.message : 'The assistant did not respond.';
  return `${why}${e?.status ? ` (error ${e.status})` : ''} Please try again.`;
}

/** Minimal, safe formatting for replies: **bold**, "- " bullets and line breaks (no raw HTML). */
function Formatted({ text }) {
  return text.split('\n').map((line, i) => {
    const bullet = /^\s*[-*•]\s+/.test(line);
    const parts = line.replace(/^\s*[-*•]\s+/, '').split(/(\*\*[^*]+\*\*)/g).map((p, j) => (/^\*\*[^*]+\*\*$/.test(p) ? <strong key={j} className="font-medium">{p.slice(2, -2)}</strong> : p));
    return <p key={i} className={`${bullet ? 'pl-4 relative before:content-["•"] before:absolute before:left-0.5' : ''} ${i ? 'mt-1.5' : ''}`}>{parts}</p>;
  });
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(load);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(null); // last question that errored, for "Try again"
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const session = useRef(0); // bumped on reset so a reply to an old question is ignored

  useEffect(() => { save(messages); }, [messages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy, open]);
  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const ask = useCallback(async (raw) => {
    const message = raw.trim().slice(0, MAX_LEN);
    if (!message || busy) return;
    const mine = session.current;
    setFailed(null); setBusy(true);
    setMessages((m) => (failed === message ? m : [...m, { role: 'user', text: message }]));
    try {
      const { answer } = await sendChat(message);
      if (mine !== session.current) return;
      setMessages((m) => [...m, { role: 'bot', text: answer || 'Sorry, I do not have an answer for that.' }]);
    } catch (e) {
      if (mine !== session.current) return;
      setMessages((m) => [...m, { role: 'bot', text: friendly(e), error: true }]);
      setFailed(message);
    } finally { if (mine === session.current) setBusy(false); }
  }, [busy, failed]);

  /** Start over: clears the conversation, errors and draft, and shows the welcome message again. Not a page reload. */
  const reset = () => {
    session.current += 1;
    setMessages([WELCOME]); setFailed(null); setBusy(false); setInput('');
    try { sessionStorage.removeItem(STORE_KEY); } catch { /* storage unavailable */ }
    inputRef.current?.focus();
  };

  const submit = (e) => { e.preventDefault(); const t = input; setInput(''); ask(t); };
  const onlyWelcome = messages.length === 1;

  return (
    <>
      {/* Chat window */}
      <section role="dialog" aria-label="Chat with Kaltun's assistant" aria-hidden={!open} inert={!open ? '' : undefined}
        className={`fixed z-40 bottom-24 right-4 left-4 sm:left-auto sm:right-6 sm:w-[380px] h-[min(540px,calc(100vh-8rem))] flex flex-col overflow-hidden rounded-2xl bg-surface border border-outline-variant/50 shadow-drawer origin-bottom-right transition-all duration-300 motion-reduce:transition-none ${open ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-3 scale-95 pointer-events-none'}`}>
        <header className="flex items-center gap-3 px-5 py-4 bg-sand border-b border-outline-variant/40">
          <span className="relative w-10 h-10 rounded-full bg-surface flex items-center justify-center shadow-[0_1px_6px_rgba(56,45,40,0.12)]"><img src={BOT_IMG} alt="" className="w-7 h-7 object-contain" /></span>
          <div className="flex-1 min-w-0">
            <p className="font-serif text-title-lg leading-tight text-primary">Kaltun&apos;s Assistant</p>
            <p className="text-label-md normal-case tracking-normal text-on-surface-variant flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />Here to help</p>
          </div>
          <button onClick={reset} disabled={onlyWelcome && !busy && !input} aria-label="Start a new conversation" title="New conversation" className="p-1.5 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-30 disabled:hover:text-on-surface-variant"><Icon name="refresh" size={22} /></button>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="p-1.5 -mr-1.5 text-on-surface-variant hover:text-primary transition-colors"><Icon name="close" size={22} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-3" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] px-4 py-2.5 text-body-md rounded-2xl ${m.role === 'user' ? 'bg-primary-container text-surface rounded-tr-md' : `bg-surface-container-lowest text-on-surface rounded-tl-md shadow-[0_1px_8px_rgba(56,45,40,0.05)] ${m.error ? 'text-error' : ''}`}`}>
                <Formatted text={m.text} />
                {m.error && failed && i === messages.length - 1 && !busy && (
                  <button onClick={() => ask(failed)} className="mt-2 text-label-md uppercase text-secondary underline underline-offset-4">Try again</button>
                )}
              </div>
            </div>
          ))}
          {onlyWelcome && !busy && (
            <div className="flex flex-wrap gap-2 pt-1">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="px-3 py-1.5 rounded-full border border-outline-variant/70 text-body-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors">{s}</button>
              ))}
            </div>
          )}
          {busy && (
            <div className="flex justify-start" aria-label="Assistant is typing">
              <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-surface-container-lowest shadow-[0_1px_8px_rgba(56,45,40,0.05)] flex gap-1.5">
                {[0, 150, 300].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-outline animate-bounce motion-reduce:animate-none" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 p-3 border-t border-outline-variant/40 bg-surface">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} maxLength={MAX_LEN} placeholder="Type your question…" aria-label="Your message" autoComplete="off"
            className="flex-1 min-w-0 bg-surface-container-lowest border border-outline-variant/60 rounded-full px-4 py-2.5 text-body-md placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-container transition-colors" />
          <button disabled={busy || !input.trim()} aria-label="Send message" className="shrink-0 w-10 h-10 rounded-full bg-primary-container text-surface flex items-center justify-center hover:bg-secondary transition-colors disabled:opacity-40 disabled:hover:bg-primary-container"><Icon name="arrow_upward" size={20} /></button>
        </form>
      </section>

      {/* Floating launcher */}
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? 'Close chat' : 'Chat with us'} aria-expanded={open}
        className="group fixed z-40 bottom-5 right-4 sm:right-6 w-[60px] h-[60px] rounded-full bg-surface border border-outline-variant/50 shadow-soft hover:shadow-drawer hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center motion-reduce:transition-none">
        {!open && <span aria-hidden="true" className="absolute inset-0 rounded-full border border-secondary/40 animate-ping [animation-iteration-count:3] motion-reduce:hidden" />}
        <img src={BOT_IMG} alt="" width="256" height="256" className={`absolute w-9 h-9 object-contain transition-all duration-300 ${open ? 'opacity-0 scale-75' : 'opacity-100 scale-100 group-hover:scale-110'}`} />
        <Icon name="close" size={24} className={`absolute text-primary transition-all duration-300 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
        <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-primary-container text-surface text-label-md normal-case tracking-normal px-3 py-1.5 opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all max-sm:hidden">{open ? 'Close' : 'Ask us anything'}</span>
      </button>
    </>
  );
}
