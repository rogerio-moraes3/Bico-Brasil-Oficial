import React from "react";
import { Card as UiCard } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function Card({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <UiCard className={cn("p-6", className)} {...props}>
      {children}
    </UiCard>
  );
}
