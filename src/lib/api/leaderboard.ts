/**
 * @fileoverview Data access layer for leaderboard and programme stats.
 * Swap mock implementations for Supabase when ready.
 */

import type { LeaderboardEntry } from "../types";
import { getLeaderboard as mock_getLeaderboard } from "../mock-data";

export function getLeaderboardEntries(): LeaderboardEntry[] {
  return mock_getLeaderboard();
}
