/**
 * @fileoverview Data access layer for leaderboard.
 * Uses Supabase RPC for aggregate-only data.
 */

import type { LeaderboardEntry } from "../types";
import { createClient } from "../supabase/client";

const supabase = createClient();

export async function getLeaderboardEntries(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase.rpc("webara_get_leaderboard");

  if (error) return [];
  return data as LeaderboardEntry[];
}
