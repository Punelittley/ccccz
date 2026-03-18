import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./utils";

type ButtonVariant = "default" | "secondary" | "outline" | "ghost" | "destructive";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

function getButtonClasses(variant: ButtonVariant, size: ButtonSize): string {
  const base = "ui-btn";
  const variants: Record<ButtonVariant, string> = {
    default: "ui-btn--default",
    secondary: "ui-btn--secondary",
    outline: "ui-btn--outline",
    ghost: "ui-btn--ghost",
    destructive: "ui-btn--outline ui-btn--destructive",
  };
  const sizes: Record<ButtonSize, string> = {
    default: "",
    sm: "ui-btn--sm",
    lg: "",
    icon: "ui-btn--sm",
  };
  return cn(base, variants[variant], sizes[size]);
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(getButtonClasses(variant, size), className)}
      {...props}
    />
  );
}

export { Button };
