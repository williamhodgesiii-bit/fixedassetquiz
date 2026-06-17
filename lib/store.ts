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

// Different Vercel/Upstash integrations inject the REST credentials under
// different names (e.g. UPSTASH_REDIS_REST_URL/TOKEN, KV_REST_API_URL/TOKEN, or
// a custom-prefixed pair). Resolve them robustly so it "just works" regardless.
function resolveRedisCreds(): { url: string; token: string } | null {
  const env = process.env;
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      url: env.UPSTASH_REDIS_REST_URL,
      token: env.UPSTASH_REDIS_REST_TOKEN,
    };
  }
  if (env.KV_REST_API_URL && env.KV_REST_API_TOKEN) {
    return { url: env.KV_REST_API_URL, token: env.KV_REST_API_TOKEN };
  }
  // Generic fallback: any *_URL holding an https REST endpoint that has a
  // sibling *_TOKEN (URL -> TOKEN). This matches prefixed Upstash/KV pairs and
  // avoids the redis:// protocol URL and read-only tokens.
  for (const key of Object.keys(env)) {
    const val = env[key];
    if (!val || !/^https:\/\//.test(val) || !/URL$/.test(key)) continue;
    const token = env[key.replace(/URL$/, "TOKEN")];
    if (token) return { url: val, token };
  }
  return null;
}

// Names of any storage-related env vars present, for diagnostics (names only,
// never values — names aren't secret, tokens are).
export function detectedStorageEnvKeys(): string[] {
  return Object.keys(process.env)
    .filter((k) => /UPSTASH|KV_|REDIS/i.test(k))
    .sort();
}

const creds = resolveRedisCreds();

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

const redis = creds ? new Redis({ url: creds.url, token: creds.token }) : null;

export const usingRedis = !!creds;

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
