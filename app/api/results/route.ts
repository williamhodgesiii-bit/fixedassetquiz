import { NextResponse } from "next/server";
import { questions } from "@/lib/questions";
import {
  bumpRound,
  clearSubmissions,
  detectedStorageEnvKeys,
  getAllSubmissions,
  usingRedis,
} from "@/lib/store";

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

  const bankById = new Map(questions.map((q) => [q.id, q]));

  // Summary stats.
  const responses = submissions.length;
  const totalScore = submissions.reduce((sum, s) => sum + s.score, 0);
  const totalPossible = submissions.reduce((sum, s) => sum + s.total, 0);
  const averageScore = responses ? totalScore / responses : 0;
  const averagePercent = totalPossible
    ? (totalScore / totalPossible) * 100
    : 0;

  // Per-question analytics across the whole 20-question bank, including the
  // list of respondents (with whether each got it right) so the admin can
  // click into a question and see exactly who missed it.
  const analytics = questions.map((q) => {
    const respondents: {
      name: string;
      choiceIndex: number;
      correct: boolean;
      submittedAt: string;
    }[] = [];
    for (const s of submissions) {
      const answer = s.answers.find((a) => a.id === q.id);
      if (!answer) continue;
      respondents.push({
        name: s.name,
        choiceIndex: answer.choiceIndex,
        correct: !!s.perQuestionCorrect[q.id],
        submittedAt: s.submittedAt,
      });
    }
    const appeared = respondents.length;
    const correct = respondents.filter((r) => r.correct).length;
    return {
      id: q.id,
      part: q.part,
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      rationale: q.rationale,
      appeared,
      correct,
      correctRate: appeared ? (correct / appeared) * 100 : null,
      respondents,
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

  // Per-user breakdown so the admin can click into a person and see exactly
  // which questions they got right and wrong.
  const enrichedSubmissions = submissions.map((s) => ({
    id: s.id,
    name: s.name,
    score: s.score,
    total: s.total,
    submittedAt: s.submittedAt,
    breakdown: s.answers.map((a) => {
      const q = bankById.get(a.id);
      return {
        id: a.id,
        part: q?.part ?? "",
        question: q?.question ?? `Question ${a.id}`,
        options: q?.options ?? [],
        yourChoiceIndex: a.choiceIndex,
        correctIndex: q?.correctIndex ?? -1,
        correct: !!s.perQuestionCorrect[a.id],
      };
    }),
  }));

  return NextResponse.json({
    storage: usingRedis ? "redis" : "memory",
    detectedEnvKeys: usingRedis ? [] : detectedStorageEnvKeys(),
    summary: { responses, averageScore, averagePercent },
    submissions: enrichedSubmissions,
    analytics,
  });
}

// Admin-only: clear all recorded submissions AND start a new round, which
// unlocks every device so the whole team can take the quiz again.
export async function DELETE(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }
  await clearSubmissions();
  const round = await bumpRound();
  return NextResponse.json({ ok: true, round });
}
