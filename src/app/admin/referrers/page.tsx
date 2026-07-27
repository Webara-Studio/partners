"use client";

import { useRequireRole } from "@/lib/use-require-auth";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/ui";
import { mockReferrerUser } from "@/lib/mock-data";
import type { ReferrerStatus } from "@/lib/types";

export default function AdminReferrersPage() {
  const loading = useRequireRole("admin");

  if (loading) return <LoadingSpinner />;

  const referrers = [
    { ...mockReferrerUser, referral_code: "OZY100", programme_status: "approved" as ReferrerStatus, leads: 4, won: 1 },
    { id: "u-dev-002", display_name: "Sarah K.", email: "sarah@example.com", referral_code: "SAR50", programme_status: "approved" as ReferrerStatus, leads: 2, won: 1 },
    { id: "u-pen-003", display_name: "Marcus T.", email: "marcus@example.com", referral_code: "MAR33", programme_status: "pending" as ReferrerStatus, leads: 0, won: 0 },
    { id: "u-pen-004", display_name: "Linda M.", email: "linda@example.com", referral_code: "LIN22", programme_status: "pending" as ReferrerStatus, leads: 0, won: 0 },
  ];

  const pending = referrers.filter((r) => r.programme_status === "pending");
  const active = referrers.filter((r) => r.programme_status === "approved");

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Referrers" subtitle="Approve, suspend, and manage partner accounts." />

      {pending.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-warning">
            Pending Approval ({pending.length})
          </h2>
          <div className="mt-3 space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/5 px-4 py-3">
                <div>
                  <p className="font-medium">{r.display_name}</p>
                  <p className="text-xs text-muted">{r.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-dark transition hover:opacity-90">Approve</button>
                  <button className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Active Referrers</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Code</th>
                <th className="px-3 py-3 text-center">Leads</th>
                <th className="px-3 py-3 text-center">Won</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {active.map((r) => (
                <tr key={r.id} className="border-b border-border/50">
                  <td className="px-3 py-3">
                    <p className="font-medium">{r.display_name}</p>
                    <p className="text-xs text-muted">{r.email}</p>
                  </td>
                  <td className="px-3 py-3 font-mono text-xs text-gold">{r.referral_code}</td>
                  <td className="px-3 py-3 text-center text-muted">{r.leads}</td>
                  <td className="px-3 py-3 text-center font-semibold text-success">{r.won}</td>
                  <td className="px-3 py-3">
                    <span className="rounded-full bg-success/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-success">Approved</span>
                  </td>
                  <td className="px-3 py-3">
                    <button className="text-xs text-danger transition hover:underline">Suspend</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
