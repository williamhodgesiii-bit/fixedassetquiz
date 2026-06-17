"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

type Respondent = {
  name: string;
  choiceIndex: number;
  correct: boolean;
  submittedAt: string;
};

type BreakdownItem = {
  id: number;
  part: string;
  question: string;
  options: string[];
  yourChoiceIndex: number;
  correctIndex: number;
  correct: boolean;
};

type SubmissionItem = {
  id: string;
  name: string;
  score: number;
  total: number;
  submittedAt: string;
  breakdown: BreakdownItem[];
};

type AnalyticsItem = {
  id: number;
  part: string;
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  appeared: number;
  correct: number;
  correctRate: number | null;
  respondents: Respondent[];
};

type AdminData = {
  storage: "redis" | "memory";
  detectedEnvKeys: string[];
  summary: { responses: number; averageScore: number; averagePercent: number };
  submissions: SubmissionItem[];
  analytics: AnalyticsItem[];
};

const letter = (i: number) => String.fromCharCode(65 + i);

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
      "Start a new round? This permanently deletes all recorded responses and " +
        "unlocks every device to take the quiz again. This cannot be undone."
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
        <header className="mb-8 flex items-center justify-between gap-4">
          <Logo />
          <a href="/" className="btn-secondary">
            Home
          </a>
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
        <div className="flex flex-wrap items-center gap-2">
          <a href="/" className="btn-secondary">
            Home
          </a>
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
            disabled={resetting}
            className="btn-danger"
            title="Delete all responses and start a new round (unlocks every device)"
          >
            {resetting ? "Resetting…" : "Reset / New round"}
          </button>
        </div>
      </header>

      <h1 className="text-2xl font-bold tracking-tight text-slate-900">
        Results &amp; Analytics
      </h1>

      {data.storage === "memory" && (
        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold">⚠️ Results are not being saved permanently</p>
          <p className="mt-1">
            This deployment is using temporary in-memory storage, so submissions
            are lost between requests and won&apos;t reliably appear here. Connect
            Upstash Redis in Vercel (Storage tab) and{" "}
            <strong>redeploy</strong> so the credentials take effect.
          </p>
          <p className="mt-2 text-xs">
            {data.detectedEnvKeys.length > 0 ? (
              <>
                Storage-related variables found in this deployment:{" "}
                <code className="rounded bg-amber-100 px-1">
                  {data.detectedEnvKeys.join(", ")}
                </code>
                . If your URL/token are here under different names, the app now
                auto-detects them — just redeploy.
              </>
            ) : (
              <>
                No Upstash/KV/Redis variables were found in this deployment at
                all — the integration isn&apos;t attached to this project &amp;
                environment, or you haven&apos;t redeployed since adding it.
              </>
            )}
          </p>
        </div>
      )}

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
                Weakest first · click to see who
              </span>
            </div>
            <div className="card divide-y divide-slate-100">
              {analytics.map((a) => (
                <AnalyticsRow key={a.id} a={a} />
              ))}
            </div>
          </section>

          {/* Results list */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                All responses
              </h2>
              <span className="text-xs font-medium text-slate-400">
                Click a person to see their answers
              </span>
            </div>
            <div className="card divide-y divide-slate-100">
              {submissions.map((s) => (
                <SubmissionRow key={s.id} s={s} />
              ))}
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

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 flex-none text-slate-400 transition-transform ${
        open ? "rotate-90" : ""
      }`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.168 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.5 4.25a.75.75 0 0 1 0 1.08l-4.5 4.25a.75.75 0 0 1-1.06-.02Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function AnalyticsRow({ a }: { a: AnalyticsItem }) {
  const [open, setOpen] = useState(false);
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

  const got = a.respondents.filter((r) => r.correct);
  const missed = a.respondents.filter((r) => !r.correct);
  const expandable = a.appeared > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => expandable && setOpen((o) => !o)}
        className={`flex w-full flex-col px-5 py-4 text-left ${
          expandable ? "hover:bg-slate-50/60" : "cursor-default"
        }`}
        aria-expanded={open}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-2">
            {expandable ? (
              <span className="mt-0.5">
                <Chevron open={open} />
              </span>
            ) : (
              <span className="mt-0.5 h-4 w-4 flex-none" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                Q{a.id} · {a.part}
              </p>
              <p className="mt-0.5 text-sm text-slate-700">{a.question}</p>
            </div>
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
      </button>

      {open && expandable && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <p className="mb-3 text-xs text-slate-500">
            Correct answer:{" "}
            <span className="font-semibold text-emerald-700">
              {letter(a.correctIndex)}. {a.options[a.correctIndex]}
            </span>
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <NameList
              title={`Missed it (${missed.length})`}
              tone="rose"
              people={missed.map(
                (r) => `${r.name} — chose ${letter(r.choiceIndex)}`
              )}
              emptyText="No one missed this."
            />
            <NameList
              title={`Got it right (${got.length})`}
              tone="emerald"
              people={got.map((r) => r.name)}
              emptyText="No one got this right."
            />
          </div>
        </div>
      )}
    </div>
  );
}

function NameList({
  title,
  tone,
  people,
  emptyText,
}: {
  title: string;
  tone: "rose" | "emerald";
  people: string[];
  emptyText: string;
}) {
  const dot = tone === "rose" ? "bg-rose-500" : "bg-emerald-500";
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        {title}
      </p>
      {people.length === 0 ? (
        <p className="text-sm text-slate-400">{emptyText}</p>
      ) : (
        <ul className="space-y-1">
          {people.map((p, i) => (
            <li key={i} className="text-sm text-slate-700">
              {p}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SubmissionRow({ s }: { s: SubmissionItem }) {
  const [open, setOpen] = useState(false);
  const pct = Math.round((s.score / s.total) * 100);
  const pctClass =
    pct >= 80
      ? "bg-emerald-100 text-emerald-700"
      : pct >= 60
      ? "bg-brand-100 text-brand-700"
      : "bg-amber-100 text-amber-700";

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left hover:bg-slate-50/60"
        aria-expanded={open}
      >
        <Chevron open={open} />
        <span className="min-w-0 flex-1 font-medium text-slate-800">
          {s.name}
        </span>
        <span className="hidden text-sm text-slate-500 sm:block">
          {new Date(s.submittedAt).toLocaleString()}
        </span>
        <span className="text-sm text-slate-600">
          {s.score}/{s.total}
        </span>
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${pctClass}`}
        >
          {pct}%
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          {s.breakdown.map((b, i) => (
            <div
              key={b.id}
              className={`rounded-lg border px-3.5 py-3 ${
                b.correct
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-rose-200 bg-rose-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-slate-800">
                  {i + 1}. {b.question}
                </p>
                <span
                  className={`flex-none rounded-full px-2 py-0.5 text-xs font-semibold ${
                    b.correct
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-rose-100 text-rose-700"
                  }`}
                >
                  {b.correct ? "Correct" : "Missed"}
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600">
                Their answer:{" "}
                <span
                  className={
                    b.correct
                      ? "font-semibold text-emerald-700"
                      : "font-semibold text-rose-700"
                  }
                >
                  {letter(b.yourChoiceIndex)}. {b.options[b.yourChoiceIndex]}
                </span>
              </p>
              {!b.correct && (
                <p className="mt-1 text-xs text-slate-600">
                  Correct answer:{" "}
                  <span className="font-semibold text-emerald-700">
                    {letter(b.correctIndex)}. {b.options[b.correctIndex]}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
