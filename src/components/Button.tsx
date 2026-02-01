import React from "react";
import { Button as UiButton, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type LegacyVariant = "primary" | "secondary" | "outline";

interface LegacyButtonProps extends Omit<ButtonProps, "variant"> {
  icon?: React.ReactNode;
  variant?: LegacyVariant;
}

const legacyVariantMap: Record<LegacyVariant, ButtonProps["variant"]> = {
  primary: "default",
  secondary: "secondary",
  outline: "outline",
};

export function Button({ children, icon, className, variant = "primary", ...props }: LegacyButtonProps) {
  return (
    <UiButton variant={legacyVariantMap[variant]} className={cn("gap-2", className)} {...props}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </UiButton>
  );
}
