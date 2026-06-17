import { NextResponse } from "next/server";
import { questions, QUIZ_SIZE, shuffle } from "@/lib/questions";

export const dynamic = "force-dynamic";

// Returns QUIZ_SIZE random questions WITHOUT the correct-answer field.
// Correct answers never leave the server — grading happens in /api/submit.
export async function GET() {
  const selected = shuffle(questions).slice(0, QUIZ_SIZE);

  const safe = selected.map((q) => ({
    id: q.id,
    part: q.part,
    question: q.question,
    options: q.options,
  }));

  return NextResponse.json({ questions: safe });
}
