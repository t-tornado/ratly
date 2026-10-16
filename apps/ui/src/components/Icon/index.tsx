import { cn } from "../../lib/utils";

interface IconProps extends React.ComponentProps<"svg"> {
  variant: "activity-pulse" | "search" | "alert-circle";
  size?: number;
}

const paths: Record<IconProps["variant"], React.ReactNode> = {
  "activity-pulse": <path d="M3 12h4l3-8 4 16 3-8h4" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  "alert-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.5" />
    </>
  ),
};

function Icon({ variant, size = 18, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      {paths[variant]}
    </svg>
  );
}

export { Icon };
