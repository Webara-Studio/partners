/**
 * Barrel export for the data access layer.
 * Pages import from "@/lib/api" — never from mock-data directly.
 */

export {
  getLeadsForReferrer,
  getLead,
  getLeadEvents,
  getAllLeadsAdmin,
  checkDuplicate,
  submitLead,
  updateLeadStatus,
} from "./leads";

export {
  getCommissionsForReferrer,
  getPayoutsForReferrer,
  getCommissionForLead,
} from "./commissions";

export { getLeaderboardEntries } from "./leaderboard";
