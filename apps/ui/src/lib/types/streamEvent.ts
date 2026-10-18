interface StreamEvent {
  id: string;
  type: string;
  timestamp: string;
  description: string;
  severity?: "info" | "warning" | "error";
}

export type { StreamEvent };
