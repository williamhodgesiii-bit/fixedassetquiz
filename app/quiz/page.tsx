"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

type QuizQuestion = {
  id: number;
  part: string;
  question: string;
  options: string[];
};

type ReviewItem = {
  id: number;
  part: string;
  question: string;
  options: string[];
  yourChoiceIndex: number;
  correctIndex: number;
  correct: boolean;
  rationale: string;
};

type Result = {
  name: string;
  score: number;
  total: number;
  review: ReviewItem[];
};

export default function QuizPage() {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [current, setCurrent] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  // Require a name; otherwise send the user back to the start page.
  useEffect(() => {
    const saved = sessionStorage.getItem("mph-quiz-name");
    if (!saved) {
      router.replace("/");
      return;
    }
    setName(saved);
  }, [router]);

  // Load the random question set from the server (answers excluded).
  useEffect(() => {
    if (!name) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/quiz", { cache: "no-store" });
        if (!res.ok) throw new Error("bad status");
        const data = await res.json();
        if (!cancelled) setQuestions(data.questions);
      } catch {
        if (!cancelled)
          setLoadError("We couldn't load the quiz. Please refresh to try again.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [name]);

  const total = questions?.length ?? 0;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = total > 0 && answeredCount === total;

  const select = useCallback(
    (qid: number, choiceIndex: number) => {
      setAnswers((prev) => ({ ...prev, [qid]: choiceIndex }));
    },
    []
  );

  async function submit() {
    if (!questions || !name) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        name,
        answers: questions.map((q) => ({
          id: q.id,
          choiceIndex: answers[q.id],
        })),
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed.");
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // ----- Loading / error states -----
  if (loadError) {
    return (
      <Shell>
        <div className="card animate-scale-in p-8 text-center">
          <p className="text-slate-700">{loadError}</p>
          <button
            onClick={() => location.reload()}
            className="btn-primary mt-5"
          >
            Refresh
          </button>
        </div>
      </Shell>
    );
  }

  if (!name || !questions) {
    return (
      <Shell>
        <div className="card flex items-center justify-center gap-3 p-10 text-slate-500">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
          Loading your quiz…
        </div>
      </Shell>
    );
  }

  // ----- Result + review screen -----
  if (result) {
    return <ResultView result={result} />;
  }

  // ----- Quiz screen (one question at a time) -----
  const q = questions[current];
  const progress = (answeredCount / total) * 100;

  return (
    <Shell>
      <div className="animate-fade-in-up">
        {/* Progress */}
        <div className="mb-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-700">
              Question {current + 1}{" "}
              <span className="font-normal text-slate-400">of {total}</span>
            </span>
            <span className="font-medium text-brand-700">
              {answeredCount}/{total} answered
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="card p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {q.part}
          </p>
          <h2 className="mt-2 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
            {q.question}
          </h2>

          <div className="mt-6 space-y-3">
            {q.options.map((opt, idx) => {
              const selected = answers[q.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => select(q.id, idx)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    selected
                      ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                      : "border-slate-200 bg-white hover:border-brand-300 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`flex h-6 w-6 flex-none items-center justify-center rounded-full border text-xs font-bold transition ${
                      selected
                        ? "border-brand-600 bg-brand-600 text-white"
                        : "border-slate-300 text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span
                    className={`text-sm sm:text-base ${
                      selected ? "font-medium text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="btn-secondary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Back
          </button>

          {current < total - 1 ? (
            <button
              type="button"
              onClick={() => setCurrent((c) => Math.min(total - 1, c + 1))}
              className="btn-primary"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={!allAnswered || submitting}
              className="btn-primary"
            >
              {submitting ? "Submitting…" : "Submit Quiz"}
            </button>
          )}
        </div>

        {!allAnswered && current === total - 1 && (
          <p className="mt-3 text-center text-sm text-amber-600">
            Answer all {total} questions to submit. You still have{" "}
            {total - answeredCount} to go.
          </p>
        )}
        {submitError && (
          <p className="mt-3 text-center text-sm text-rose-600">{submitError}</p>
        )}

        {/* Question jump grid */}
        <div className="mt-7">
          <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
            Jump to question
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {questions.map((qq, idx) => {
              const isCurrent = idx === current;
              const isAnswered = answers[qq.id] !== undefined;
              return (
                <button
                  key={qq.id}
                  type="button"
                  onClick={() => setCurrent(idx)}
                  aria-label={`Go to question ${idx + 1}`}
                  className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                    isCurrent
                      ? "bg-brand-600 text-white shadow"
                      : isAnswered
                      ? "bg-brand-100 text-brand-700 hover:bg-brand-200"
                      : "bg-white text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:py-12">
      <header className="mb-8">
        <Logo />
      </header>
      {children}
    </main>
  );
}

function ResultView({ result }: { result: Result }) {
  const pct = Math.round((result.score / result.total) * 100);
  const tone =
    pct >= 80
      ? { label: "Excellent!", color: "text-emerald-600", ring: "ring-emerald-200", bg: "bg-emerald-50" }
      : pct >= 60
      ? { label: "Good effort!", color: "text-brand-600", ring: "ring-brand-200", bg: "bg-brand-50" }
      : { label: "Keep reviewing!", color: "text-amber-600", ring: "ring-amber-200", bg: "bg-amber-50" };

  return (
    <Shell>
      <div className="animate-fade-in-up space-y-5">
        {/* Score hero */}
        <div className={`card p-8 text-center ${tone.bg}`}>
          <p className="text-sm font-medium text-slate-600">
            Nice work, {result.name.split(" ")[0]}!
          </p>
          <div className="mt-3 flex items-baseline justify-center gap-1">
            <span className="text-6xl font-extrabold tracking-tight text-slate-900">
              {result.score}
            </span>
            <span className="text-2xl font-semibold text-slate-400">
              / {result.total}
            </span>
          </div>
          <p className={`mt-2 text-lg font-semibold ${tone.color}`}>
            {pct}% · {tone.label}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
            Review your answers below. Each one shows the correct choice and a
            short explanation to lock in the concept.
          </p>
        </div>

        {/* Review */}
        <div className="space-y-4">
          {result.review.map((item, i) => (
            <div key={item.id} className="card overflow-hidden">
              <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Q{i + 1} · {item.part}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      item.correct
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.correct ? "Correct" : "Incorrect"}
                  </span>
                </div>
                <h3 className="mt-1.5 text-sm font-semibold text-slate-900 sm:text-base">
                  {item.question}
                </h3>
              </div>

              <div className="space-y-2 p-5">
                {item.options.map((opt, idx) => {
                  const isCorrect = idx === item.correctIndex;
                  const isYours = idx === item.yourChoiceIndex;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50"
                          : isYours
                          ? "border-rose-300 bg-rose-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
                          isCorrect
                            ? "bg-emerald-600 text-white"
                            : isYours
                            ? "bg-rose-500 text-white"
                            : "bg-slate-200 text-slate-500"
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span
                        className={
                          isCorrect
                            ? "font-medium text-emerald-900"
                            : isYours
                            ? "font-medium text-rose-900"
                            : "text-slate-600"
                        }
                      >
                        {opt}
                        {isCorrect && (
                          <span className="ml-1.5 text-xs font-semibold text-emerald-600">
                            ✓ Correct answer
                          </span>
                        )}
                        {isYours && !isCorrect && (
                          <span className="ml-1.5 text-xs font-semibold text-rose-600">
                            Your answer
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}

                <div className="mt-3 rounded-lg bg-slate-50 p-3.5 text-sm leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-100">
                  <span className="font-semibold text-slate-700">Why:</span>{" "}
                  {item.rationale}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card p-6 text-center">
          <p className="text-sm font-medium text-slate-700">
            That&apos;s a wrap — thanks for taking the quiz! 🎉
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Your response has been recorded. You can close this tab now.
          </p>
        </div>
      </div>
    </Shell>
  );
}
