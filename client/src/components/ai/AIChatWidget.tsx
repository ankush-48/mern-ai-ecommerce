import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Bot, ShoppingCart } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  products?: Product[];
}

const QUICK_PROMPTS = [
  'Minimalist waterproof backpack under ₹3,000',
  'Best ANC wireless headphones for work',
  'Gift ideas for a coffee lover',
  'Ergonomic desk setup accessories',
];

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: 'Hi! I’m Nova, your AI Shopping Concierge. Tell me your budget, style, or use-case and I’ll curate the best picks from our 2,500+ product catalog.',
      products: [],
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg = textToSend.trim();
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
          text: 'I couldn’t connect to Gemini right now—check that GEMINI_API_KEY is configured in server/.env!',
          products: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 flex h-[560px] w-[370px] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl sm:w-[420px]"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-slate-900 via-brand-700 to-indigo-700 px-5 py-4 text-white">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">Nova AI Shopping Concierge</h3>
                  <p className="text-[11px] text-indigo-200">Gemini 2.5 Flash • Live Catalog</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="rounded-xl p-1.5 hover:bg-white/15">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-3.5 overflow-y-auto bg-slate-50 p-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-800 shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {msg.products && msg.products.length > 0 && (
                    <div className="mt-2.5 w-full space-y-2">
                      {msg.products.map((prod) => (
                        <div
                          key={prod._id}
                          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm transition hover:border-brand-500"
                        >
                          <Link
                            to={`/product/${prod._id}`}
                            onClick={() => setOpen(false)}
                            className="flex min-w-0 flex-1 items-center gap-3"
                          >
                            <img
                              src={prod.images?.[0]?.url}
                              alt={prod.name}
                              className="h-12 w-12 rounded-xl object-cover"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-slate-900">{prod.name}</p>
                              <p className="text-xs font-extrabold text-brand-600">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </p>
                            </div>
                          </Link>
                          <button
                            onClick={() => addToCart(prod, 1)}
                            title="Add to Bag"
                            className="rounded-xl bg-slate-900 p-2 text-white hover:bg-brand-600"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {messages.length === 1 && (
                <div className="space-y-1.5 pt-2">
                  <p className="text-[11px] font-semibold text-slate-400">Try asking:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_PROMPTS.map((qp) => (
                      <button
                        key={qp}
                        onClick={() => sendMessage(qp)}
                        className="rounded-full border border-indigo-200 bg-white px-3 py-1 text-[11px] font-medium text-brand-700 hover:bg-indigo-50"
                      >
                        {qp}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-xs font-medium text-brand-600">
                  <Sparkles className="h-4 w-4 animate-spin" />
                  Searching 2,500+ products with Gemini...
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-slate-200 bg-white p-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Nova anything..."
                className="flex-1 rounded-xl bg-slate-100 px-3.5 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-brand-600/20"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen(!open)}
        className="ml-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-600 to-indigo-700 px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-brand-600/30 transition hover:scale-105"
      >
        <MessageSquare className="h-5 w-5" />
        <span>Ask Nova AI</span>
      </button>
    </div>
  );
}
