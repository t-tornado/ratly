import { Logo } from "../Logo";
import { cn } from "../../lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

function LoadingScreen({ message = "Loading", className }: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center h-screen bg-bg-base gap-6",
        className,
      )}
    >
      <Logo size={40} />
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-1.5">
          <span className="size-1.5 rounded-full bg-accent-blue animate-[loading-dot_1.4s_ease-in-out_infinite]" />
          <span className="size-1.5 rounded-full bg-accent-blue animate-[loading-dot_1.4s_ease-in-out_0.2s_infinite]" />
          <span className="size-1.5 rounded-full bg-accent-blue animate-[loading-dot_1.4s_ease-in-out_0.4s_infinite]" />
        </div>
        <p className="text-sm text-text-muted">{message}</p>
      </div>
    </div>
  );
}

export { LoadingScreen, type LoadingScreenProps };
