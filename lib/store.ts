import { Redis } from "@upstash/redis";

export type StoredAnswer = { id: number; choiceIndex: number };

export type Submission = {
  id: string;
  name: string;
  score: number;
  total: number;
  answers: StoredAnswer[];
  // Map of question id -> whether the user answered it correctly.
  perQuestionCorrect: Record<number, boolean>;
  submittedAt: string; // ISO timestamp
};

const REDIS_KEY = "mph:submissions";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback so the app runs locally with zero setup. This is NOT
// persisted across restarts and is per-instance — Upstash is used in prod.
const globalForStore = globalThis as unknown as {
  __mphSubmissions?: Submission[];
};
if (!globalForStore.__mphSubmissions) {
  globalForStore.__mphSubmissions = [];
}

const redis = hasUpstash
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

export const usingRedis = hasUpstash;

export async function saveSubmission(submission: Submission): Promise<void> {
  if (redis) {
    // Newest first: push onto the head of the list.
    await redis.lpush(REDIS_KEY, JSON.stringify(submission));
  } else {
    globalForStore.__mphSubmissions!.unshift(submission);
  }
}

export async function getAllSubmissions(): Promise<Submission[]> {
  if (redis) {
    const raw = await redis.lrange<string | Submission>(REDIS_KEY, 0, -1);
    return raw.map((item) =>
      typeof item === "string" ? (JSON.parse(item) as Submission) : item
    );
  }
  return [...globalForStore.__mphSubmissions!];
}
