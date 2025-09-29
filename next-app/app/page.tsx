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
  materials?: string;
};

export default function Page() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    productName: string;
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
                {result.alternatives.map((alt) => (
                  <li key={alt.name} className="rounded-md border border-gray-200 p-3">
                    <div className="font-medium">{alt.name}</div>
                    <div className="text-xs text-gray-600">Ranking: {alt.scoreLabel}</div>
                    {alt.materials && <div className="mt-1 text-xs text-gray-600">Materials: {alt.materials}</div>}
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