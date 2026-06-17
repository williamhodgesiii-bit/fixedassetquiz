import { NextResponse } from "next/server";
import { getRound } from "@/lib/store";

export const dynamic = "force-dynamic";

// Public: the current quiz round. Clients compare this to the round they last
// completed to decide whether this device is locked or free to take the quiz.
export async function GET() {
  const round = await getRound();
  return NextResponse.json({ round });
}
