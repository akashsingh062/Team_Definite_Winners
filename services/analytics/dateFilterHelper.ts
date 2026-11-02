import { AnalyticsTimeRange, IAnalyticsDateFilter, IDateRangeBoundaries } from "@/types/analytics";

/**
 * Parses and validates an analytics date filter into start and end Date objects.
 */
export function resolveDateRange(filter?: IAnalyticsDateFilter): IDateRangeBoundaries {
  const now = new Date();
  const range: AnalyticsTimeRange = filter?.range || "30d";

  switch (range) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return { start, end, label: "Today" };
    }

    case "7d": {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { start, end: now, label: "Last 7 Days" };
    }

    case "30d": {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start, end: now, label: "Last 30 Days" };
    }

    case "90d": {
      const start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return { start, end: now, label: "Last 90 Days" };
    }

    case "this_year": {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { start, end: now, label: `This Year (${now.getFullYear()})` };
    }

    case "all": {
      const start = new Date(0);
      return { start, end: now, label: "All Time" };
    }

    case "custom": {
      if (!filter?.startDate || !filter?.endDate) {
        // Fallback to 30d if dates not provided
        const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return { start, end: now, label: "Last 30 Days (Custom Fallback)" };
      }

      const start = new Date(filter.startDate);
      const end = new Date(filter.endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid date format provided for custom range. Please use ISO 8601 dates.");
      }

      if (start > end) {
        throw new Error("Start date must be earlier than or equal to end date.");
      }

      // If endDate is just a date string (YYYY-MM-DD), set to end of that day
      if (filter.endDate.length <= 10) {
        end.setHours(23, 59, 59, 999);
      }

      return {
        start,
        end,
        label: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`,
      };
    }

    default: {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { start, end: now, label: "Last 30 Days" };
    }
  }
}

/**
 * Builds a Mongo date filter object for a given field name (defaults to 'createdAt')
 */
export function buildMongoDateQuery(
  boundaries: IDateRangeBoundaries,
  fieldName = "createdAt"
): Record<string, any> {
  // If "all", no date restriction is required, but keeping $lte: now handles future-dated anomalies
  if (boundaries.start.getTime() === 0) {
    return { [fieldName]: { $lte: boundaries.end } };
  }

  return {
    [fieldName]: {
      $gte: boundaries.start,
      $lte: boundaries.end,
    },
  };
}

