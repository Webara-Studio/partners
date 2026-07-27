"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { getLeaderboard } from "@/lib/mock-data";

type Period = "month" | "quarter" | "year" | "all";

export default function LeaderboardPage() {
  const loading = useRequireRole("referrer");
  const [period, setPeriod] = useState<Period>("all");

  if (loading) return <LoadingSpinner />;

  const leaderboard = getLeaderboard();

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-8">
      <h1 className="text-2xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-sm text-muted">
        Ranked by won projects. Aggregate data only — no prospect details are shown.
      </p>

      {/* Period selector */}
      <div className="mt-6 flex gap-2">
        {(["month", "quarter", "year", "all"] as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              period === p
                ? "bg-gold text-dark"
                : "border border-border text-muted hover:border-gold/50"
            }`}
          >
            {p === "all" ? "All Time" : `This ${p.charAt(0).toUpperCase() + p.slice(1)}`}
          </button>
        ))}
      </div>

      {/* Leaderboard table */}
      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-card/50 text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-4 py-3">Rank</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3 text-center">Qualified</th>
              <th className="px-4 py-3 text-center">Won</th>
              <th className="px-4 py-3 text-right">Earned</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, i) => (
              <tr
                key={entry.rank}
                className={`border-b border-border/50 transition hover:bg-card/30 ${
                  i === 0 ? "bg-gold/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                </td>
                <td className="px-4 py-3 font-medium">{entry.display_name}</td>
                <td className="px-4 py-3 text-center text-muted">{entry.qualified_leads}</td>
                <td className="px-4 py-3 text-center font-semibold text-success">{entry.won_referrals}</td>
                <td className="px-4 py-3 text-right font-mono text-gold">
                  {entry.total_payout > 0 ? `£${entry.total_payout}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Only approved referrers can see this leaderboard. Rankings are based on won projects,
        not raw submissions, to reward quality over quantity.
      </p>
    </main>
  );
}

function LoadingSpinner() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold border-t-transparent" />
    </main>
  );
}
