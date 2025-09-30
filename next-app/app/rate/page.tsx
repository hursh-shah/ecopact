"use client";

import { useState, type FormEvent } from "react";

type EcoBreakdown = {
  energy_consumption: string;
  electricity_usage: string;
  gasoline_usage: string;
  water_usage: string;
  emission_levels: string;
  recyclability: string;
  biodegradability: string;
  recycled_materials_percentage: string;
  toxicity: string;
  materials: string[];
};

type Alternative = {
  name: string;
  scoreLabel: string;
  score?: number;
  materials?: string;
  link?: string;
  recyclability?: string;
  recycledPercentage?: string;
  biodegradability?: string;
  isRenewed?: boolean;
};

export default function RatePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    productName: string;
    isRenewed?: boolean;
    productType?: string | null;
    eco: { score: number; label: string; breakdown: EcoBreakdown };
    alternatives: Alternative[];
  } | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rate product");
      setResult(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="space-y-6">
      <div className="container-card p-6">
        <h2 className="mb-2 text-lg font-semibold">Rate an Amazon product</h2>
        <p className="mb-4 text-sm text-gray-600">
          Paste a product URL from Amazon. We will estimate its environmental impact and suggest greener alternatives.
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            className="input flex-1"
            placeholder="https://www.amazon.com/..."
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Analyzing…" : "Analyze"}
          </button>
        </form>
        {error && (
          <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200">{error}</div>
        )}
      </div>

      {result && (
        <div className="space-y-6">
          <div className="container-card p-6">
            <div className="mb-2 text-xs uppercase tracking-wide text-gray-500">Product</div>
            <h3 className="text-lg font-semibold">{result.productName}</h3>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              {result.productType && <span className="rounded bg-gray-100 px-2 py-1 ring-1 ring-gray-200">Type: {result.productType}</span>}
              {typeof result.isRenewed === "boolean" && (
                <span className="rounded bg-gray-100 px-2 py-1 ring-1 ring-gray-200">{result.isRenewed ? "Renewed / Refurbished" : "New (likely)"}</span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-3">
              <span className="inline-flex items-center rounded-md bg-eco/10 px-2 py-1 text-sm font-medium text-eco ring-1 ring-eco/30">
                Eco score: {result.eco.score} / 6 ({result.eco.label})
              </span>
            </div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(result.eco.breakdown).map(([k, v]) => (
                <div key={k} className="rounded-md border border-gray-200 p-3">
                  <div className="text-xs font-medium text-gray-500">{k.replaceAll("_", " ")}</div>
                  <div className="text-sm">{Array.isArray(v) ? v.join(", ") : String(v)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="container-card p-6">
            <h4 className="mb-4 text-base font-semibold">Greener alternatives</h4>
            {result.alternatives.length === 0 ? (
              <p className="text-sm text-gray-600">No close alternatives found in our catalog.</p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {result.alternatives.map((alt, idx) => (
                  <li key={`${alt.name}-${idx}`} className="rounded-md border border-gray-200 p-4 hover:border-eco/50 transition-colors">
                    <div className="font-medium text-gray-900 line-clamp-2">{alt.name}</div>
                    
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center rounded-md bg-eco/10 px-2 py-0.5 text-xs font-medium text-eco ring-1 ring-eco/30">
                        {alt.score !== undefined ? `${alt.score}/6` : alt.scoreLabel}
                      </span>
                      {alt.isRenewed && (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-blue-200">
                          Renewed
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                      {alt.materials && (
                        <div className="flex items-start gap-1">
                          <span className="font-medium text-gray-700">Materials:</span>
                          <span className="flex-1">{alt.materials}</span>
                        </div>
                      )}
                      {alt.recycledPercentage && (
                        <div className="flex items-start gap-1">
                          <span className="font-medium text-gray-700">Recycled:</span>
                          <span className="flex-1">{alt.recycledPercentage}</span>
                        </div>
                      )}
                      {alt.recyclability && (
                        <div className="flex items-start gap-1">
                          <span className="font-medium text-gray-700">Recyclability:</span>
                          <span className="flex-1">{alt.recyclability}</span>
                        </div>
                      )}
                      {alt.biodegradability && (
                        <div className="flex items-start gap-1">
                          <span className="font-medium text-gray-700">Biodegradable:</span>
                          <span className="flex-1">{alt.biodegradability}</span>
                        </div>
                      )}
                    </div>

                    {alt.link && (
                      <a 
                        className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-eco hover:underline" 
                        href={alt.link} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        View on Amazon
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
