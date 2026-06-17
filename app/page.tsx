"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);
  // null = still checking; the quiz is one-time per device.
  const [completed, setCompleted] = useState<boolean | null>(null);

  useEffect(() => {
    setCompleted(localStorage.getItem("mph-quiz-done") === "1");
    const saved = sessionStorage.getItem("mph-quiz-name");
    if (saved) setName(saved);
  }, []);

  const trimmed = name.trim();
  const valid = trimmed.length > 0;

  function start(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setTouched(true);
      return;
    }
    sessionStorage.setItem("mph-quiz-name", trimmed);
    router.push("/quiz");
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8 sm:py-14">
      <header className="mb-8 flex items-center justify-between gap-4">
        <Logo />
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 transition hover:bg-brand-50"
        >
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M15.5 2A1.5 1.5 0 0 1 17 3.5v13A1.5 1.5 0 0 1 15.5 18h-11A1.5 1.5 0 0 1 3 16.5v-13A1.5 1.5 0 0 1 4.5 2h11ZM7 14a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm0-4a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm8 4a1 1 0 0 0-1-1H9.5a1 1 0 1 0 0 2H14a1 1 0 0 0 1-1Zm0-4a1 1 0 0 0-1-1H9.5a1 1 0 1 0 0 2H14a1 1 0 0 0 1-1ZM7 6a1 1 0 1 0-2 0 1 1 0 0 0 2 0Zm8 0a1 1 0 0 0-1-1H9.5a1 1 0 0 0 0 2H14a1 1 0 0 0 1-1Z" />
          </svg>
          Results
        </a>
      </header>

      <div className="flex flex-1 flex-col justify-center">
        {completed ? (
          <div className="card animate-fade-in-up p-8 text-center sm:p-10">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8">
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
              You&apos;ve completed the quiz
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-base leading-relaxed text-slate-600">
              Thanks for taking part! Your response has already been recorded, so
              the quiz can only be taken once. You can safely close this tab.
            </p>
          </div>
        ) : (
          <div className="card animate-fade-in-up p-7 sm:p-10">
          <span className="inline-flex items-center rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-inset ring-brand-200">
            Live Huddle Pop Quiz
          </span>

          <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            P&amp;L Line-Item Definitions
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-600">
            A quick knowledge check to reinforce how we define and read the P&amp;L.
            You&apos;ll answer{" "}
            <strong className="font-semibold text-slate-800">
              10 questions
            </strong>{" "}
            drawn at random, then see your score with the correct answers and a
            short explanation for each.
          </p>

          <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
            <FeatureItem>Takes about 3–5 minutes</FeatureItem>
            <FeatureItem>One answer per question</FeatureItem>
            <FeatureItem>Instant score and full review at the end</FeatureItem>
          </ul>

          <form onSubmit={start} className="mt-8" noValidate>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Your name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="e.g. Jordan Smith"
              className="input mt-2"
              aria-invalid={touched && !valid}
              aria-describedby="name-error"
            />
            {touched && !valid && (
              <p id="name-error" className="mt-2 text-sm text-rose-600">
                Please enter your name to begin.
              </p>
            )}

            <button
              type="submit"
              disabled={!valid}
              className="btn-primary mt-6 w-full text-base"
            >
              Start Quiz
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 0 1 .75-.75h9.69L9.97 5.78a.75.75 0 1 1 1.06-1.06l5 5a.75.75 0 0 1 0 1.06l-5 5a.75.75 0 1 1-1.06-1.06l3.47-3.47H3.75A.75.75 0 0 1 3 10Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </form>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          Mission Pet Health · P&amp;L Line-Item Definitions Pop Quiz
        </p>
      </div>
    </main>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="h-5 w-5 flex-none text-brand-500"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </li>
  );
}
