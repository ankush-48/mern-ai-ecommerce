import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function AIReviewSummary({ productId, numReviews }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (numReviews < 3) return;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/ai/review-summary/${productId}`);
        setSummary(data);
      } catch (err) {
        console.error('AI Summary error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [productId, numReviews]);

  if (numReviews < 3) return null;

  return (
    <div className="my-6 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 to-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h3 className="text-base font-bold text-slate-900">AI Customer Review Summary</h3>
        <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
          Based on {numReviews} reviews
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500 animate-pulse">
          Gemini is analyzing customer feedback...
        </p>
      ) : summary ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-slate-700 italic">“{summary.verdict}”</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-emerald-50/70 p-3.5">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <ThumbsUp className="h-3.5 w-3.5" /> What Buyers Love
              </h4>
              <ul className="space-y-1.5 text-sm text-emerald-950">
                {summary.pros?.map((pro, i) => (
                  <li key={i}>• {pro}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-amber-50/70 p-3.5">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" /> Things to Note
              </h4>
              <ul className="space-y-1.5 text-sm text-amber-950">
                {summary.cons?.map((con, i) => (
                  <li key={i}>• {con}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
