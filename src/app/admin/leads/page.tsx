"use client";

import { useState } from "react";
import { useRequireRole } from "@/lib/use-require-auth";
import { getAllLeadsAdmin } from "@/lib/api";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PageHeader } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import Link from "next/link";
import type { LeadStatus } from "@/lib/types";

type FilterStatus = LeadStatus | "all";

export default function AdminLeadsPage() {
  const loading = useRequireRole("admin");
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");

  if (loading) return <LoadingSpinner />;

  let leads = getAllLeadsAdmin();

  if (filter !== "all") leads = leads.filter((l) => l.status === filter);
  if (search) {
    const q = search.toLowerCase();
    leads = leads.filter(
      (l) => l.prospect_name.toLowerCase().includes(q) || (l.business_name || "").toLowerCase().includes(q) || l.prospect_phone.includes(q)
    );
  }

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: "all", label: "All" },
    { value: "submitted", label: "New" },
    { value: "under_review", label: "Review" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal_sent", label: "Proposal" },
    { value: "won", label: "Won" },
  ];

  return (
    <main className="mx-auto max-w-[var(--max)] px-4 py-6 sm:px-6 sm:py-8">
      <PageHeader title="Lead Queue" subtitle="All leads across all referrers." />

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, phone, business..."
          className="input flex-1"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filter === opt.value ? "bg-gold text-dark" : "border border-border text-muted hover:border-gold/50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted">
              <th className="px-3 py-3">Prospect</th>
              <th className="px-3 py-3">Referrer</th>
              <th className="px-3 py-3">Type</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-sm text-muted">
                  No leads match your filters.
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="border-b border-border/50 transition hover:bg-card/30">
                  <td className="px-3 py-3">
                    <Link href={`/admin/leads/${lead.id}`} className="font-medium hover:text-gold">
                      {lead.prospect_name}
                    </Link>
                    <p className="text-xs text-muted">{lead.business_name || lead.prospect_phone}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-muted">{lead.referrer_id}</td>
                  <td className="px-3 py-3 text-xs text-muted">{lead.project_type.replace("_", " ")}</td>
                  <td className="px-3 py-3"><StatusBadge status={lead.status} /></td>
                  <td className="px-3 py-3 text-xs text-muted">
                    {new Date(lead.submitted_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
