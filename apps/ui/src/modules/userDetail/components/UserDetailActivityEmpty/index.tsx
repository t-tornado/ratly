import { BarChart3 } from "lucide-react";

function UserDetailActivityEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="w-10 h-10 rounded-lg bg-bg-hover flex items-center justify-center">
        <BarChart3 className="w-5 h-5 text-text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">
          No activity recorded
        </p>
        <p className="text-xs text-text-muted mt-1 max-w-56">
          Request activity will be charted here once this user starts making
          requests
        </p>
      </div>
    </div>
  );
}

export { UserDetailActivityEmpty };
