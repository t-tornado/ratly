import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";

const toastVariants = cva(
  "flex items-start gap-3 rounded-xl border px-4 py-3",
  {
    variants: {
      variant: {
        success:
          "bg-success-bg border-success-border text-success-text",
        error:
          "bg-error-surface border-error-border text-error-text",
      },
    },
    defaultVariants: {
      variant: "success",
    },
  }
);

interface ToastProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof toastVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

function Toast({
  variant,
  title,
  description,
  action,
  children,
  className,
  ...props
}: ToastProps) {
  return (
    <div
      role="status"
      className={cn(toastVariants({ variant, className }))}
      {...props}
    >
      {variant === "error" && (
        <Icon variant="alert-circle" className="text-error shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        {title && <div className="font-semibold">{title}</div>}
        {description && (
          <div className="text-base-sm mt-0.5 opacity-80">{description}</div>
        )}
        {children}
      </div>
      {action}
    </div>
  );
}

export { Toast };
