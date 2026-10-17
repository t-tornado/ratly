import { type ComponentPropsWithoutRef, type ElementType } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const typographyVariants = cva("", {
  variants: {
    variant: {
      h1: "text-5xl font-semibold leading-tight font-sans",
      h2: "text-3xl font-semibold font-mono",
      h3: "text-2xl font-semibold leading-none",
      body: "text-base-sm",
      bodySm: "text-base-sm leading-normal",
      label: "text-sm",
      labelSm: "text-xs",
      caption: "text-sm font-medium uppercase tracking-wider",
      tableHeader: "text-sm uppercase tracking-wide",
      code: "text-sm leading-relaxed font-mono",
      mono: "text-base-sm font-mono",
      value: "text-2xl font-mono",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

type TypographyProps<T extends ElementType = "p"> = {
  as?: T;
  variant?: TypographyVariant;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "variant">;

function Typography<T extends ElementType = "p">({
  as,
  variant = "body",
  className,
  ...props
}: TypographyProps<T>) {
  const Component = as ?? "p";
  return (
    <Component
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Typography, type TypographyProps, type TypographyVariant };
