"use client";

export default function Landing() {
  return (
    <main className="relative overflow-hidden">
      <div className="aurora"></div>
      <section className="relative z-10 mx-auto max-w-4xl py-16 text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Shop smarter. Shop greener.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600">
          Ecopact rates Amazon products for environmental impact and recommends greener alternatives.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href="/rate" className="btn btn-primary">Rate an Amazon link</a>
          <a href="https://github.com/hursh-shah/ecopact" target="_blank" rel="noreferrer" className="btn ring-1 ring-gray-300">
            Star on GitHub
          </a>
        </div>
      </section>
      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-4 pb-16 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white/70 p-4 backdrop-blur">
          <div className="text-sm font-medium">Understand impact</div>
          <div className="mt-1 text-sm text-gray-600">Materials, recyclability, toxicity, and more—summarized into a simple eco score.</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white/70 p-4 backdrop-blur">
          <div className="text-sm font-medium">Find greener options</div>
          <div className="mt-1 text-sm text-gray-600">Discover renewed and sustainable alternatives in the same category.</div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white/70 p-4 backdrop-blur">
          <div className="text-sm font-medium">Powered by AI</div>
          <div className="mt-1 text-sm text-gray-600">Gemini + curated signals for fast, practical recommendations.</div>
        </div>
      </section>
    </main>
  );
} 