type ActivityRange = "hour" | "day";

interface ActivityBucket {
  timestamp: string;
  allowed: number;
  rejected: number;
}

type ActivityResponse = ActivityBucket[];

export type { ActivityRange, ActivityBucket, ActivityResponse };
