import { NextResponse } from "next/server";
import { questions } from "@/lib/questions";
import { clearSubmissions, getAllSubmissions } from "@/lib/store";

export const dynamic = "force-dynamic";

// Default admin password is "results". Set an ADMIN_KEY env var in Vercel to
// override it with something stronger (the env var always takes precedence).
const DEFAULT_ADMIN_KEY = "results";

function isAuthorized(req: Request): boolean {
  const adminKey = process.env.ADMIN_KEY || DEFAULT_ADMIN_KEY;

  const header =
    req.headers.get("x-admin-key") ??
    req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    "";

  const url = new URL(req.url);
  const query = url.searchParams.get("key") ?? "";

  return header === adminKey || query === adminKey;
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const submissions = await getAllSubmissions();

  // Sort newest first.
  submissions.sort(
    (a, b) =>
      new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Summary stats.
  const responses = submissions.length;
  const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
  const totalPossible = submissions.reduce((sum, s) => sum + s.total, 0);
  const averageScore = responses ? totalScore / responses : 0;
  const averagePercent = totalPossible
    ? (totalScore / totalPossible) * 100
    : 0;

  // Per-question analytics across the whole 20-question bank.
  const analytics = questions.map((q) => {
    let appeared = 0;
    let correct = 0;
    for (const s of submissions) {
      if (Object.prototype.hasOwnProperty.call(s.perQuestionCorrect, q.id)) {
        appeared++;
        if (s.perQuestionCorrect[q.id]) correct++;
      }
    }
    return {
      id: q.id,
      part: q.part,
      question: q.question,
      appeared,
      correct,
      correctRate: appeared ? (correct / appeared) * 100 : null,
    };
  });

  // Worst-to-best so the manager sees weakest concepts first.
  // Questions that never appeared sort to the bottom.
  analytics.sort((a, b) => {
    if (a.correctRate === null && b.correctRate === null) return a.id - b.id;
    if (a.correctRate === null) return 1;
    if (b.correctRate === null) return -1;
    return a.correctRate - b.correctRate;
  });

  return NextResponse.json({
    summary: { responses, averageScore, averagePercent },
    submissions: submissions.map((s) => ({
      id: s.id,
      name: s.name,
      score: s.score,
      total: s.total,
      submittedAt: s.submittedAt,
    })),
    analytics,
  });
}

// Admin-only: permanently clear all recorded submissions.
export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  await clearSubmissions();
  return NextResponse.json({ ok: true });
}
