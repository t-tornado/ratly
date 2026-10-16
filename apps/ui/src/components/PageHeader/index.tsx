import { cn } from "../../lib/utils";
import { Logo } from "../Logo";

const PAGE_HEADER_HEIGHT = 56;
const LOGO_SIZE = 22;

interface PageHeaderProps extends React.ComponentProps<"header"> {
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
}

function PageHeader({
  children,
  rightSlot,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <header
      data-testid="page-header"
      className={cn(
        "flex flex-wrap items-center gap-4 px-7 py-3.5 border-b border-[var(--color-border-default)] bg-[var(--color-bg-surface)]",
        className
      )}
      style={{ height: PAGE_HEADER_HEIGHT }}
      {...props}
    >
      <Logo size={LOGO_SIZE} showWordmark />
      {children}
      <div className="flex-1" />
      {rightSlot}
    </header>
  );
}

export { PageHeader, PAGE_HEADER_HEIGHT, type PageHeaderProps };
