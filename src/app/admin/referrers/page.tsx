"use client";

import { useRequireRole } from "@/lib/use-require-auth";
import { mockReferrerUser } from "@/lib/mock-data";
import type { ReferrerStatus } from "@/lib/types";

export default function AdminReferrersPage() {
  const loading = useRequireRole("admin");

  if (loading) return <LoadingSpinner />;

  // Mock referrer data
  const referrers = [
    { ...mockReferrerUser, referral_code: "OZY100", programme_status: "approved" as ReferrerStatus, leads: 4, won: 1 },
    { id: "u-dev-002", display_name: "Sarah K.", email: "sarah@example.com", referral_code: "SAR50", programme_status: "approved" as ReferrerStatus, leads: 2, won: 1 },
    { id: "u-pen-003", display_name: "Marcus T.", email: "marcus@example.com", referral_code: "MAR33", programme_status: "pending" as ReferrerStatus, leads: 0, won: 0 },
    { id: "u-pen-004", display_name: "Linda M.", email: "linda@example.com", referral_code: "LIN22", programme_status: "pending" as ReferrerStatus, leads: 0, won: 0 },
  ];

  return (
    <main className="mx-auto max-w-[var(--max)] px-6 py-8">
      <h1 className="text-2xl font-bold">Referrers</h1>
      <p className="mt-1 text-sm text-muted">Approve, suspend, and manage partner accounts.</p>

      {/* Pending approvals */}
      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-warning">
          Pending Approval ({referrers.filter((r) => r.programme_status === "pending").length})
        </h2>
        <div className="mt-3 space-y-2">
          {referrers
            .filter((r) => r.programme_status === "pending")
            .map((referrer) => (
              <div
                key={referrer.id}
                className="flex items-center justify-between rounded-xl border border-warning/30 bg-warning/5 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{referrer.display_name}</p>
                  <p className="text-xs text-muted">{referrer.email}</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-dark transition hover:opacity-90">
                    Approve
                  </button>
                  <button className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-medium text-danger transition hover:bg-danger/10">
                    Reject
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Active referrers */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
          Active Referrers
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full">
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
              {referrers
                .filter((r) => r.programme_status === "approved")
                .map((referrer) => (
                  <tr key={referrer.id} className="border-b border-border/50">
                    <td className="px-3 py-3">
                      <p className="font-medium">{referrer.display_name}</p>
                      <p className="text-xs text-muted">{referrer.email}</p>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs text-gold">{referrer.referral_code}</td>
                    <td className="px-3 py-3 text-center text-muted">{referrer.leads}</td>
                    <td className="px-3 py-3 text-center font-semibold text-success">{referrer.won}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-success/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-success">
                        Approved
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="text-xs text-danger transition hover:underline">
                        Suspend
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
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
