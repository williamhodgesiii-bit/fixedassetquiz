"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

type AdminData = {
  summary: { responses: number; averageScore: number; averagePercent: number };
  submissions: {
    id: string;
    name: string;
    score: number;
    total: number;
    submittedAt: string;
  }[];
  analytics: {
    id: number;
    part: string;
    question: string;
    appeared: number;
    correct: number;
    correctRate: number | null;
  }[];
};

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });
      if (res.status === 401) throw new Error("Incorrect password.");
      if (!res.ok) throw new Error("Could not load results.");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/results", {
        headers: { "x-admin-key": key },
        cache: "no-store",
      });
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  const [resetting, setResetting] = useState(false);

  async function resetAll() {
    const confirmed = window.confirm(
      "Permanently delete ALL recorded quiz responses? This cannot be undone."
    );
    if (!confirmed) return;
    setResetting(true);
    setError(null);
    try {
      const res = await fetch("/api/results", {
        method: "DELETE",
        headers: { "x-admin-key": key },
      });
      if (!res.ok) throw new Error("Reset failed.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed.");
    } finally {
      setResetting(false);
    }
  }

  function downloadCsv() {
    if (!data) return;
    const rows = [
      ["Name", "Score", "Total", "Percent", "Submitted At"],
      ...data.submissions.map((s) => [
        s.name,
        String(s.score),
        String(s.total),
        `${Math.round((s.score / s.total) * 100)}%`,
        new Date(s.submittedAt).toLocaleString(),
      ]),
    ];
    const csv = rows
      .map((r) =>
        r
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mph-quiz-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ----- Login screen -----
  if (!data) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col px-5 py-8 sm:py-14">
        <header className="mb-8">
          <Logo />
        </header>
        <div className="flex flex-1 flex-col justify-center">
          <div className="card animate-fade-in-up p-7 sm:p-9">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Admin Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Enter the admin password to view quiz results and per-question
              analytics.
            </p>
            <form onSubmit={login} className="mt-6">
              <label
                htmlFor="key"
                className="block text-sm font-medium text-slate-700"
              >
                Admin password
              </label>
              <input
                id="key"
                type="password"
                autoComplete="current-password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="••••••••"
                className="input mt-2"
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-rose-600">{error}</p>
              )}
              <button
                type="submit"
                disabled={loading || !key}
                className="btn-primary mt-6 w-full"
              >
                {loading ? "Checking…" : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  // ----- Dashboard -----
  const { summary, submissions, analytics } = data;
  const empty = summary.responses === 0;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:py-12">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            disabled={loading}
            className="btn-secondary"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button
            onClick={downloadCsv}
            disabled={empty}
            className="btn-primary disabled:cursor-not-allowed"
          >
            Download CSV
          </button>
          <button
            onClick={resetAll}
            disabled={empty || resetting}
            className="btn-danger"
            title="Permanently delete all responses"
          >
            {resetting ? "Resetting…" : "Reset"}
          </button>
        </div>
      </header>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Results &amp; Analytics
      </h1>

      {empty ? (
        <div className="card mt-6 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
              <path
                d="M4 19h16M7 16V9M12 16V6M17 16v-4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            No submissions yet
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Once your team starts taking the quiz, results and per-question
            analytics will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {/* Summary stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Responses"
              value={String(summary.responses)}
            />
            <StatCard
              label="Average score"
              value={`${summary.averageScore.toFixed(1)} / 10`}
            />
            <StatCard
              label="Average percent"
              value={`${Math.round(summary.averagePercent)}%`}
            />
          </div>

          {/* Per-question analytics */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Per-question performance
              </h2>
              <span className="text-xs font-medium text-slate-400">
                Weakest concepts first
              </span>
            </div>
            <div className="card divide-y divide-slate-100">
              {analytics.map((a) => (
                <AnalyticsRow key={a.id} a={a} />
              ))}
            </div>
          </section>

          {/* Results table */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              All responses
            </h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3 font-semibold">Name</th>
                      <th className="px-5 py-3 font-semibold">Score</th>
                      <th className="px-5 py-3 font-semibold">%</th>
                      <th className="px-5 py-3 font-semibold">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {submissions.map((s) => {
                      const pct = Math.round((s.score / s.total) * 100);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60">
                          <td className="px-5 py-3 font-medium text-slate-800">
                            {s.name}
                          </td>
                          <td className="px-5 py-3 text-slate-600">
                            {s.score} / {s.total}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                                pct >= 80
                                  ? "bg-emerald-100 text-emerald-700"
                                  : pct >= 60
                                  ? "bg-brand-100 text-brand-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-500">
                            {new Date(s.submittedAt).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 text-3xl font-bold tracking-tight text-slate-900">
        {value}
      </p>
    </div>
  );
}

function AnalyticsRow({
  a,
}: {
  a: AdminData["analytics"][number];
}) {
  const rate = a.correctRate;
  const barColor =
    rate === null
      ? "bg-slate-300"
      : rate >= 80
      ? "bg-emerald-500"
      : rate >= 60
      ? "bg-brand-500"
      : rate >= 40
      ? "bg-amber-500"
      : "bg-rose-500";

  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            Q{a.id} · {a.part}
          </p>
          <p className="mt-0.5 text-sm text-slate-700">{a.question}</p>
        </div>
        <div className="flex-none text-right">
          <p className="text-lg font-bold text-slate-900">
            {rate === null ? "—" : `${Math.round(rate)}%`}
          </p>
          <p className="text-xs text-slate-400">
            {a.appeared === 0
              ? "not shown yet"
              : `${a.correct}/${a.appeared} correct`}
          </p>
        </div>
      </div>
      <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${rate ?? 0}%` }}
        />
      </div>
    </div>
  );
}
