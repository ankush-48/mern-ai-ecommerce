import { useState, useEffect } from 'react';
import { Sparkles, ThumbsUp, AlertCircle } from 'lucide-react';
import api from '../../api/axiosInstance';

export default function AIReviewSummary({
  productId,
  numReviews,
}: {
  productId: string;
  numReviews: number;
}) {
  const [summary, setSummary] = useState<{ pros: string[]; cons: string[]; verdict: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (numReviews < 3) return;
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/ai/review-summary/${productId}`);
        setSummary(data);
      } catch {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [productId, numReviews]);

  if (numReviews < 3) return null;

  return (
    <div className="my-6 rounded-3xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-slate-50 p-6 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Sparkles className="h-5 w-5 text-brand-600" />
        <h3 className="text-base font-extrabold text-slate-900">Gemini AI Buyer Insights</h3>
        <span className="rounded-full bg-brand-600 px-2.5 py-0.5 text-[11px] font-bold text-white">
          Synthesized from {numReviews} reviews
        </span>
      </div>

      {loading ? (
        <p className="text-sm font-medium text-brand-600 animate-pulse">
          Analyzing customer sentiment & extracting Pros and Cons...
        </p>
      ) : summary ? (
        <div className="space-y-4">
          <p className="text-sm font-medium italic text-slate-700">“{summary.verdict}”</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-800">
                <ThumbsUp className="h-3.5 w-3.5" /> Pros — What Buyers Love
              </h4>
              <ul className="space-y-1.5 text-sm text-emerald-950">
                {summary.pros?.map((pro, i) => (
                  <li key={i}>• {pro}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200/70 bg-amber-50/70 p-4">
              <h4 className="mb-2 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-amber-800">
                <AlertCircle className="h-3.5 w-3.5" /> Cons — Things to Note
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
