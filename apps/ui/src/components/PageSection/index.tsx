import { cn } from "../../lib/utils";

interface PageSectionProps extends React.ComponentProps<"section"> {
  children: React.ReactNode;
}

function PageSection({ children, className, ...props }: PageSectionProps) {
  return (
    <section
      data-testid="page-section"
      className={cn("overflow-y-auto overflow-x-hidden px-7 pt-5", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export { PageSection, type PageSectionProps };
