import { cn } from "../../lib/utils";

interface ModalPreviewBoxProps {
  children: React.ReactNode;
  className?: string;
}

function ModalPreviewBox({ children, className }: ModalPreviewBoxProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border-strong bg-bg-base px-3 py-2.5 text-base-sm text-text-secondary",
        className
      )}
    >
      {children}
    </div>
  );
}

export { ModalPreviewBox };
export type { ModalPreviewBoxProps };
