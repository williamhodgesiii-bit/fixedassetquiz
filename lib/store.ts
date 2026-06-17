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
const ROUND_KEY = "mph:round";

const hasUpstash =
  !!process.env.UPSTASH_REDIS_REST_URL && !!process.env.UPSTASH_REDIS_REST_TOKEN;

// In-memory fallback so the app runs locally with zero setup. This is NOT
// persisted across restarts and is per-instance — Upstash is used in prod.
const globalForStore = globalThis as unknown as {
  __mphSubmissions?: Submission[];
  __mphRound?: number;
};
if (!globalForStore.__mphSubmissions) {
  globalForStore.__mphSubmissions = [];
}
if (typeof globalForStore.__mphRound !== "number") {
  globalForStore.__mphRound = 1;
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

// Permanently delete all submissions. Admin-only — used by the reset control.
export async function clearSubmissions(): Promise<void> {
  if (redis) {
    await redis.del(REDIS_KEY);
  } else {
    globalForStore.__mphSubmissions = [];
  }
}

// The current quiz "round". Each reset bumps this; devices store the round
// they last completed, so bumping it unlocks every device for a fresh attempt.
export async function getRound(): Promise<number> {
  if (redis) {
    const v = await redis.get<number>(ROUND_KEY);
    return typeof v === "number" ? v : 1;
  }
  return globalForStore.__mphRound!;
}

export async function bumpRound(): Promise<number> {
  if (redis) {
    const exists = await redis.exists(ROUND_KEY);
    if (!exists) {
      await redis.set(ROUND_KEY, 2);
      return 2;
    }
    return await redis.incr(ROUND_KEY);
  }
  return (globalForStore.__mphRound = globalForStore.__mphRound! + 1);
}
