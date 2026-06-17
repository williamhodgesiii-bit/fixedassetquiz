import { NextResponse } from "next/server";
import { questions } from "@/lib/questions";
import { saveSubmission, type StoredAnswer, type Submission } from "@/lib/store";

export const dynamic = "force-dynamic";

const bankById = new Map(questions.map((q) => [q.id, q]));

export async function POST(req: Request) {
  let body: { name?: string; answers?: StoredAnswer[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const answers = Array.isArray(body.answers) ? body.answers : [];

  if (!name) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (answers.length === 0) {
    return NextResponse.json({ error: "No answers submitted." }, { status: 400 });
  }

  // Grade on the server against the full bank.
  let score = 0;
  const perQuestionCorrect: Record<number, boolean> = {};
  const review = [];

  for (const a of answers) {
    const q = bankById.get(a.id);
    if (!q) continue;
    const correct = a.choiceIndex === q.correctIndex;
    if (correct) score++;
    perQuestionCorrect[q.id] = correct;

    review.push({
      id: q.id,
      part: q.part,
      question: q.question,
      options: q.options,
      yourChoiceIndex: a.choiceIndex,
      correctIndex: q.correctIndex,
      correct,
      rationale: q.rationale,
    });
  }

  const total = review.length;

  const submission: Submission = {
    id: crypto.randomUUID(),
    name,
    score,
    total,
    answers,
    perQuestionCorrect,
    submittedAt: new Date().toISOString(),
  };

  try {
    await saveSubmission(submission);
  } catch (err) {
    console.error("Failed to save submission:", err);
    return NextResponse.json(
      { error: "Could not record your submission. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: submission.id, name, score, total, review });
}
