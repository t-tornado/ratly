type ActivityRange = "hour" | "day";
type RefreshOption = "off" | "30s" | "1m" | "5m";

interface ActivityBucket {
  timestamp: string;
  allowed: number;
  rejected: number;
}

interface ActivityApiResponse {
  range: ActivityRange;
  bucketSize: string;
  buckets: Array<{ time: string; allowed: number; rejected: number }>;
}

export type { ActivityRange, ActivityBucket, ActivityApiResponse, RefreshOption };
