import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, X, Send, Sparkles, Bot } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hi! I’m Nova, your AI shopping assistant. Ask me anything like "Find me a minimalist backpack under ₹3,000" or "Gift ideas for a coffee lover".',
      products: [],
    },
  ]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, text: m.text }));
      const { data } = await api.post('/ai/chat', { message: userMsg, history });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.reply, products: data.products || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Sorry, I had trouble reaching the catalog right now. Please try again!',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <div className="flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:w-[400px] animate-fadeIn">
          <div className="flex items-center justify-between bg-gradient-to-r from-brand-600 to-indigo-700 px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Nova AI Shopping Assistant</h3>
                <p className="text-[11px] text-indigo-100">Powered by Google Gemini</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-white/20">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-800 shadow-sm'
                  }`}
                >
                  {msg.text}
                </div>

                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2 w-full space-y-2">
                    {msg.products.map((prod) => (
                      <Link
                        key={prod._id}
                        to={`/product/${prod._id}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition hover:border-brand-500"
                      >
                        <img
                          src={prod.images?.[0]?.url || 'https://placehold.co/80x80'}
                          alt={prod.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold text-slate-900">
                            {prod.name}
                          </p>
                          <p className="text-xs font-bold text-brand-600">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Sparkles className="h-4 w-4 animate-pulse text-brand-600" />
                Nova is searching the store...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={sendMessage} className="flex border-t border-slate-200 bg-white p-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for product recommendations..."
              className="flex-1 px-3 py-1.5 text-sm outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-brand-700"
        >
          <MessageSquare className="h-5 w-5" />
          <span>Ask Nova AI</span>
        </button>
      )}
    </div>
  );
}
