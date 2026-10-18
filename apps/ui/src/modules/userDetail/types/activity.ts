type ActivityRange = "hour" | "day";

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

export type { ActivityRange, ActivityBucket, ActivityApiResponse };
