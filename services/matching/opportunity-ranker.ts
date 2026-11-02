import { IOpportunityMatchResult, IMatchingFilters } from "@/types/matching";

/**
 * Filters, sorts, and paginates matched opportunities.
 */
export function rankAndFilterOpportunities(
  matches: IOpportunityMatchResult[],
  filters: IMatchingFilters = {}
): {
  items: IOpportunityMatchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} {
  let filtered = [...matches];

  // 1. Filter by Category
  if (filters.category && filters.category !== "all") {
    filtered = filtered.filter(
      (m) => m.opportunity.category === filters.category
    );
  }

  // 2. Filter by Work Mode
  if (filters.workMode && filters.workMode !== "all") {
    filtered = filtered.filter(
      (m) => m.opportunity.workMode === filters.workMode
    );
  }

  // 3. Filter by Eligibility Status
  if (filters.eligibility && filters.eligibility !== "all") {
    filtered = filtered.filter(
      (m) => m.eligibilityStatus === filters.eligibility
    );
  }

  // 4. Sorting
  const sortBy = filters.sortBy || "score";

  filtered.sort((a, b) => {
    // Primary Sort
    if (sortBy === "score") {
      // Eligible opportunities rank first, then potentially eligible, then ineligible
      const statusWeight = {
        eligible: 3,
        potentially_eligible: 2,
        insufficient_information: 1,
        not_eligible: 0,
      };

      const statusDiff =
        (statusWeight[b.eligibilityStatus] || 0) -
        (statusWeight[a.eligibilityStatus] || 0);

      if (statusDiff !== 0) return statusDiff;

      // Higher overallScore ranks first
      return b.overallScore - a.overallScore;
    }

    if (sortBy === "deadline") {
      const dateA = a.opportunity.applicationDeadline
        ? new Date(a.opportunity.applicationDeadline).getTime()
        : Infinity;
      const dateB = b.opportunity.applicationDeadline
        ? new Date(b.opportunity.applicationDeadline).getTime()
        : Infinity;
      return dateA - dateB;
    }

    if (sortBy === "newest") {
      const dateA = a.opportunity.publishedAt
        ? new Date(a.opportunity.publishedAt).getTime()
        : 0;
      const dateB = b.opportunity.publishedAt
        ? new Date(b.opportunity.publishedAt).getTime()
        : 0;
      return dateB - dateA;
    }

    return 0;
  });

  // 5. Pagination
  const total = filtered.length;
  const page = Math.max(1, filters.page || 1);
  const limit = Math.max(1, Math.min(50, filters.limit || 10));
  const totalPages = Math.ceil(total / limit) || 1;

  const startIndex = (page - 1) * limit;
  const paginatedItems = filtered.slice(startIndex, startIndex + limit);

  return {
    items: paginatedItems,
    total,
    page,
    limit,
    totalPages,
  };
}

