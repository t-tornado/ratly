import type { ThrottlingDuration } from "../../../components/ThrottlingModal";

const THROTTLE_DURATION_SECONDS: Record<ThrottlingDuration, number> = {
  "15m": 15 * 60,
  "1h": 60 * 60,
  "24h": 24 * 60 * 60,
};

function throttleDurationToSeconds(duration: ThrottlingDuration): number {
  return THROTTLE_DURATION_SECONDS[duration];
}

export { throttleDurationToSeconds };
export type { ThrottlingDuration };
