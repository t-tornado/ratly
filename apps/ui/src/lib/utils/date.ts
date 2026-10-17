function formatTime(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeWithSeconds(epochMs: number): string {
  return new Date(epochMs).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatRelativeTime(epochMs: number): string {
  const diffSeconds = Math.floor((Date.now() - epochMs) / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s ago`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

function formatCountdown(epochMs: number | null): string {
  if (!epochMs) return "—";
  const diffSeconds = Math.max(0, Math.floor((epochMs - Date.now()) / 1000));
  if (diffSeconds === 0) return "now";
  const minutes = Math.floor(diffSeconds / 60);
  const seconds = diffSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

export { formatTime, formatTimeWithSeconds, formatRelativeTime, formatCountdown };
