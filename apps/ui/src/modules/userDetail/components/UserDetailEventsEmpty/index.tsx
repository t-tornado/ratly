import { Radio } from "lucide-react";

function UserDetailEventsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center min-h-48">
      <div className="w-10 h-10 rounded-lg bg-bg-hover flex items-center justify-center">
        <Radio className="w-5 h-5 text-text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">
          No events yet
        </p>
        <p className="text-xs text-text-muted mt-1 max-w-48">
          Events will appear here as requests come in
        </p>
      </div>
    </div>
  );
}

export { UserDetailEventsEmpty };
