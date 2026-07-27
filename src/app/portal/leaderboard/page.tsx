"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLeaderboardEntries } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";

type Period = "month" | "quarter" | "year" | "all";

export default function LeaderboardPage() {
  const loading = useRequireRole("referrer");
  const [period, setPeriod] = useState<Period>("all");

  if (loading) return <LoadingSpinner />;

  const leaderboard = getLeaderboardEntries();

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-bold sm:text-2xl">Leaderboard</h1>
      <p className="mt-1 text-sm text-muted">Ranked by won projects. Aggregate data only.</p>

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1 sm:mt-6">
        {(["month", "quarter", "year", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              period === p ? "bg-gold text-dark" : "border border-border text-muted hover:border-gold/50"
            }`}
          >
            {p === "all" ? "All Time" : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[400px]">
          <thead>
            <tr className="border-b border-border bg-card/50 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-3 sm:px-4">Rank</th>
              <th className="px-3 py-3 sm:px-4">Partner</th>
              <th className="px-3 py-3 text-center sm:px-4">Qualified</th>
              <th className="px-3 py-3 text-center sm:px-4">Won</th>
              <th className="px-3 py-3 text-right sm:px-4">Earned</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.rank}
                className={`border-b border-border/50 transition hover:bg-card/30 ${i === 0 ? "bg-gold/5" : ""}`}
              >
                <td className="px-3 py-3 sm:px-4">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </td>
                <td className="px-3 py-3 font-medium sm:px-4">{entry.display_name}</td>
                <td className="px-3 py-3 text-center text-muted sm:px-4">{entry.qualified_leads}</td>
                <td className="px-3 py-3 text-center font-semibold text-success sm:px-4">{entry.won_referrals}</td>
                <td className="px-3 py-3 text-right font-mono text-gold sm:px-4">
                  {entry.total_payout > 0 ? `£${entry.total_payout}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Only approved referrers can see this leaderboard. Rankings reward quality over quantity.
      </p>
    </main>
  );
}
