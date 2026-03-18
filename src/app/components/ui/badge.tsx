import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: BadgeVariant;
  asChild?: boolean;
}

function getBadgeClasses(variant: BadgeVariant): string {
  const base = "ui-badge";
  const variants: Record<BadgeVariant, string> = {
    default: "ui-badge--default",
    secondary: "ui-badge--secondary",
    destructive: "ui-badge--default",
    outline: "ui-badge--secondary",
  };
  return cn(base, variants[variant]);
}

function Badge({ className, variant = "default", asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(getBadgeClasses(variant), className)}
      {...props}
    />
  );
}

export { Badge };
