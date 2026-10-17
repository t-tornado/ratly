import { cn } from "../../lib/utils";
import { Logo } from "../Logo";
import { ThemeToggle } from "../ThemeToggle";

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
        "flex items-center gap-4 px-7 py-3.5 border-b border-border-default bg-bg-surface",
        className
      )}
      style={{ height: PAGE_HEADER_HEIGHT }}
      {...props}
    >
      <div className="flex items-center gap-4 shrink-0">
        <Logo size={LOGO_SIZE} showWordmark />
      </div>
      {children && (
        <div className="flex items-center gap-4 overflow-hidden">
          {children}
        </div>
      )}
      <div className="flex-1" />
      <div className="flex items-center gap-3 shrink-0">
        {rightSlot}
        <ThemeToggle />
      </div>
    </header>
  );
}

export { PageHeader, PAGE_HEADER_HEIGHT, type PageHeaderProps };
